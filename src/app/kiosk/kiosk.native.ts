/**
 * 키오스크 ↔ 네이티브 브릿지
 *
 * 운영자(파트너) 로그인이 완료되면 토큰을 네이티브에 저장하도록 이벤트를 전송한다.
 * 네이티브는 window.KloudEvent.saveKioskToken(token) 콜로 토큰을 받아 안전 저장소에 보관.
 */
export const sendKioskTokenToNative = (token: string) => {
  if (typeof window === 'undefined') return;
  if (!token) return;
  window.KloudEvent?.saveKioskToken?.(token);
};
