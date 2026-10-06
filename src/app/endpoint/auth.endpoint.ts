import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { UserType } from "@/entities/user/user.type";
import { UserStatus } from "@/entities/user/user.status";

export enum SnsProvider {
  Google = 'Google',
  Kakao = 'Kakao',
  Apple = 'Apple',
}

export type GetAuthTokenParameter = object
// GET /auth — 토큰 검사 겸 내 정보. type으로 Partner/Operator 분기 가능 (홈 진입 등).
export type GetAuthTokenResponse = {
  id: number;
  email: string;
  status: UserStatus;
  type?: UserType;
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
  type?: UserType;
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

// needsConfirm일 때, 해당 SNS가 이미 물려있는 이전 계정 정보
export type LinkedUser = {
  id: number;
  email: string;
  nickName: string;
  name: string;
  profileImageUrl: string;
  createdAt: string;
}

export type SocialLinkResponse = {
  provider: string;
  needsConfirm: boolean;
  linkedUser?: LinkedUser;
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
// ── 키오스크 운영자(기기) QR 로그인 — BE bbf78c8b ──────────────────────────────────────
// 키오스크 로그인 화면이 code를 만들어 QR(guinness://kiosk-operator-login?code=…)로 띄우고 GET /auth/kiosk-login/stream?code= (SSE)를 연다.
// 파트너 앱이 QR을 찍어 POST /auth/kiosk-login { code }를 부르면 'kiosk.operator-login' 이벤트에 운영자 토큰(360일)이 실려 온다.

/** SSE 'kiosk.operator-login' 이벤트 본문 (ping에는 code만 든다) */
export type KioskOperatorLoginEvent = {
  code: string;
  /** 운영자 Access Token(360일) — POST /auth/sign-in 결과와 같은 자리에 저장 */
  accessToken?: string;
  user?: { id: number; name: string; email: string | null };
  studio?: { id: number; name: string };
};

export type KioskOperatorLoginRequest = {
  /** 16~64자 [A-Za-z0-9_-] */
  code: string;
};

/** 토큰은 응답에 없다 — 키오스크 스트림으로만 간다 */
export type KioskOperatorLoginResponse = {
  studioId: number;
  studioName: string;
};

/**
 * 파트너 앱 승인. 학원 관계자(Partner·Operator) 계정만 — 일반 계정은 KIOSK_LOGIN_FORBIDDEN,
 * x-guinness-client가 PARTNER가 아니면 ACCESS_DENIED(운영자 토큰은 결제 취소·관리자 기능까지 열어서).
 * Operator는 학원에 OPERATOR 피쳐가 있어야 한다(STUDIO_FEATURE_NOT_AVAILABLE).
 */
export const KioskOperatorLogin: Endpoint<KioskOperatorLoginRequest, KioskOperatorLoginResponse> = {
  method: 'post',
  path: '/auth/kiosk-login',
  headers: { 'x-guinness-client': 'PARTNER' },
  bodyParams: ['code'],
};
