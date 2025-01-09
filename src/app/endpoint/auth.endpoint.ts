import { Endpoint } from "@/app/endpoint/index";
import { UserType } from "@/entities/user/user.type";
import { UserStatus } from "@/entities/user/user.status";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export type GetAuthTokenParameter = object
export type GetAuthTokenResponse = {
  id: number;
  email: string;
  status: UserStatus;
}

export type SnsLoginParameter = {
  token: string;
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

export type PostAuthLoginResponse = {
  accessToken: string,
  user: UserResponse,
}

export type UserResponse = {
  id: number;
  email: string;
  status: UserStatus;
}

export const PostAuthEmail: Endpoint<PostAuthEmailParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/sign-in',
  bodyParams: ['email', 'password', 'type'],
}

export type PostAuthEmailSignUpParameter = {
  email: string,
  password: string,
  type: UserType,
}

export const PostSignUpEmail: Endpoint<PostAuthEmailSignUpParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/sign-up',
  bodyParams: ['email', 'password', 'type'],
}

export const PostAuthKakao: Endpoint<SnsLoginParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/kakao',
  bodyParams: ['token'],
}

export const PostAuthGoogle: Endpoint<SnsLoginParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/google',
  bodyParams: ['token'],
}

export const PostAuthApple: Endpoint<SnsLoginParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/apple',
  bodyParams: ['token'],
}