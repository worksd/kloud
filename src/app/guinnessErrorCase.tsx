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
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STUDENT_PARENT_ALREADY_CONNECTED = 'STUDENT_PARENT_ALREADY_CONNECTED',
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