import { KloudScreen } from '@/shared/kloud.screen';

// /redirect?type=...&code=... → 최종 앱 화면 경로.
// 브라우저/QR 진입(route 핸들러)과 앱 딥링크(splash)에서 공통으로 사용.
export const resolveRedirectTarget = (type?: string | null, code?: string | null): string => {
  switch (type) {
    case 'UseVoucher':
      return KloudScreen.CouponRegister + (code ? `?code=${encodeURIComponent(code)}` : '');
    default:
      return '/';
  }
};
