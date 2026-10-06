// 패스/패스권의 '다니는 요일'(days: 0=일 ~ 6=토) 표시 — 클라이언트 컴포넌트에서도 쓰도록 동기 포맷터.
// 비어 있으면 요일을 가리지 않는 상품이라 '' 를 돌려준다(칩을 안 그린다).
import { Locale } from "@/shared/StringResource";

const SHORT: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
};
const JOINER: Record<Locale, string> = { ko: '·', en: '·', jp: '・', zh: '、' };

export const formatPassDays = (days: number[] | null | undefined, locale: Locale = 'ko'): string => {
  const valid = [...new Set((days ?? []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b);
  if (valid.length === 0) return '';
  const labels = SHORT[locale] ?? SHORT.en;
  return valid.map((d) => labels[d]).join(JOINER[locale] ?? '·');
};
