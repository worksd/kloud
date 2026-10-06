/**
 * 관리자 화면 공통 상단 여백.
 *
 * 관리자 탭은 전부 ignoreSafeArea: true — 웹뷰가 상태바 아래까지 올라오므로 화면이 직접 여백을 잡아야 한다.
 * env(safe-area-inset-top)은 웹뷰/기기에 따라 0으로 오는 경우가 있어(그때 내용이 탑바에 가린다)
 * max()로 최소 44px을 보장한 뒤 시각 여백을 더한다.
 */
export const ADMIN_SAFE_TOP = 'max(env(safe-area-inset-top, 0px), 44px)';

/** 고정 헤더 상단 패딩 — 상태바 영역 + 여백 */
export const ADMIN_HEADER_TOP_PAD = `calc(${ADMIN_SAFE_TOP} + 14px)`;

/** 헤더가 없는 화면(빈 상태 등)용 */
export const ADMIN_CONTENT_TOP_PAD = `calc(${ADMIN_SAFE_TOP} + 24px)`;
