'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, LogIn } from 'lucide-react';
import QRScanner from '@/app/components/QRScanner';
import { getLocaleString } from '@/app/components/locale';
import { Locale } from '@/shared/StringResource';
import { KioskLoginResponse } from '@/app/endpoint/kiosk.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { approveKioskLoginAction } from '@/app/kiosk-login/kiosk.login.action';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';

/**
 * 키오스크 QR 로그인 — 앱(폰) 쪽 화면. 두 진입이 있다.
 *  - 딥링크: 기본 카메라로 키오스크 QR을 찍어 `/kiosk-login?kioskId=&code=`로 들어옴 → 바로 승인
 *  - 앱 내: 관리자 홈 '키오스크 로그인' 숏컷 등에서 파라미터 없이 push → 카메라 스캐너를 열고, 찍히면 승인
 * 승인은 POST /kiosks/:id/login 한 번. 토큰은 키오스크 스트림으로만 가므로 여기서는 결과만 보여준다.
 * 키오스크 화면이 안 바뀌면(QR 5분 만료 등) 서버도 알 수 없어 200이 온다 — 다시 찍으라고 안내한다.
 */
type Target = { kioskId: number; code: string };
type State =
  | { kind: 'scan' }
  | { kind: 'needLogin' }
  | { kind: 'loading'; target: Target }
  | { kind: 'done'; res: KioskLoginResponse }
  | { kind: 'error'; code: string; message: string; fromScan: boolean };

const CODE_RE = /^[A-Za-z0-9_-]{16,64}$/;

/** QR 값에서 kioskId·code 추출 — 전체 URL(https://…/kiosk-login?…), 스킴(rawgraphy://kiosk-login?…), 쿼리문자열만 온 경우 모두 허용 */
export const parseKioskLoginQr = (raw: string): Target | null => {
  const text = raw.trim();
  let query = text;
  const q = text.indexOf('?');
  if (q >= 0) query = text.slice(q + 1);
  const params = new URLSearchParams(query);
  const kioskId = Number(params.get('kioskId'));
  const code = params.get('code') ?? '';
  if (!Number.isInteger(kioskId) || kioskId <= 0 || !CODE_RE.test(code)) return null;
  return { kioskId, code };
};

export const KioskLoginApprove = ({ kioskId, code, locale, isLoggedIn }: {
  kioskId: number | null;
  code: string | null;
  locale: Locale;
  isLoggedIn: boolean;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const initialTarget = useMemo<Target | null>(() => (kioskId && code && CODE_RE.test(code) ? { kioskId, code } : null), [kioskId, code]);
  const hasParams = kioskId !== null || code !== null;
  const [state, setState] = useState<State>(() => {
    if (!isLoggedIn) return { kind: 'needLogin' };
    if (initialTarget) return { kind: 'loading', target: initialTarget };
    // 파라미터가 왔는데 꼴이 틀리면 안내, 아예 없으면 스캔
    if (hasParams) return { kind: 'error', code: 'INVALID_QR', message: t('kiosk_login_approve_invalid'), fromScan: false };
    return { kind: 'scan' };
  });
  const [scanError, setScanError] = useState<string | null>(null);
  const inflightRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.kind !== 'loading') return;
    const key = `${state.target.kioskId}:${state.target.code}`;
    if (inflightRef.current === key) return;
    inflightRef.current = key;
    approveKioskLoginAction(state.target).then((res) => {
      if (isGuinnessErrorCase(res)) setState({ kind: 'error', code: res.code, message: res.message, fromScan: !initialTarget });
      else setState({ kind: 'done', res });
    });
  }, [state, initialTarget]);

  const onScanned = useCallback((decoded: string) => {
    const target = parseKioskLoginQr(decoded);
    if (!target) { setScanError(t('kiosk_login_scan_not_kiosk_qr')); return; }
    setScanError(null);
    setState({ kind: 'loading', target });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const goBack = () => kloudNav.back();
  const goHome = () => kloudNav.navigateMain({});
  const goLogin = () => kloudNav.push(KloudScreen.Login(''));
  const rescan = () => { inflightRef.current = null; setScanError(null); setState({ kind: 'scan' }); };

  if (state.kind === 'scan') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#000' }}>
        <QRScanner
          onSuccess={onScanned}
          onError={(m) => setScanError(m)}
          onBack={goBack}
          resultState={scanError ? 'error' : 'idle'}
          resultMessage={scanError ?? undefined}
        />
        <div
          style={{ position: 'fixed', left: 16, right: 16, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)', zIndex: 10002 }}
          className={'rounded-[16px] bg-black/70 backdrop-blur px-4 py-3.5 text-center'}
        >
          <p className={'text-[15px] font-bold text-white'}>{t('admin_kiosk_login_title')}</p>
          <p className={'mt-1 text-[13px] text-white/80 whitespace-pre-line leading-snug'}>{t('kiosk_login_scan_hint')}</p>
        </div>
      </div>
    );
  }

  const primaryBtn = 'mt-6 w-full h-[52px] rounded-[14px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform';
  const secondaryBtn = 'mt-2.5 w-full h-[52px] rounded-[14px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform';

  return (
    <main className="min-h-[100dvh] w-full bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[380px] text-center">
        {state.kind === 'loading' && (
          <>
            <Loader2 size={44} className="mx-auto text-[#1E2124] animate-spin"/>
            <p className="mt-5 text-[17px] font-bold text-black">{t('kiosk_login_approve_loading')}</p>
          </>
        )}

        {state.kind === 'done' && (
          <>
            <CheckCircle2 size={56} className="mx-auto text-[#1E2124]"/>
            <p className="mt-5 text-[19px] font-bold text-black whitespace-pre-line">
              {t('kiosk_login_approve_done').replace('{kiosk}', state.res.kioskName)}
            </p>
            <p className="mt-2 text-[14px] text-[#6D7882] whitespace-pre-line">
              {state.res.studentId === null ? t('kiosk_login_approve_not_student') : t('kiosk_login_approve_done_desc')}
            </p>
            <p className="mt-4 text-[12.5px] text-[#9AA3AD] whitespace-pre-line">{t('kiosk_login_approve_retry_hint')}</p>
            <button type="button" onClick={initialTarget ? goHome : goBack} className={primaryBtn}>{t('kiosk_confirm')}</button>
            {!initialTarget && <button type="button" onClick={rescan} className={secondaryBtn}>{t('kiosk_login_scan_again')}</button>}
          </>
        )}

        {state.kind === 'needLogin' && (
          <>
            <LogIn size={52} className="mx-auto text-[#1E2124]"/>
            <p className="mt-5 text-[19px] font-bold text-black">{t('kiosk_login_approve_need_login')}</p>
            <p className="mt-2 text-[14px] text-[#6D7882] whitespace-pre-line">{t('kiosk_login_approve_need_login_desc')}</p>
            <button type="button" onClick={goLogin} className={primaryBtn}>{t('login')}</button>
          </>
        )}

        {state.kind === 'error' && (
          <>
            <AlertTriangle size={52} className="mx-auto text-[#E55B5B]"/>
            <p className="mt-5 text-[19px] font-bold text-black">{t('kiosk_login_approve_failed')}</p>
            <p className="mt-2 text-[14px] text-[#6D7882] whitespace-pre-line">
              {state.code === 'INVALID_QR' ? state.message : `${state.message} (${state.code})`}
            </p>
            <p className="mt-4 text-[12.5px] text-[#9AA3AD] whitespace-pre-line">{t('kiosk_login_approve_retry_hint')}</p>
            {state.fromScan
              ? <button type="button" onClick={rescan} className={primaryBtn}>{t('kiosk_login_scan_again')}</button>
              : <button type="button" onClick={goHome} className={primaryBtn}>{t('kiosk_confirm')}</button>}
          </>
        )}
      </div>
    </main>
  );
};
