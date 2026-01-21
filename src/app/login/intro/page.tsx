import { LoginButtonForm } from "@/app/login/login.button.form";
import { DevTapLogo } from "@/app/login/DevTapToGo";
import { translate } from "@/utils/translate";

export default async function LoginIntroPage({
                                               searchParams,
                                             }: {
  searchParams: Promise<{
    os: string;
    appVersion: string;
    code: string;
    returnUrl: string;
    state: string;
  }>;
}) {

  const {os, appVersion, returnUrl} = await searchParams;

  const translations = {
    continueWithApple: await translate('continue_with_apple'),
    continueWithGoogle: await translate('continue_with_google'),
    continueWithKakao: await translate('continue_with_kakao'),
    continueWithPhone: await translate('continue_with_phone'),
    continueWithEmail: await translate('continue_with_email'),
    recentLogin: await translate('recent_login'),
  };

  return (
    <section
      className="w-screen min-h-screen bg-white flex flex-col items-center pb-7 px-5">
      <div className="flex-1 w-full flex justify-center pt-36">
        <DevTapLogo />
      </div>


      <LoginButtonForm os={os} appVersion={appVersion} returnUrl={returnUrl} translations={translations}/>

    </section>

  )
}