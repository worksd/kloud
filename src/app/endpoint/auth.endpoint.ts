import { Endpoint } from "@/app/endpoint/index";
import { UserType } from "@/entities/user/user.type";
import { UserResponse } from "@/entities/user/user.response";
import { UserStatus } from "@/entities/user/user.status";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export type GetAuthTokenParameter = object
export type GetAuthTokenResponse = {
  id: number;
  email: string;
  status: UserStatus;
}

export const GetAuthToken: Endpoint<
  GetAuthTokenParameter,
  GetAuthTokenResponse
> = {
  method: "get",
  path: "/auth",
}

export type PostAuthEmailParameter = {
  email: string,
  password: string,
  type: UserType,
}

export type PostAuthEmailResponse = {
  accessToken: string,
  user: UserResponse,
}

export const PostAuthEmail: Endpoint<PostAuthEmailParameter, PostAuthEmailResponse> = {
  method: 'post',
  path: '/auth/sign-in',
  bodyParams: ['email', 'password', 'type'],
}