// 패스권 QR 값 규칙 — 모바일(MyPassDetailForm)/PC(MyPassDetailPcForm) 공용
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

export const webBaseUrl = (process.env.GUINNESS_API_SERVER ?? '').includes('prod')
  ? 'https://rawgraphy.com'
  : 'https://staging.rawgraphy.com';

// 'yyyy.MM.dd' | 'yyyy-MM-dd' → 'yyyy-MM-ddT23:59:59.000Z'. BE qrcodeUrl과 동일하게 KST 시각에 Z를 붙인 형태.
const endOfDayStamp = (date?: string): string | null => {
  if (!date) return null;
  const [y, m, d] = date.split(/[-.]/).map(Number);
  if (!y || !m || !d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T23:59:59.000Z`;
};

// BE qrcodeUrl → 절대 URL. 이미 http(s)면 그대로, '?'로 시작하거나 쿼리만이면 도메인을 붙인다
export const toPassQrUrl = (qrcodeUrl?: string | null): string | null => {
  if (!qrcodeUrl) return null;
  if (/^https?:\/\//.test(qrcodeUrl)) return qrcodeUrl;
  return `${webBaseUrl}?${qrcodeUrl.replace(/^\?/, '')}`;
};

// 폴백 — BE가 qrcodeUrl을 안 내려줄 때만. expiredAt은 BE 규약과 맞춰 종료일 23:59:59에 Z를 붙인 형태(KST 시각 + Z)
export const buildPassQrUrl = (passId: number, endDate?: string): string => {
  const params = new URLSearchParams({ willUsePassId: String(passId) });
  const expiredAt = endOfDayStamp(endDate);
  if (expiredAt) params.set('expiredAt', expiredAt);
  return `${webBaseUrl}?${params.toString()}`;
};

export const isEndDateNotPassed = (endDate?: string): boolean => {
  if (!endDate) return true;
  const [y, m, d] = endDate.split(/[-.]/).map(Number);
  if (!y || !m || !d) return true;
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return end.getTime() >= Date.now();
};


/**
 * 기한이 남은(Active + 종료일 미경과) 패스의 QR 값. 아니면 null.
 * BE qrcodeUrl 우선 — 'willUsePassId=765&expiredAt=…'처럼 쿼리만 내려오므로 도메인을 붙여
 * 수강권 QR(https://…?willUseTicketId=…)과 같은 형태로 만든다. 없으면 FE에서 동일 포맷으로 생성(폴백).
 */
export const resolvePassQrValue = (pass: GetPassResponse): string | null => {
  const isValid = pass.status === 'Active' && isEndDateNotPassed(pass.endDate);
  if (!isValid) return null;
  return toPassQrUrl(pass.qrcodeUrl) ?? buildPassQrUrl(pass.id, pass.endDate);
};
