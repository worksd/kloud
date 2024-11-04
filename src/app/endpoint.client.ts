import { ClientOptions } from "@/app/api.client";
import { Endpoint } from "./endpoint";
import { pick } from "@/app/pick";
import { cookies } from "next/headers";

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
  >(endpoint: Endpoint<Parameter, Response>) {
    return (args: Parameter): Promise<Response> => {
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

  private authAsHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const accessToken = cookies().get('accessToken')
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
    }
    console.log(accessToken?.value)
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
    const _headers: Record<string, string> = {
      ...this.authAsHeaders(),
      ...this.defaultHeaders,
      ...headers,
    };
    try {
      if (method.toUpperCase() === 'POST') {
        console.log('gogo')
        const response = await fetch(url, {
            method: 'POST',
            headers: _headers,
            body: JSON.stringify(body),
          });
        return (await response.json())
      } else {
        const queryUrl = url + `${convertFromJsonToQuery(query)}`
        console.log(queryUrl)
        const response = await fetch(queryUrl, {headers: _headers,
          });
        return await response.json();
      }


    } catch (error: any) {
      throw error;
    }
  }
}