import { Locale } from '@/shared/StringResource';

/** 요일 코드 — 결제 응답은 'MON'~'SUN' 문자열, 수업 상세/recurrence 응답은 숫자(0=일~6=토)로 온다 */
export type DayOfWeekCode = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

const DAY_LABEL: Record<Locale, Record<DayOfWeekCode, string>> = {
  ko: { SUN: '일', MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토' },
  en: { SUN: 'Sun', MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat' },
  jp: { SUN: '日', MON: '月', TUE: '火', WED: '水', THU: '木', FRI: '金', SAT: '土' },
  zh: { SUN: '日', MON: '一', TUE: '二', WED: '三', THU: '四', FRI: '五', SAT: '六' },
};
const WEEKLY_PREFIX: Record<Locale, (days: string) => string> = {
  ko: (d) => `매주 ${d}`,
  en: (d) => `Every ${d}`,
  jp: (d) => `毎週${d}`,
  zh: (d) => `每周${d}`,
};

const DOW_ORDER: DayOfWeekCode[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const toDow = (d: DayOfWeekCode | number): DayOfWeekCode | undefined =>
  typeof d === 'number' ? DOW_ORDER[d] : d;

/** '매주 월·수' 표기 — 요일이 없으면 null. 숫자(0=일~6=토)/문자열 코드 모두 받는다. */
export const weeklyDaysLabel = (
  days: (DayOfWeekCode | number)[] | undefined | null,
  locale: Locale,
): string | null => {
  const normalized = (days ?? []).map(toDow).filter((d): d is DayOfWeekCode => d != null);
  if (normalized.length === 0) return null;
  const sorted = [...normalized].sort((a, b) => DOW_ORDER.indexOf(a) - DOW_ORDER.indexOf(b));
  return WEEKLY_PREFIX[locale](sorted.map((d) => DAY_LABEL[locale][d]).join('·'));
};

/**
 * 첫 수업 날짜 — 시작일(yyyy.MM.dd) 당일 포함, 다니는 요일 중 가장 가까운 날(로컬 자정 Date).
 * FE 추정값이다: 휴강·공휴일은 반영하지 못한다. 요일이 없으면 시작일 그대로, 시작일을 못 읽으면 null.
 */
export const firstLessonDate = (
  startDate: string | undefined | null,
  days: (DayOfWeekCode | number)[] | undefined | null,
): Date | null => {
  const m = startDate?.match(/^(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/);
  if (!m) return null;
  const base = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const dows = new Set((days ?? []).map(toDow).filter((d): d is DayOfWeekCode => d != null).map((d) => DOW_ORDER.indexOf(d)));
  if (dows.size === 0) return base;
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    if (dows.has(d.getDay())) return d;
  }
  return base;
};
