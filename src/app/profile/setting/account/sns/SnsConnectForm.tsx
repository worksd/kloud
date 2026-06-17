'use client'

// SNS 계정 연결 폼 — 로그인 화면과 동일한 네이티브 OAuth 브릿지를 재사용하되,
// 토큰을 로그인이 아니라 "기존 계정에 연결" 용도로 서버에 보낸다.
// iOS: Apple + 카카오 / Android: 구글 + 카카오 (로그인 버튼 노출 규칙과 동일)

import { useEffect, useState } from "react";
import AppleLogo from "../../../../../../public/assets/logo_apple.svg";
import GoogleLogo from "../../../../../../public/assets/logo_google.svg";
import KakaoLogo from "../../../../../../public/assets/logo_kakao.svg";

// 테스트용 — OAuth 콜백으로 받은 토큰을 화면에 표시. 연결 API 연동 시 제거 예정.
type ReceivedToken = {
  provider: 'apple' | 'google' | 'kakao';
  code: string;
  name?: string;
};

export const SnsConnectForm = ({ os, appVersion, translations }: {
  os: string,
  appVersion: string,
  translations: {
    description: string,
    connectWithApple: string,
    connectWithGoogle: string,
    connectWithKakao: string,
  },
}) => {

  const [receivedToken, setReceivedToken] = useState<ReceivedToken | null>(null);

  useEffect(() => {
    // 네이티브가 OAuth 완료 후 호출하는 콜백 — 로그인 화면과 같은 이름이지만
    // 이 화면에 있는 동안은 연결 핸들러로 동작 (페이지 이탈 시 로그인 화면이 다시 덮어씀)
    window.onAppleLoginSuccess = async (data: { code: string, name: string }) => {
      // TODO: SNS 계정 연결 API 연동 (BE 개발중) — Apple OAuth code로 현재 계정에 연결
      setReceivedToken({ provider: 'apple', code: data.code, name: data.name });
    };
    window.onGoogleLoginSuccess = async (data: { code: string }) => {
      // TODO: SNS 계정 연결 API 연동 (BE 개발중) — Google OAuth code로 현재 계정에 연결
      setReceivedToken({ provider: 'google', code: data.code });
    };
    window.onKakaoLoginSuccess = async (data: { code: string }) => {
      // TODO: SNS 계정 연결 API 연동 (BE 개발중) — Kakao OAuth code로 현재 계정에 연결
      setReceivedToken({ provider: 'kakao', code: data.code });
    };
  }, []);

  const appleConnect = () => {
    window.KloudEvent?.sendAppleLogin();
  };

  const googleConnect = () => {
    const configuration = {
      serverClientId: process.env.NEXT_PUBLIC_GOOGLE_SERVER_CLIENAT_ID,
      nonce: process.env.NEXT_PUBLIC_GOOGLE_NONCE,
    };
    window.KloudEvent?.sendGoogleLogin(JSON.stringify(configuration));
  };

  const kakaoConnect = () => {
    window.KloudEvent?.sendKakaoLogin();
  };

  return (
    <div className={'flex flex-col px-5 pt-4 gap-4'}>
      <p className={'text-[14px] text-[#86898C] font-medium'}>{translations.description}</p>

      <section className="flex flex-col items-center justify-center space-y-2 w-full">
        {os === 'iOS' && appVersion !== '' && (
          <button
            className={`relative flex items-center justify-center bg-black text-white text-lg font-semibold
              rounded-[16px] py-4 shadow-lg w-full
              active:scale-[0.95] transition-transform duration-150 select-none`}
            onClick={appleConnect}
          >
            <span className="absolute left-4"><AppleLogo/></span>
            <div className="flex-1 text-center text-[16px]">{translations.connectWithApple}</div>
          </button>
        )}

        {os === 'Android' && appVersion !== '' && (
          <button
            className={`relative flex items-center justify-center bg-white text-black text-lg font-semibold rounded-[16px] py-4 shadow-lg w-full
              active:scale-[0.95] transition-transform duration-150 border border-gray-200 select-none`}
            onClick={googleConnect}
          >
            <span className="absolute left-4"><GoogleLogo/></span>
            <div className={'flex-1 text-center text-[16px]'}>{translations.connectWithGoogle}</div>
          </button>
        )}

        <button
          className={`relative flex items-center justify-center bg-[#FEE500] text-black text-lg font-semibold rounded-[16px] py-4 shadow-lg w-full
            active:scale-[0.95] transition-transform duration-150 select-none`}
          onClick={kakaoConnect}
        >
          <span className="absolute left-4"><KakaoLogo/></span>
          <div className={'flex-1 text-center text-[16px]'}>{translations.connectWithKakao}</div>
        </button>
      </section>

      {/* 테스트용 — 전달받은 OAuth 토큰 표시. 연결 API 연동 시 제거 */}
      {receivedToken && (
        <div className={'flex flex-col gap-1 p-4 bg-[#F7F8F9] rounded-xl'}>
          <span className={'text-[12px] font-bold text-black uppercase'}>{receivedToken.provider}</span>
          {receivedToken.name && (
            <span className={'text-[12px] text-[#505356]'}>name: {receivedToken.name}</span>
          )}
          <span className={'text-[12px] text-[#505356] break-all'}>code: {receivedToken.code}</span>
        </div>
      )}
    </div>
  );
};
