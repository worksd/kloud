import { EndpointClient } from "@/app/endpoint.client";
import * as API from "./endpoint";


export class ApiClient extends EndpointClient {

  readonly auth = {
    token: this.endpointBuilder(API.Auth.GetAuthToken),
    email: this.endpointBuilder(API.Auth.PostAuthEmail),
  }

  readonly user = {
    get: this.endpointBuilder(API.User.GetUser)
  }
}


export interface ClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}


export const api = new ApiClient({
  baseUrl: process.env.GUINNESS_API_SERVER,
  defaultHeaders: {
    'x-guinness-client': 'Web',
    'x-guinness-device-name': 'asd',
    'x-guinness-version': '1.0.0',
    'Content-Type': 'application/json',
  },
});

