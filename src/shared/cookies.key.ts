export const accessTokenKey = 'accessToken';
export const userIdKey = 'userID'
export const udidKey = 'udid'
export const localeKey = 'locale'
export const studioKey = 'studio'
export const depositorKey = 'depositor'
export const fcmTokenKey = 'fcmToken'
export const kioskSelectedIdKey = 'kioskSelectedId'
export const hideDialogIdListKey = 'hideDialogIdList'

// 쿠키 만료 — 365일. home 진입 시마다 갱신하므로 활성 사용자는 사실상 무기한.
// (브라우저가 RFC 6265bis 권고에 따라 ~400일로 cap하므로 그 이상은 실효 없음)
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
