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

export type SendPhoneVerificationCodeParameter = {
  phone: string;
  countryCode: string;
}

export type VerifyCodeParameter = {
  code?: string;
  phone: string;
  countryCode: string;
  isAdmin: boolean;
  name?: string;
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

// SNS 계정 연결 — 현재 로그인 계정에 소셜 계정을 추가 연결.
// 다른 계정에 이미 물려있으면 needsConfirm:true로 응답 → 동일 token/code + confirm:true로 재요청(이전).
export type SocialLinkParameter = {
  provider: SnsProvider;
  token?: string;
  code?: string;
  name?: string;
  confirm?: boolean;
}

export type SocialLinkResponse = {
  provider: string;
  needsConfirm: boolean;
}

export const PostSocialLink: Endpoint<SocialLinkParameter, SocialLinkResponse> = {
  method: 'post',
  path: '/auth/social-link',
  bodyParams: ['provider', 'token', 'code', 'name', 'confirm'],
}

export const SendVerificationEmail: Endpoint<object, VerifyCodeParameter> = {
  method: 'post',
  path: '/auth/email-certificate',
}

export const SendPhoneVerification: Endpoint<SendPhoneVerificationCodeParameter, SendPhoneVerificationResponse> = {
  method: 'post',
  path: '/auth/phone-certificate',
  bodyParams: ['phone', 'countryCode'],
}

export const CheckPhoneVerification: Endpoint<VerifyCodeParameter, PostAuthLoginResponse> = {
  method: 'post',
  path: '/auth/phone-login',
  bodyParams: ['code', 'phone', 'countryCode', 'isAdmin', 'name']
}

export type SendPhoneVerificationResponse = {
  code: string;
  ttl: number;
  resendAvailableAt?: string;
}