import { GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { pick } from "@/app/pick";
import { cookies, headers } from "next/headers";
import { Endpoint } from "./endpoint";
import { localeKey, userIdKey } from "@/shared/cookies.key";
import * as util from "node:util";
import { revalidateTag } from "next/cache";

type QueryParams = Record<string, any> | URLSearchParams;
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type CacheScope = "global" | "user";

export type CacheRule = {
  /** 규칙 이름(로그/디버깅용) */
  name: string;
  /** 매칭할 경로 정규식 */
  pattern: RegExp;
  /** 캐시 TTL(sec) */
  ttl: number;
  /** 어떤 메서드에서 캐시를 적용할지 (기본 GET) */
  methods?: HttpMethod[];
  /** 이 메서드들로 들어오면 해당 태그 무효화 */
  invalidatesOn?: HttpMethod[];
  /** 태그 생성기: 정규식 match 결과와 컨텍스트로 태그 배열 생성 */
  tags: (m: RegExpMatchArray, ctx: { userId?: string }) => string[];
  /** 사용자 단위 캐시 분리 여부 (기본 global) */
  scope?: CacheScope;
  /** 캐시 요청에서 Authorization 제거 여부(기본 false) */
  stripAuth?: boolean;
  familyTag?: string;
};

// === 규칙들만 추가/수정하면 됨 ===
export const CACHE_RULES: CacheRule[] = [
  {
    name: "lesson-detail",
    // /lessons/숫자 만 매치 (뒤에 /, ?, # 허용)
    pattern: /^\/lessons\/([0-9]+)(?:[\/?#]|$)$/,
    ttl: 60, // 60초
    methods: ["GET"],
    invalidatesOn: ["PUT", "PATCH", "DELETE"],
    tags: (m) => [`lesson:${m[1]}`],
    scope: "global",
    stripAuth: false,
    familyTag: "lesson",
  },
];

export interface RequestParameters {
  path: string;
  method: string;
  query?: QueryParams;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

function convertFromJsonToQuery(input: QueryParams | undefined) {
  if (!input || (typeof input === "object" && Object.keys(input).length === 0)) return "";
  // 키 정렬로 안정화(중복 캐시 방지)
  const entries = Object.entries(input as Record<string, any>).sort(([a], [b]) => a.localeCompare(b));
  return (
    "?" +
    entries
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&")
  );
}

function matchCacheRule(path: string, method: string) {
  const mth = method.toUpperCase() as HttpMethod;
  for (const rule of CACHE_RULES) {
    const m = path.match(rule.pattern);
    if (!m) continue;
    const applies = (rule.methods ?? ["GET"]).includes(mth) || (rule.invalidatesOn ?? []).includes(mth);
    if (!applies) continue;
    return { rule, match: m };
  }
  return null;
}

export abstract class EndpointClient {
  protected endpointBuilder<
    Parameter extends Record<string, any>,
    Response extends Record<string, any>
  >(endpoint: Endpoint<Parameter, Response | GuinnessErrorCase>) {
    return async (args: Parameter): Promise<Response | GuinnessErrorCase> => {
      const path =
        typeof endpoint.path === 'string' ? endpoint.path : endpoint.path(args);

      // ✅ undefined 제거 유틸
      const clean = (obj: Record<string, any>) => {
        return Object.fromEntries(
          Object.entries(obj).filter(([_, v]) => v !== undefined)
        );
      };

      const query = clean(
        pick(args, endpoint.queryParams || ([] as any))
      );
      const body = clean(
        pick(args, endpoint.bodyParams || ([] as any))
      );

      return this.request<Response>({
        path,
        method: endpoint.method,
        query,
        body,
        headers: endpoint.headers,
      });
    };
  }


  private async authAsHeaders(): Promise<Record<string, string>> {
    const defaultHeaders: Record<string, string> = {};
    const accessToken = (await cookies()).get("accessToken");
    if (accessToken?.value) {
      defaultHeaders["Authorization"] = `Bearer ${accessToken.value}`;
    }
    const nextHeaders = await headers();
    const version = nextHeaders.get("x-guinness-version")?.valueOf();
    defaultHeaders["x-guinness-client"] = nextHeaders.get("x-guinness-client")?.valueOf() ?? "";
    defaultHeaders["x-guinness-device-name"] = nextHeaders.get("x-guinness-device-name")?.valueOf() ?? "";
    defaultHeaders["x-guinness-version"] = !version || version === "" ? "1.0.0" : version; // 여기서만 웹/앱 구분
    defaultHeaders["x-guinness-locale"] = (await cookies()).get(localeKey)?.value ?? "ko";
    return defaultHeaders;
  }

  private async request<ResponseBody>({
                                        path,
                                        method,
                                        query,
                                        body,
                                        headers = {},
                                      }: RequestParameters): Promise<ResponseBody> {
    const userId = (await cookies()).get(userIdKey)?.value;
    const url = `${process.env.GUINNESS_API_SERVER}${path}`;
    const fullUrl = query ? `${url}${convertFromJsonToQuery(query)}` : url;

    // 기본 헤더
    const authHeaders = await this.authAsHeaders();
    const baseHeaders: Record<string, string> = {
      ...authHeaders,
      ...headers,
      "Content-Type": "application/json",
    };

    // 규칙 매칭
    const hit = matchCacheRule(path, method);
    const mth = method.toUpperCase() as HttpMethod;

    // 캐시 옵션 조립
    const isGet = mth === "GET";
    const cacheOptions: (RequestInit & { next?: { revalidate?: number; tags?: string[] } }) = {
      method: mth,
      headers: { ...baseHeaders },
      cache: "no-store",
      ...(body && Object.keys(body).length > 0 && { body: JSON.stringify(body) }),
    };

    if (hit && isGet && (hit.rule.methods ?? ["GET"]).includes("GET")) {
      const tags = hit.rule.tags(hit.match, { userId });
      if ((hit.rule.scope ?? "global") === "user" && userId) {
        tags.push(`user:${userId}`);
      }
      if (hit.rule.familyTag) {
        tags.push(hit.rule.familyTag);
      }

      if (hit.rule.stripAuth) delete (cacheOptions.headers as Record<string, string>)["Authorization"];
      cacheOptions.cache = "force-cache";
      cacheOptions.next = { revalidate: hit.rule.ttl, tags };
    }

    console.log(`Request(userId:${userId})`, {
      url: fullUrl,
      options: { ...cacheOptions, headers: "omitted" },
    });

    const response = await fetch(fullUrl, cacheOptions);
    const jsonResponse = await response.json();

    // 변경 메서드면 태그 무효화
    if (hit && (hit.rule.invalidatesOn ?? []).includes(mth) && response.ok) {
      const tags = hit.rule.tags(hit.match, { userId });
      if ((hit.rule.scope ?? "global") === "user" && userId) {
        tags.push(`user:${userId}`);
      }
      try {
        tags.forEach((t) => revalidateTag(t));
      } catch (e) {
        console.warn("revalidateTag failed:", e);
      }
    }

    // if (process.env.NODE_ENV == 'production') {
      console.log(
        `Response(userId:${userId})`,
        util.inspect(jsonResponse, {depth: null, colors: false})
      );
    // }
    return jsonResponse as ResponseBody;
  }
}
