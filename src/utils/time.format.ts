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
