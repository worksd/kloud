export const accessTokenKey = 'accessToken';
export const userIdKey = 'userID'
export const udidKey = 'udid'
export const localeKey = 'locale'
export const studioKey = 'studio'
export const depositorKey = 'depositor'
export const fcmTokenKey = 'fcmToken'
export const kioskSelectedIdKey = 'kioskSelectedId'
// 키오스크 QR 로그인으로 받은 손님(고객) 토큰 — x-guinness-kiosk-authorization 헤더로 나간다. 손님 화면이 끝나면 지운다.
export const kioskCustomerTokenKey = 'kioskCustomerToken'
export const hideDialogIdListKey = 'hideDialogIdList'
// 관리자가 '일반 모드로 가기'를 누른 동안만 'true' — /home이 관리자 폼 대신 일반 홈을 렌더한다.
export const userModeKey = 'userMode'

// 쿠키 만료 — 365일. home 진입 시마다 갱신하므로 활성 사용자는 사실상 무기한.
// (브라우저가 RFC 6265bis 권고에 따라 ~400일로 cap하므로 그 이상은 실효 없음)
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
