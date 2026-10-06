import { StringResourceKey } from "@/shared/StringResource";

/**
 * 하단 탭 정의.
 * env(NEXT_PUBLIC_BOTTOM_MENU_LIST)에는 노출할 탭의 key와 순서만 담고,
 * 라벨/아이콘/라우트 등 실제 스펙은 전부 여기서 관리한다.
 */
export type BottomMenuKey =
  | 'HOME' | 'SCHEDULE' | 'PRACTICE' | 'PROFILE'
  // 관리자(Partner/Operator) 전용 탭 — env(NEXT_PUBLIC_ADMIN_BOTTOM_MENU_LIST)로 구성
  | 'ADMIN_HOME' | 'PAYMENT' | 'USER' | 'SETTING';

export type BottomMenuItem = {
  label: string;
  labelSize: number;
  iconUrl: string;
  selectedIconUrl: string;
  iconSize: number;
  page: {
    route: string;
    initialColor: string;
    ignoreSafeArea: boolean;
  };
};

type BottomMenuDef = Omit<BottomMenuItem, 'label'> & { labelKey: StringResourceKey };

const ICON_BASE = 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/common';

const icon = (name: string) => ({
  iconUrl: `${ICON_BASE}/ic_${name}.svg`,
  selectedIconUrl: `${ICON_BASE}/ic_selected_${name}.svg`,
  iconSize: 24,
});

export const BOTTOM_MENU_DEFS: Record<BottomMenuKey, BottomMenuDef> = {
  HOME: {
    labelKey: 'bottom_menu_home',
    labelSize: 16,
    ...icon('home'),
    page: { route: '/home', initialColor: '#FFFFFF', ignoreSafeArea: true },
  },
  SCHEDULE: {
    labelKey: 'bottom_menu_schedule',
    labelSize: 14,
    ...icon('schedule'),
    page: { route: '/schedule', initialColor: '#FFFFFF', ignoreSafeArea: false },
  },
  PRACTICE: {
    labelKey: 'bottom_menu_practice',
    labelSize: 14,
    ...icon('community'),
    page: { route: '/community', initialColor: '#FFFFFF', ignoreSafeArea: false },
  },
  PROFILE: {
    labelKey: 'bottom_menu_profile',
    labelSize: 14,
    ...icon('profile'),
    page: { route: '/profile', initialColor: '#FFFFFF', ignoreSafeArea: false },
  },

  // ── 관리자 탭 ──
  // 전용 에셋(ic_admin_*) 사용 — 일반 탭과 같은 테마(24px, #1F1F1F, 미선택 stroke 1.5 / 선택 solid fill).
  // 전부 ignoreSafeArea: true — 각 화면이 상태바 영역을 safe-area 패딩으로 직접 잡는다(고정 헤더 포함).
  // 첫 탭 route는 일반 유저와 같은 '/home' — 앱 부팅 시 첫 탭에 '/admin'을 주면 흰 화면이 된다.
  // /home 페이지가 관리자면 AdminHomeForm으로 갈아끼운다 (앱 수정 없이 가는 우회).
  ADMIN_HOME: {
    labelKey: 'bottom_menu_admin_home',
    labelSize: 16,
    ...icon('admin_home'),
    page: { route: '/home', initialColor: '#FFFFFF', ignoreSafeArea: true },
  },
  PAYMENT: {
    labelKey: 'bottom_menu_admin_payment',
    labelSize: 14,
    ...icon('admin_sales'),
    page: { route: '/admin/sales', initialColor: '#FFFFFF', ignoreSafeArea: true },
  },
  USER: {
    labelKey: 'bottom_menu_admin_user',
    labelSize: 14,
    ...icon('admin_student'),
    page: { route: '/admin/students', initialColor: '#FFFFFF', ignoreSafeArea: true },
  },
  SETTING: {
    labelKey: 'bottom_menu_admin_setting',
    labelSize: 14,
    ...icon('admin_setting'),
    page: { route: '/admin/setting', initialColor: '#FFFFFF', ignoreSafeArea: true },
  },
};

export const DEFAULT_BOTTOM_MENU_KEYS: BottomMenuKey[] = ['HOME', 'SCHEDULE', 'PRACTICE', 'PROFILE'];
export const DEFAULT_ADMIN_BOTTOM_MENU_KEYS: BottomMenuKey[] = ['ADMIN_HOME', 'PAYMENT', 'USER', 'SETTING'];

const isBottomMenuKey = (value: string): value is BottomMenuKey =>
  Object.prototype.hasOwnProperty.call(BOTTOM_MENU_DEFS, value);

/**
 * env 문자열을 탭 key 목록으로 파싱한다.
 * "HOME,SCHEDULE,PROFILE" / "[HOME, SCHEDULE, PROFILE]" 모두 허용.
 * 비었거나 전부 알 수 없는 key면 기본 구성(fallback)으로 폴백한다.
 */
export const parseBottomMenuKeys = (raw?: string, fallback: BottomMenuKey[] = DEFAULT_BOTTOM_MENU_KEYS): BottomMenuKey[] => {
  const keys = (raw ?? '')
    .replace(/[\[\]"']/g, '')
    .split(',')
    .map((key) => key.trim().toUpperCase())
    .filter(isBottomMenuKey);

  return keys.length > 0 ? keys : fallback;
};
