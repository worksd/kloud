'use client'
import AppleLoginButton from "@/app/login/apple.login.button";
import GoogleLoginButton from "@/app/login/google.login.button";
import KakaoLoginButton from "@/app/login/kakao.login.button";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { EmailLoginButton } from "@/app/login/email.login.button";
import { PhoneLoginButton } from "@/app/login/phone.login.button";
import { getRecentLoginMethod, LoginMethod } from "@/app/login/recentLoginMethod";
import { useEffect, useState } from "react";

export const LoginButtonForm = ({ os, appVersion, translations }: {
  os: string,
  appVersion: string,
  translations: {
    continueWithApple: string,
    continueWithGoogle: string,
    continueWithKakao: string,
    continueWithPhone: string,
    continueWithEmail: string,
    recentLogin: string,
  }
}) => {
  const [recentMethod, setRecentMethod] = useState<LoginMethod | null>(null);

  useEffect(() => {
    setRecentMethod(getRecentLoginMethod());
  }, []);

  return (
    <section className="flex flex-col items-center justify-center space-y-2 w-full px-2">
      {os === 'iOS' && appVersion !== '' && (
        <AppleLoginButton
          title={translations.continueWithApple}
          isRecentLogin={recentMethod === 'apple'}
          recentLoginText={translations.recentLogin}
        />
      )}
      {os === 'Android' && appVersion !== '' && (
        <GoogleLoginButton
          title={translations.continueWithGoogle}
          isRecentLogin={recentMethod === 'google'}
          recentLoginText={translations.recentLogin}
        />
      )}
      <KakaoLoginButton
        appVersion={appVersion}
        title={translations.continueWithKakao}
        isRecentLogin={recentMethod === 'kakao'}
        recentLoginText={translations.recentLogin}
      />
      <div className="w-full self-stretch">
        <NavigateClickWrapper
          method="push"
          route={KloudScreen.LoginPhone('')}>
          <PhoneLoginButton
            title={translations.continueWithPhone}
            isRecentLogin={recentMethod === 'phone'}
            recentLoginText={translations.recentLogin}
          />
        </NavigateClickWrapper>
      </div>
      <div className="w-full self-stretch">
        <NavigateClickWrapper
          method="push"
          route={KloudScreen.LoginEmail('')}>
          <EmailLoginButton
            title={translations.continueWithEmail}
            isRecentLogin={recentMethod === 'email'}
            recentLoginText={translations.recentLogin}
          />
        </NavigateClickWrapper>
      </div>

    </section>
  );
};

export const LargeKloudButton = ({ title, fitContainer = false }: {
  title: string,
  /**
   * true면 PC(lg)에서 w-screen 대신 컨테이너 폭을 따른다 — 로그인 카드(max-w 420px) 안에서
   * 100vw로 터지는 것 방지. 기본 false: 모바일/앱(태블릿 포함)은 기존 그대로.
   */
  fitContainer?: boolean,
}) => {
  return (
    <div className={fitContainer ? 'relative w-screen px-4 lg:w-full lg:px-0' : 'relative w-screen px-4'}>
      <div
        className="
          flex items-center justify-center
          w-full rounded-[16px] bg-black text-white text-[16px] font-medium shadow-lg
          py-4 select-none transition-transform duration-150 active:scale-[0.98]
        "
      >
        {title}
      </div>
    </div>
  );
}