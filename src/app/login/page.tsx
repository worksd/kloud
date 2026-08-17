import { LargeKloudButton, LoginButtonForm } from "@/app/login/login.button.form";
import { ChangeLocaleButton } from "@/app/login/change.locale.button";
import { getLocale, translate } from "@/utils/translate";
import { DevTapLogo } from "@/app/login/DevTapToGo";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { redirect } from "next/navigation";
import { LoginCookieCleaner } from "@/app/login/LoginCookieCleaner";

export default async function Login({
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
  const { os, appVersion, returnUrl, code, state } = await searchParams;

  // 카카오 OAuth 콜백: code가 있으면 login/intro로 전달
  if (code) {
    const params = new URLSearchParams();
    params.set('code', code);
    if (state) params.set('state', state);
    if (os) params.set('os', os);
    if (appVersion) params.set('appVersion', appVersion);
    redirect(`/login/intro?${params.toString()}`);
  }

  // PC 카드 레이아웃은 웹 직접 접근일 때만 — 태블릿 '앱' 웹뷰(가로 ≥1024px)의 로그인은 기존 그대로.
  const isWeb = appVersion === '' || appVersion == null;

  return (
    <section
      className={`w-screen min-h-screen bg-white flex flex-col items-center pb-7 px-5 ${isWeb ? 'lg:justify-center lg:pb-0' : ''}`}
    >
      <LoginCookieCleaner />
      {/* 모바일: 로고 상단 + 버튼 하단(세로 스트레치) / PC(lg): 중앙 카드 안에 로고·버튼을 모아 배치 */}
      <div className={isWeb ? "contents lg:flex lg:flex-col lg:items-stretch lg:w-full lg:max-w-[420px] lg:border lg:border-[#f0f1f3] lg:rounded-3xl lg:shadow-sm lg:px-10 lg:pt-16 lg:pb-12" : "contents"}>
        {/* ⬇️ 가운데 배치 — PC 웹 카드에선 로고 미노출 (모바일/앱은 유지, 앱의 개발자 5연타 진입점이기도 함) */}
        <div className={`flex-1 w-full flex justify-center pt-36 ${isWeb ? 'lg:hidden' : ''}`}>
          <DevTapLogo />
        </div>

        {appVersion !== '' && (
          <div className={'mb-6'}>
            <ChangeLocaleButton currentLocale={await getLocale()} selectLanguageText={await translate('select_language')}/>
          </div>
        )}
        <NavigateClickWrapper method={'push'} route={KloudScreen.LoginIntro('')} returnUrl={returnUrl}>
          <LargeKloudButton title={await translate('do_start')} fitContainer={isWeb}/>
        </NavigateClickWrapper>
      </div>

    </section>
  );
}