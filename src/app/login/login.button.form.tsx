'use server'
import AppleLoginButton from "@/app/login/apple.login.button";
import GoogleLoginButton from "@/app/login/google.login.button";
import KakaoLoginButton from "@/app/login/kakaok.login.button";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const LoginButtonForm = async ({os, appVersion, returnUrl}: { os: string, appVersion: string, returnUrl: string}) => {
  return (
    <section className="flex flex-col items-center justify-center">
      <div className="space-y-2 w-full p-2">
        {os === 'iOS' && appVersion != '' && <AppleLoginButton/>}
        {os === 'Android' && appVersion != '' && <GoogleLoginButton/>}
        <KakaoLoginButton appVersion={appVersion} callbackUrl={returnUrl}/>
      </div>
      <NavigateClickWrapper method={'push'} route={KloudScreen.LoginEmail(returnUrl)}>
        <div className="text-[#86898C] text-[14px] cursor-pointer mt-12">
          {await translate('email_login')}
        </div>
      </NavigateClickWrapper>

    </section>
  );
}