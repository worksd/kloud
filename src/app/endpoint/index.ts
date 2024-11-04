type value = any;

export type Endpoint<
  Parameter extends Record<string, value> | string,
  Response extends Record<string, value> | string
> = {
  method: string;
  path: string | ((e: Parameter) => string);
  pathParams?: (keyof Parameter)[];
  queryParams?: (keyof Parameter)[];
  bodyParams?: (keyof Parameter)[];
  headers?: Record<string, string>;
};

export type SimpleResponse = {
  success: boolean
}

export * as Auth from './auth.endpoint'
export * as User from './user.endpoint'