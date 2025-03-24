import { ClientOptions } from "@/app/api.client";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { pick } from "@/app/pick";
import { cookies, headers } from "next/headers";
import { Endpoint } from "./endpoint";
import { localeKey } from "@/shared/cookies.key";

type QueryParams = Record<string, any> | URLSearchParams;

export interface RequestParameters {
  path: string;
  method: string;
  query?: QueryParams;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

function convertFromJsonToQuery(input: QueryParams | undefined) {
  if (input === undefined || (typeof input === 'object' && Object.keys(input).length === 0)) {
    return "";
  }
  return '?' + Object.entries(input)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}


export abstract class EndpointClient {

  protected endpointBuilder<
    Parameter extends Record<string, any>,
    Response extends Record<string, any>
  >(endpoint: Endpoint<Parameter, Response | GuinnessErrorCase>) {
    return async (args: Parameter): Promise<Response | GuinnessErrorCase> => {
      const path =
        typeof endpoint.path === "string"
          ? endpoint.path
          : endpoint.path(args);

      return this.request<Response>({
        path,
        method: endpoint.method,
        query: pick(args, endpoint.queryParams || ([] as any)),
        body: pick(args, endpoint.bodyParams || ([] as any)),
        headers: endpoint.headers,
      });
    };
  }

  private async authAsHeaders(): Promise<Record<string, string>> {
    const defaultHeaders: Record<string, string> = {};
    const accessToken = (await cookies()).get('accessToken')
    if (accessToken?.value) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken.value}`
    }
    const nextHeaders = await headers()
    defaultHeaders['x-guinness-client'] = nextHeaders.get('x-guinness-client')?.valueOf() ?? ''
    defaultHeaders['x-guinness-device-name'] = nextHeaders.get('x-guinness-device-name')?.valueOf() ?? ''
    defaultHeaders['x-guinness-version'] = nextHeaders.get('x-guinness-version')?.valueOf() ?? '1.0.0' // 여기다가만 넣어줘야 웹인지 앱인지 구분 가능함
    defaultHeaders['x-guinness-locale'] = (await cookies()).get(localeKey)?.value ?? 'ko'
    return defaultHeaders;
  }

  private async request<ResponseBody>({
                                        path,
                                        method,
                                        query,
                                        body,
                                        headers = {},
                                      }: RequestParameters): Promise<ResponseBody> {
    const url = `${process.env.GUINNESS_API_SERVER}${path}`;
    const authHeaders = await this.authAsHeaders(); // await 추가

    const _headers = {
      ...authHeaders,
      ...headers,
      'Content-Type': 'application/json', // Content-Type 추가
    };

    const fullUrl = query ? `${url}${convertFromJsonToQuery(query)}` : url;

    const options: RequestInit = {
      method: method.toUpperCase(),
      cache: 'no-store',
      headers: _headers,
      ...(body && Object.keys(body).length > 0 && { body: JSON.stringify(body) })
    };

    // console.log('Request:', { url: fullUrl, options });

    const response = await fetch(fullUrl, options);
    const jsonResponse = await response.json();
    // console.log('Response:', jsonResponse);
    return jsonResponse;
  }
}