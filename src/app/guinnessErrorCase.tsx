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
}


export type GuinnessErrorCase = {
  code: ExceptionResponseCode,
  message: string
}

export const GuinnessErrorCaseScheme = z.object({
  code: z.enum(Object.values(ExceptionResponseCode) as [string, ...string[]]),
  message: z.string(),
});

export const isGuinnessErrorCase = (value: unknown): value is GuinnessErrorCase => {
  const result = GuinnessErrorCaseScheme.safeParse(value);
  return result.success;
};