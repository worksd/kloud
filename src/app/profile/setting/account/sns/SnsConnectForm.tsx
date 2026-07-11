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
import { LinkedUser, SnsProvider, SocialLinkResponse } from "@/app/endpoint/auth.endpoint";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { createDialog } from "@/utils/dialog.factory";
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
  joinedSuffix: string;
  hourUnit: string;
  minuteUnit: string;
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
  // 닫힐 때 슬라이드 다운 애니메이션을 재생한 뒤 언마운트
  const [isClosing, setIsClosing] = useState(false);
  const closeTransferWarn = useCallback(() => setIsClosing(true), []);
  // 이 SNS가 이미 물려있는 이전 계정 정보 (경고 시트에 표시)
  const [linkedUser, setLinkedUser] = useState<LinkedUser | null>(null);

  const showSimpleDialog = useCallback(async (message: string) => {
    const dialog = await createDialog({ id: 'Simple', message });
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
    // 다른 계정에 물린 SNS(TRANSFER) → 곧바로 다이얼로그 대신 '가져오기 안내' 경고 시트부터 노출.
    // (SNS 로그인 수단만 이전되고 옛 계정의 결제·티켓 데이터는 그대로 남음)
    if (r.needsConfirm) {
      setLinkedUser(r.linkedUser ?? null);
      setIsClosing(false);
      setShowTransferWarn(true);
      return;
    }
    // 성공
    window.KloudEvent?.showToast?.(translations.linkSuccess);
    pendingRef.current = null;
    router.refresh();
  }, [showSimpleDialog, translations.linkSuccess, router]);

  // 경고 시트에서 '가져오기' → 동일 token/code + confirm:true로 바로 재요청 (다이얼로그 단계 없이)
  const proceedTransfer = useCallback(async () => {
    const p = pendingRef.current;
    setShowTransferWarn(false);
    if (!p) return;
    await runLink({ provider: p.provider, token: p.token, name: p.name, confirm: true });
  }, [runLink]);

  const handleLink = useCallback((provider: SnsProvider, code: string, name?: string) => {
    pendingRef.current = { provider, token: code, name };
    void runLink({ provider, token: code, name, confirm: false });
  }, [runLink]);

  // OAuth 콜백 등록 (이 화면에 있는 동안만 연결 핸들러로 동작)
  useEffect(() => {
    window.onAppleLoginSuccess = async (data: { code: string, name: string }) => handleLink(SnsProvider.Apple, data.code, data.name);
    window.onGoogleLoginSuccess = async (data: { code: string }) => handleLink(SnsProvider.Google, data.code);
    window.onKakaoLoginSuccess = async (data: { code: string }) => handleLink(SnsProvider.Kakao, data.code);
  }, [handleLink]);

  // "2025.01.28 02:13" → "02시 13분" (다국어 단위) 형태로 변환
  const formatJoinedTime = (createdAt: string) => {
    const time = createdAt.split(' ').pop() ?? '';
    const [hh, mm] = time.split(':');
    if (!hh || !mm) return createdAt;
    // 단위 문자가 있는 로케일(ko/jp/zh)은 "02시 13분", 없는 로케일(en)은 "02:13"
    return translations.hourUnit && translations.minuteUnit
      ? `${hh}${translations.hourUnit} ${mm}${translations.minuteUnit}`
      : `${hh}:${mm}`;
  };

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
      {showTransferWarn && (() => {
        // 확인 버튼 색은 이전하려는 SNS 종류에 맞춘다 (Apple:검정 / Google:흰색 / Kakao:노랑)
        const confirmBtn = providers.find(p => p.key === pendingRef.current?.provider)?.btn
          ?? 'bg-[#E5484D] text-white';
        return (
        <div className="fixed inset-0 z-[1200] flex items-end justify-center">
          <div
            className={`absolute inset-0 bg-black/50 ${isClosing ? 'animate-[fadeOut_0.2s_ease-out_forwards]' : 'animate-[fadeIn_0.2s_ease-out]'}`}
            onClick={closeTransferWarn}
          />
          <div
            className={`relative w-full max-w-md rounded-t-[24px] bg-white px-6 pt-7 pb-8 ${isClosing ? 'animate-[slideDown_0.2s_ease-out_forwards]' : 'animate-[slideUp_0.2s_ease-out]'}`}
            onAnimationEnd={() => {
              if (isClosing) {
                setShowTransferWarn(false);
                setIsClosing(false);
              }
            }}
          >
            <button
              onClick={closeTransferWarn}
              aria-label={translations.cancel}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#86898C] active:scale-90 transition-transform"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex flex-col items-center text-center">
              <h2 className="text-[18px] font-bold text-[#1E2124]">{translations.transferWarnTitle}</h2>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-[#4E5256]">
                {translations.transferWarnMessage}
              </p>
            </div>

            {linkedUser && (
              <div className="mt-5 flex items-center gap-3 rounded-[14px] bg-[#F2F4F6] px-4 py-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={linkedUser.profileImageUrl}
                  alt={linkedUser.nickName}
                  className="h-11 w-11 flex-shrink-0 rounded-full object-cover bg-[#E5E8EB]"
                />
                <div className="flex min-w-0 flex-col text-left">
                  <span className="truncate text-[15px] font-bold text-[#1E2124]">{linkedUser.nickName}</span>
                  <span className="truncate text-[13px] text-[#86898C]">{linkedUser.email}</span>
                  <span className="mt-0.5 text-[12px] text-[#ADB1B5]">{formatJoinedTime(linkedUser.createdAt)} {translations.joinedSuffix}</span>
                </div>
              </div>
            )}

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
                className={`w-full rounded-[14px] py-4 text-[15px] font-bold active:scale-[0.98] transition-transform ${confirmBtn}`}
              >
                {translations.transferWarnConfirm}
              </button>
              <button
                onClick={closeTransferWarn}
                className="w-full rounded-[14px] py-4 text-[15px] font-semibold text-[#86898C] active:scale-[0.98] transition-transform"
              >
                {translations.cancel}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};
