import { z } from "zod";

export enum ExceptionResponseCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  APPLE_LOGIN_FAILED = 'APPLE_LOGIN_FAILED',
  USER_EMAIL_NOT_FOUND = 'USER_EMAIL_NOT_FOUND',
  USER_PASSWORD_NOT_MATCH = 'USER_PASSWORD_NOT_MATCH',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  APP_UPGRADE_REQUIRED = 'APP_UPGRADE_REQUIRED',
  USER_EMAIL_EMPTY = 'USER_EMAIL_EMPTY',
  PAYMENT_SCHEDULE_ALREADY_EXISTS = 'PAYMENT_SCHEDULE_ALREADY_EXISTS',
  PHONE_TYPE_USER_EXISTS = 'PHONE_TYPE_USER_EXISTS',
  PHONE_ALREADY_EXISTS = 'PHONE_ALREADY_EXISTS',
  /** 닉네임 중복 — POST /users/duplicate-check, PATCH /users/:id 둘 다 이 코드 */
  NICKNAME_ALREADY_EXISTS = 'NICKNAME_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STUDENT_PARENT_ALREADY_CONNECTED = 'STUDENT_PARENT_ALREADY_CONNECTED',
  // 인증 강화(BE af38264f·5b9dba5f, 2026-10-31)
  /** 같은 번호로 60초 안에 인증번호 재요청(429) — resendAvailableAt 까지 재발송 잠금 */
  CERTIFICATION_CODE_COOLDOWN = 'CERTIFICATION_CODE_COOLDOWN',
  /** 인증번호 틀림(1~5회) */
  INVALID_CERTIFICATION_CODE = 'INVALID_CERTIFICATION_CODE',
  /** 5회 틀린 뒤 또는 ttl 만료 — 인증번호를 다시 받아야 한다 */
  CERTIFICATION_CODE_EXPIRED = 'CERTIFICATION_CODE_EXPIRED',
  /** 이메일 로그인 60초 15회 초과(429) — 잠시 후 다시 */
  SIGN_IN_TOO_MANY_ATTEMPTS = 'SIGN_IN_TOO_MANY_ATTEMPTS',
  // 미납 유예 결제(BE 74c9c90b)
  PAYMENT_RECORD_NOT_UNPAID = 'PAYMENT_RECORD_NOT_UNPAID',
  PAYMENT_ID_ITEM_NOT_MATCH = 'PAYMENT_ID_ITEM_NOT_MATCH',
  UNPAID_HAS_ENDED_LESSON = 'UNPAID_HAS_ENDED_LESSON',
}


// code 타입은 enum + 임의 string 조합 — enum 자동완성은 살리되,
// BE가 던지는 PG/외부 에러(예: 'B0:해당카드이용불가')도 받을 수 있게 함.
export type GuinnessErrorCase = {
  code: ExceptionResponseCode | (string & {}),
  message: string
}

// 스키마도 enum 강제 → 단순 shape 검증으로 완화. code+message 둘 다 string이면 통과.
// 그래야 정의되지 않은 에러 코드(PG/외부 시스템)도 호출부의 '에러 다이얼로그' 분기를 탈 수 있음.
export const GuinnessErrorCaseScheme = z.object({
  code: z.string(),
  message: z.string(),
});

export const isGuinnessErrorCase = (value: unknown): value is GuinnessErrorCase => {
  const result = GuinnessErrorCaseScheme.safeParse(value);
  return result.success;
};