import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { UserType } from "@/entities/user/user.type";
import { UserStatus } from "@/entities/user/user.status";

export enum SnsProvider {
  Google = 'Google',
  Kakao = 'Kakao',
  Apple = 'Apple',
}

export type GetAuthTokenParameter = object
export type GetAuthTokenResponse = {
  id: number;
  email: string;
  status: UserStatus;
}

export type SnsLoginParameter = {
  provider: SnsProvider;
  token?: string;
  name?: string;
  code?: string;
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

export type PostComparePasswordParameter = {
  password: string,
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

export type VerifyCodeResponse = {
  code: string;
}

export const PostAuthEmail: Endpoint<PostAuthEmailParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/sign-in',
  bodyParams: ['email', 'password', 'type'],
}

export const ComparePassword: Endpoint<PostComparePasswordParameter, SimpleResponse> = {
  method: 'post',
  path: '/auth/compare-password',
  bodyParams: ['password'],
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

export const PostSocialLogin: Endpoint<SnsLoginParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/social-login',
  bodyParams: ['provider', 'token', 'name', 'code'],
}

export const SendVerificationEmail: Endpoint<object, VerifyCodeResponse> = {
  method: 'post',
  path: '/auth/email-certificate',
}