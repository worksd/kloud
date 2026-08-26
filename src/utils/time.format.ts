import { Locale } from "@/shared/StringResource";

const INTL_LOCALE: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  jp: 'ja-JP',
  zh: 'zh-CN',
};

/**
 * "HH:mm" → 로케일 자연 포맷의 12시간제 시각.
 * 예: 오후 7:00 / 7:00 PM / 午後7:00 / 下午7:00
 * 앱/웹/키오스크가 시:분을 노출할 때 공통으로 쓰는 표기 규칙.
 */
export const toAmPmTime = (hhmm: string, locale: Locale): string => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(INTL_LOCALE[locale], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const timeParts = (hhmm: string, locale: Locale): Intl.DateTimeFormatPart[] | null => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(d);
};

// dayPeriod(오전/오후/AM/PM)를 뺀 시:분만
const clockOnly = (parts: Intl.DateTimeFormatPart[]): string =>
  parts.filter((p) => p.type === 'hour' || p.type === 'minute' || (p.type === 'literal' && p.value.trim() === ':')).map((p) => p.value).join('');

/**
 * "HH:mm" 두 개 → 구간 표기. 시작·끝이 같은 오전/오후면 한 번만 적는다.
 * 예: 오후 1:00 – 2:00 / 1:00 – 2:00 PM / 오전 11:30 – 오후 12:30 (구간이 넘어가면 둘 다)
 */
export const toAmPmTimeRange = (start: string, end: string, locale: Locale): string => {
  const sp = timeParts(start, locale);
  const ep = timeParts(end, locale);
  if (!sp || !ep) return `${toAmPmTime(start, locale)} – ${toAmPmTime(end, locale)}`;
  const sh = Number(start.split(':')[0]);
  const eh = Number(end.split(':')[0]);
  if ((sh < 12) !== (eh < 12)) return `${toAmPmTime(start, locale)} – ${toAmPmTime(end, locale)}`;
  // dayPeriod가 앞(ko/jp/zh)이면 끝에서 생략, 뒤(en)면 시작에서 생략
  const periodIdx = sp.findIndex((p) => p.type === 'dayPeriod');
  const hourIdx = sp.findIndex((p) => p.type === 'hour');
  if (periodIdx !== -1 && periodIdx < hourIdx) return `${toAmPmTime(start, locale)} – ${clockOnly(ep)}`;
  return `${clockOnly(sp)} – ${toAmPmTime(end, locale)}`;
};
