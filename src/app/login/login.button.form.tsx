'use server'
import AppleLoginButton from "@/app/login/apple.login.button";
import GoogleLoginButton from "@/app/login/google.login.button";
import KakaoLoginButton from "@/app/login/kakao.login.button";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import MobileLogo from "../../../public/assets/ic_mobile.svg";
import { EmailLoginButton } from "@/app/login/email.login.button";
import { PhoneLoginButton } from "@/app/login/phone.login.button";

export const LoginButtonForm = async ({ os, appVersion, returnUrl }: {
  os: string,
  appVersion: string,
  returnUrl?: string
}) => {
  const loginEmailQuery = returnUrl ? `?returnUrl=${returnUrl}` : '';

  return (
    <section className="flex flex-col items-center justify-center space-y-2 w-full px-2">
      {os === 'iOS' && appVersion !== '' && (
        <AppleLoginButton title={await translate('continue_with_apple')} />
      )}
      {os === 'Android' && appVersion !== '' && (
        <GoogleLoginButton title={await translate('continue_with_google')} />
      )}
      <KakaoLoginButton
        appVersion={appVersion}
        callbackUrl={returnUrl}
        title={await translate('continue_with_kakao')}
      />
      <div className="w-full self-stretch">
        <NavigateClickWrapper
          method="push"
          route={KloudScreen.LoginPhone(loginEmailQuery)}
          returnUrl={returnUrl}>
          <PhoneLoginButton/>
        </NavigateClickWrapper>
      </div>
      <div className="w-full self-stretch">
        <NavigateClickWrapper
          method="push"
          route={KloudScreen.LoginEmail(loginEmailQuery)}
          returnUrl={returnUrl}>
          <EmailLoginButton/>
        </NavigateClickWrapper>
      </div>

    </section>
  );
};

export const LargeKloudButton = async ({ title }: { title: string }) => {
  return (
    <div className="relative w-screen px-4">
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