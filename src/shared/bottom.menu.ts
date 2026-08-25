import { StringResourceKey } from "@/shared/StringResource";

/**
 * 하단 탭 정의.
 * env(NEXT_PUBLIC_BOTTOM_MENU_LIST)에는 노출할 탭의 key와 순서만 담고,
 * 라벨/아이콘/라우트 등 실제 스펙은 전부 여기서 관리한다.
 */
export type BottomMenuKey = 'HOME' | 'SCHEDULE' | 'PRACTICE' | 'PROFILE';

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
};

export const DEFAULT_BOTTOM_MENU_KEYS: BottomMenuKey[] = ['HOME', 'SCHEDULE', 'PRACTICE', 'PROFILE'];

const isBottomMenuKey = (value: string): value is BottomMenuKey =>
  Object.prototype.hasOwnProperty.call(BOTTOM_MENU_DEFS, value);

/**
 * env 문자열을 탭 key 목록으로 파싱한다.
 * "HOME,SCHEDULE,PROFILE" / "[HOME, SCHEDULE, PROFILE]" 모두 허용.
 * 비었거나 전부 알 수 없는 key면 기본 구성으로 폴백한다.
 */
export const parseBottomMenuKeys = (raw?: string): BottomMenuKey[] => {
  const keys = (raw ?? '')
    .replace(/[\[\]"']/g, '')
    .split(',')
    .map((key) => key.trim().toUpperCase())
    .filter(isBottomMenuKey);

  return keys.length > 0 ? keys : DEFAULT_BOTTOM_MENU_KEYS;
};
