'use client'

// SNS 계정 연결 폼 — 로그인과 동일한 네이티브 OAuth 브릿지로 토큰을 받아
// POST /auth/social-link로 현재 계정에 연결한다.
//  - 이미 연결된 provider는 로고 + '연결됨' 표시(액션 없음)
//  - 미연결 provider만 플랫폼 분기(iOS:Apple / Android:Google / 공통:Kakao)로 연결 버튼 노출
//  - 에러(isGuinnessErrorCase) → KloudEvent.showDialog
//  - 다른 계정에 물린 SNS(needsConfirm) → 이전 확인 다이얼로그 → 동일 token/code + confirm:true 재요청

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppleLogo from "../../../../../../public/assets/logo_apple.svg";
import GoogleLogo from "../../../../../../public/assets/logo_google.svg";
import KakaoLogo from "../../../../../../public/assets/logo_kakao.svg";
import { SnsProvider, SocialLinkResponse } from "@/app/endpoint/auth.endpoint";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { socialLinkAction } from "@/app/profile/setting/account/sns/sns.actions";

type Translations = {
  description: string;
  connectWithApple: string;
  connectWithGoogle: string;
  connectWithKakao: string;
  connected: string;
  linkSuccess: string;
  transferWarnTitle: string;
  transferWarnMessage: string;
  transferWarnBullet1: string;
  transferWarnBullet2: string;
  transferWarnConfirm: string;
  cancel: string;
};

type PendingLink = { provider: SnsProvider; token: string; name?: string };

export const SnsConnectForm = ({ os, appVersion, connectedProviders, translations }: {
  os: string,
  appVersion: string,
  connectedProviders: string[],
  translations: Translations,
}) => {
  const router = useRouter();
  const pendingRef = useRef<PendingLink | null>(null);
  // 다른 계정에 물린 SNS 이전 — 먼저 경고 시트를 띄우고, 동의해야 네이티브 확인 다이얼로그로 진행
  const [showTransferWarn, setShowTransferWarn] = useState(false);

  const showSimpleDialog = useCallback(async (message: string) => {
    const dialog = await createDialog({ id: 'Simple', message });
    if (dialog) window.KloudEvent?.showDialog(JSON.stringify(dialog));
  }, []);

  // 경고 시트에서 '이해했어요' → 기존 이전 확인 다이얼로그 표시 (onDialogConfirm에서 confirm:true 재요청)
  const proceedTransfer = useCallback(async () => {
    setShowTransferWarn(false);
    const dialog = await createDialog({ id: 'SnsLinkTransfer' });
    if (dialog) window.KloudEvent?.showDialog(JSON.stringify(dialog));
  }, []);

  // 실제 연결 호출 — confirm 단계 공용
  const runLink = useCallback(async (params: { provider: SnsProvider; token: string; name?: string; confirm: boolean }) => {
    const res = await socialLinkAction({
      provider: params.provider,
      token: params.token,
      code: params.token,
      name: params.name,
      confirm: params.confirm,
    });
    // 에러 → 다이얼로그
    if (isGuinnessErrorCase(res)) {
      await showSimpleDialog(res.message);
      return;
    }
    const r = res as SocialLinkResponse;
    // 다른 계정에 연결됨 → 곧바로 다이얼로그 대신 '계정/데이터 잃을 수 있음' 경고 시트부터 노출
    if (r.needsConfirm) {
      setShowTransferWarn(true);
      return;
    }
    // 성공
    window.KloudEvent?.showToast?.(translations.linkSuccess);
    pendingRef.current = null;
    router.refresh();
  }, [showSimpleDialog, translations.linkSuccess, router]);

  const handleLink = useCallback((provider: SnsProvider, code: string, name?: string) => {
    pendingRef.current = { provider, token: code, name };
    void runLink({ provider, token: code, name, confirm: false });
  }, [runLink]);

  // OAuth 콜백 + 이전 확인 콜백 등록 (이 화면에 있는 동안만 연결 핸들러로 동작)
  useEffect(() => {
    window.onAppleLoginSuccess = async (data: { code: string, name: string }) => handleLink(SnsProvider.Apple, data.code, data.name);
    window.onGoogleLoginSuccess = async (data: { code: string }) => handleLink(SnsProvider.Google, data.code);
    window.onKakaoLoginSuccess = async (data: { code: string }) => handleLink(SnsProvider.Kakao, data.code);
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id !== 'SnsLinkTransfer') return;
      const p = pendingRef.current;
      if (!p) return;
      void runLink({ provider: p.provider, token: p.token, name: p.name, confirm: true });
    };
  }, [handleLink, runLink]);

  const startApple = () => window.KloudEvent?.sendAppleLogin();
  const startGoogle = () => window.KloudEvent?.sendGoogleLogin(JSON.stringify({
    serverClientId: process.env.NEXT_PUBLIC_GOOGLE_SERVER_CLIENAT_ID,
    nonce: process.env.NEXT_PUBLIC_GOOGLE_NONCE,
  }));
  const startKakao = () => window.KloudEvent?.sendKakaoLogin();

  const isApp = appVersion !== '';
  const providers = [
    { key: 'Apple', Logo: AppleLogo, label: translations.connectWithApple, start: startApple, platformOk: os === 'iOS' && isApp,
      btn: 'bg-black text-white', logoWrap: '' },
    { key: 'Google', Logo: GoogleLogo, label: translations.connectWithGoogle, start: startGoogle, platformOk: os === 'Android' && isApp,
      btn: 'bg-white text-black border border-gray-200', logoWrap: '' },
    { key: 'Kakao', Logo: KakaoLogo, label: translations.connectWithKakao, start: startKakao, platformOk: isApp,
      btn: 'bg-[#FEE500] text-black', logoWrap: '' },
  ];

  return (
    <div className={'flex flex-col px-5 pt-4 gap-4'}>
      <p className={'text-[14px] text-[#86898C] font-medium'}>{translations.description}</p>

      <section className="flex flex-col items-center justify-center space-y-2 w-full">
        {providers.map(({ key, Logo, label, start, platformOk, btn }) => {
          const connected = connectedProviders.includes(key);
          // 연결된 건 항상 표시, 미연결은 플랫폼 해당 시에만 연결 버튼 노출
          if (!connected && !platformOk) return null;

          if (connected) {
            return (
              <div
                key={key}
                className="relative flex items-center w-full rounded-[16px] py-4 px-4 bg-[#F2F4F6] select-none"
              >
                <span className="flex-shrink-0"><Logo/></span>
                <span className="ml-3 flex-1 text-[15px] font-semibold text-[#1E2124]">{key}</span>
                <span className="flex items-center gap-1 text-[14px] font-bold text-[#3CC0AF]">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path d="M5 12.5L10 17.5L19 8" stroke="#3CC0AF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {translations.connected}
                </span>
              </div>
            );
          }

          return (
            <button
              key={key}
              onClick={start}
              className={`relative flex items-center justify-center text-lg font-semibold rounded-[16px] py-4 shadow-lg w-full active:scale-[0.95] transition-transform duration-150 select-none ${btn}`}
            >
              <span className="absolute left-4"><Logo/></span>
              <div className="flex-1 text-center text-[16px]">{label}</div>
            </button>
          );
        })}
      </section>

      {/* 다른 계정에 물린 SNS 이전 경고 시트 */}
      {showTransferWarn && (
        <div className="fixed inset-0 z-[1200] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTransferWarn(false)}
          />
          <div className="relative w-full max-w-md rounded-t-[24px] bg-white px-6 pt-7 pb-8 animate-[slideUp_0.2s_ease-out]">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDECEC]">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                        stroke="#E5484D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-[18px] font-bold text-[#1E2124]">{translations.transferWarnTitle}</h2>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-[#4E5256]">
                {translations.transferWarnMessage}
              </p>
            </div>

            <div className="mt-5 rounded-[14px] bg-[#FBF1F1] px-4 py-3.5 space-y-2">
              {[translations.transferWarnBullet1, translations.transferWarnBullet2].map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#E5484D]" />
                  <span className="text-[13px] font-medium leading-relaxed text-[#C0383C]">{b}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={proceedTransfer}
                className="w-full rounded-[14px] bg-[#E5484D] py-4 text-[15px] font-bold text-white active:scale-[0.98] transition-transform"
              >
                {translations.transferWarnConfirm}
              </button>
              <button
                onClick={() => setShowTransferWarn(false)}
                className="w-full rounded-[14px] py-4 text-[15px] font-semibold text-[#86898C] active:scale-[0.98] transition-transform"
              >
                {translations.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
