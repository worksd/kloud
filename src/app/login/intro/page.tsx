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

  // PC 카드 레이아웃은 웹 직접 접근일 때만 — 태블릿 '앱' 웹뷰(가로 ≥1024px)의 로그인은 기존 그대로.
  const isWeb = appVersion === '' || appVersion == null;

  return (
    <section
      className={`w-screen min-h-screen bg-white flex flex-col items-center pb-7 px-5 ${isWeb ? 'lg:justify-center lg:pb-0' : ''}`}>
      {/* 모바일: 로고 상단 + 버튼 하단(세로 스트레치) / PC(lg): 중앙 카드 */}
      <div className={isWeb ? "contents lg:flex lg:flex-col lg:items-center lg:w-full lg:max-w-[420px] lg:border lg:border-[#f0f1f3] lg:rounded-3xl lg:shadow-sm lg:px-10 lg:pt-16 lg:pb-12" : "contents"}>
        {/* PC 웹 카드에선 로고 미노출 — 상단바(WebTopNav)에 이미 로고가 있어 중복 (모바일/앱은 유지) */}
        <div className={`flex-1 w-full flex justify-center pt-36 ${isWeb ? 'lg:hidden' : ''}`}>
          <DevTapLogo />
        </div>


        <LoginButtonForm os={os} appVersion={appVersion} returnUrl={returnUrl} translations={translations}/>
      </div>

    </section>

  )
}