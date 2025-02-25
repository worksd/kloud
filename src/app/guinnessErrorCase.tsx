import { z } from "zod";

export enum ExceptionResponseCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  PAGE_MUST_BE_POSITIVE = 'PAGE_MUST_BE_POSITIVE',
  BAD_PATCH_REQUEST = 'BAD_PATCH_REQUEST',
  USER_EMAIL_NOT_FOUND = 'USER_EMAIL_NOT_FOUND',
  DEACTIVATED_USER = 'DEACTIVATED_USER',
  USER_NAME_NOT_FOUND = 'USER_NAME_NOT_FOUND',
  USER_PASSWORD_NOT_FOUND = 'USER_PASSWORD_NOT_FOUND',
  USER_PASSWORD_NOT_MATCH = 'USER_PASSWORD_NOT_MATCH',
  INVALID_USER_PASSWORD_LENGTH = 'INVALID_USER_PASSWORD_LENGTH',
  INVALID_USER_PASSWORD_PATTERN = 'INVALID_USER_PASSWORD_PATTERN',
  USER_TYPE_NOT_MATCH = 'USER_TYPE_NOT_MATCH',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  ARTIST_STUDIO_CONNECTION_ALREADY_EXISTS = 'ARTIST_STUDIO_CONNECTION_ALREADY_EXISTS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  HEADERS_NOT_FOUND = 'HEADERS_NOT_FOUND',
  ARTIST_NOT_FOUND = 'ARTIST_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STUDIO_ROOM_NOT_FOUND = 'STUDIO_ROOM_NOT_FOUND',
  STUDIO_ARTIST_NOT_CONNECTED = 'STUDIO_ARTIST_NOT_CONNECTED',
  STUDIO_USER_NOT_CONNECTED = 'STUDIO_USER_NOT_CONNECTED',
  STUDIO_NOT_FOUND = 'STUDIO_NOT_FOUND',
  STUDIO_NAME_ALREADY_EXISTS = 'STUDIO_NAME_ALREADY_EXISTS',
  STUDIO_ROOM_ALREADY_EXISTS = 'STUDIO_ROOM_ALREADY_EXISTS',
  ARTIST_ALREADY_EXISTS = 'ARTIST_ALREADY_EXISTS',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  BUSINESS_REGISTRATION_NUMBER_NOT_FOUND = 'BUSINESS_REGISTRATION_NUMBER_NOT_FOUND',
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_BUSINESS_REGISTRATION_NUMBER = 'INVALID_BUSINESS_REGISTRATION_NUMBER',
  STUDIO_ALREADY_EXISTS = 'STUDIO_ALREADY_EXISTS',
  STUDIO_ROOM_NOT_MATCH = 'STUDIO_ROOM_NOT_MATCH',
  LESSON_ALREADY_EXISTS = 'LESSON_ALREADY_EXISTS',
  LESSON_ALREADY_ARRANGED = 'LESSON_ALREADY_ARRANGED',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
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

export type ExceptionResponseCodeType = {
  [key: string]: string; // or specify the specific keys and their types
};