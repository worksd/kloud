'use server';

import { api } from '@/app/api.client';
import { KioskLoginResponse } from '@/app/endpoint/kiosk.endpoint';
import { KioskOperatorLoginResponse } from '@/app/endpoint/auth.endpoint';
import { GuinnessErrorCase, isGuinnessErrorCase } from '@/app/guinnessErrorCase';

/**
 * 모바일 앱 — 키오스크 QR 승인. POST /kiosks/:kioskId/login { code }
 * 누구인지는 앱 토큰(Authorization)으로만 정해진다. 토큰은 응답에 없고 키오스크 스트림으로만 간다.
 * 실패는 항상 {code, message}로 — 고정 문구로 덮지 않는다.
 */
export const approveKioskLoginAction = async (
  { kioskId, code }: { kioskId: number; code: string },
): Promise<KioskLoginResponse | GuinnessErrorCase> => {
  try {
    const res: unknown = await api.kiosk.login({ kioskId, code });
    if (isGuinnessErrorCase(res)) return res;
    if (res && typeof res === 'object' && 'kioskId' in res) return res as KioskLoginResponse;
    if (res && typeof res === 'object' && 'message' in res) {
      const r = res as { statusCode?: number; message: string | string[]; error?: string; code?: string };
      const message = Array.isArray(r.message) ? r.message.join('\n') : String(r.message);
      return { code: r.code ?? r.error ?? `HTTP_${r.statusCode ?? 'ERROR'}`, message };
    }
    return { code: 'UNEXPECTED_RESPONSE', message: `서버 응답 형식이 예상과 다릅니다: ${JSON.stringify(res)?.slice(0, 300) ?? String(res)}` };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { code: 'REQUEST_FAILED', message: `요청을 보내지 못했어요: ${reason}` };
  }
};

/**
 * 파트너 앱 — 키오스크 운영자(기기) QR 승인. POST /auth/kiosk-login { code } (x-guinness-client: PARTNER)
 * 학원 관계자 계정만. 일반 계정은 KIOSK_LOGIN_FORBIDDEN. 토큰은 키오스크 스트림으로만 간다.
 */
export const approveKioskOperatorLoginAction = async (
  { code }: { code: string },
): Promise<KioskOperatorLoginResponse | GuinnessErrorCase> => {
  try {
    const res: unknown = await api.auth.kioskOperatorLogin({ code });
    if (isGuinnessErrorCase(res)) return res;
    if (res && typeof res === 'object' && 'studioId' in res) return res as KioskOperatorLoginResponse;
    if (res && typeof res === 'object' && 'message' in res) {
      const r = res as { statusCode?: number; message: string | string[]; error?: string; code?: string };
      const message = Array.isArray(r.message) ? r.message.join('\n') : String(r.message);
      return { code: r.code ?? r.error ?? `HTTP_${r.statusCode ?? 'ERROR'}`, message };
    }
    return { code: 'UNEXPECTED_RESPONSE', message: `서버 응답 형식이 예상과 다릅니다: ${JSON.stringify(res)?.slice(0, 300) ?? String(res)}` };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { code: 'REQUEST_FAILED', message: `요청을 보내지 못했어요: ${reason}` };
  }
};
