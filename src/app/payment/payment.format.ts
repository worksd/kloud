// 결제 페이지(PC/모바일 폼) 공용 표시 헬퍼.

// 번들 판매기간 표시용. "2026.06.16 05:52" 를 날짜/시간으로 분해.
// 같은 날이면 "2026.06.16 05:52 ~ 07:00"처럼 날짜 한 번 + 시간범위로, 다른 날이면 "2026.06.16 ~ 2026.06.18"로 압축.
// (구) closeDate는 종료일 폴백.
export const bundleSalesPeriod = (start?: string, end?: string, close?: string): string | null => {
  const parse = (raw?: string) => {
    const m = raw?.match(/^(\d{4}\.\d{1,2}\.\d{1,2})(?:\s+(\d{1,2}:\d{2}))?/);
    return m ? { day: m[1], time: m[2] ?? null } : null;
  };
  const s = parse(start);
  const e = parse(end) ?? parse(close);
  if (s && e) {
    if (s.day === e.day) {
      return s.time && e.time ? `${s.day} ${s.time} ~ ${e.time}` : s.day;
    }
    return `${s.day} ~ ${e.day}`;
  }
  if (e) return `~ ${e.day}`;
  if (s) return `${s.day} ~`;
  return null;
};
