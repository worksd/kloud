import { Locale } from "@/shared/StringResource";

const LOCALE_TAG: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  jp: 'ja-JP',
  zh: 'zh-CN',
};

/**
 * 과거 시각을 상대 표기로. 초 → 분 → 시간 → 일 → 주 → 개월 → 년 순으로 단위를 올린다.
 * 예(ko): '30초 전' / '5분 전' / '3시간 전' / '2일 전' / '3주 전' / '5개월 전' / '2년 전'
 *
 * 문구는 Intl.RelativeTimeFormat이 로케일별로 만든다 — 직접 문자열을 조립하지 않으므로
 * en/jp/zh도 자동으로 자연스러운 표기가 된다.
 *
 * 주의: now를 기준으로 계산하므로 SSR과 클라 렌더 결과가 다를 수 있다.
 * 호출부에서 suppressHydrationWarning을 붙여 쓸 것.
 */
export const formatRelativePast = (
  input: string | Date | null | undefined,
  locale: Locale,
  now: Date = new Date(),
): string => {
  if (!input) return '';
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '';

  // 미래 시각(시계 오차 등)은 0으로 눌러 '방금'처럼 보이게 한다.
  const sec = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  // numeric: 'always' — 'auto'는 2일 전을 '그저께', 1일 전을 '어제'로 바꿔버린다.
  // 목록에서는 'N일 전'으로 일관되게 보이는 편이 읽기 쉽다(유튜브 표기와도 같다).
  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAG[locale] ?? 'ko-KR', { numeric: 'always' });

  // 0초는 '0초 전'이 되어 어색하므로 최소 1초로 올린다.
  if (sec < 60) return rtf.format(-Math.max(1, sec), 'second');

  const min = Math.floor(sec / 60);
  if (min < 60) return rtf.format(-min, 'minute');

  const hour = Math.floor(min / 60);
  if (hour < 24) return rtf.format(-hour, 'hour');

  const day = Math.floor(hour / 24);
  if (day < 7) return rtf.format(-day, 'day');

  // 30일/365일 기준의 근사 — 상대 표기라 달의 실제 길이까지 맞출 필요는 없다.
  if (day < 30) return rtf.format(-Math.floor(day / 7), 'week');
  if (day < 365) return rtf.format(-Math.floor(day / 30), 'month');
  return rtf.format(-Math.floor(day / 365), 'year');
};
