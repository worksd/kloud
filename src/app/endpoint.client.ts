import { ClientOptions } from "@/app/api.client";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { pick } from "@/app/pick";
import { cookies } from "next/headers";
import { Endpoint } from "./endpoint";

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

  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(
    {baseUrl, defaultHeaders} : ClientOptions
  ) {
    this.baseUrl = baseUrl ?? '';
    this.defaultHeaders = defaultHeaders ?? {};
  }

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
    const headers: Record<string, string> = {};
    const accessToken = (await cookies()).get('accessToken')
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
    }
    console.log('Access Token ' + accessToken?.value)
    return headers;
  }

  private async request<ResponseBody>({
                                        path,
                                        method,
                                        query,
                                        body,
                                        headers = {},
                                      }: RequestParameters): Promise<ResponseBody> {
    const url = `${this.baseUrl}${path}`;
    const authHeaders = await this.authAsHeaders(); // await 추가

    const _headers = {
      ...authHeaders,
      ...this.defaultHeaders,
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

    console.log('Request:', { url: fullUrl, options });

    const response = await fetch(fullUrl, options);
    const jsonResponse = await response.json();
    console.log('Response:', jsonResponse);
    return jsonResponse;
  }
}