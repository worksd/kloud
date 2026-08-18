import { LargeKloudButton } from "@/app/login/login.button.form";
import { ChangeLocaleButton } from "@/app/login/change.locale.button";
import { getLocale, translate } from "@/utils/translate";
import { DevTapLogo } from "@/app/login/DevTapToGo";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { redirect } from "next/navigation";
import { LoginCookieCleaner } from "@/app/login/LoginCookieCleaner";
import { WebLoginRedirect } from "@/app/login/WebLoginRedirect";

export default async function Login({
                                      searchParams,
                                    }: {
  searchParams: Promise<{
    os: string;
    appVersion: string;
    code: string;
    state: string;
  }>;
}) {
  const { os, appVersion, code, state } = await searchParams;

  // 카카오 OAuth 콜백: code가 있으면 login/intro로 전달
  if (code) {
    const params = new URLSearchParams();
    params.set('code', code);
    if (state) params.set('state', state);
    if (os) params.set('os', os);
    if (appVersion) params.set('appVersion', appVersion);
    redirect(`/login/intro?${params.toString()}`);
  }

  // 웹 직접 접근 여부 — 태블릿 '앱' 웹뷰(가로 ≥1024px)의 로그인은 기존 그대로.
  // PC 웹(lg+)은 전용 페이지 대신 WebLoginRedirect가 /lessons?login=true(공통 다이얼로그)로 보낸다.
  const isWeb = appVersion === '' || appVersion == null;

  return (
    <section
      className={`w-full min-h-screen bg-white flex flex-col items-center pb-7 px-5 ${isWeb ? 'lg:hidden' : ''}`}
    >
      {isWeb && <WebLoginRedirect/>}
      <LoginCookieCleaner />
      {/* 모바일: 로고 상단 + 버튼 하단(세로 스트레치) — PC 웹은 위 redirect로 진입하지 않는다 */}
      <div className={'flex-1 w-full flex justify-center pt-36'}>
        <DevTapLogo />
      </div>

      {appVersion !== '' && (
        <div className={'mb-6'}>
          <ChangeLocaleButton currentLocale={await getLocale()} selectLanguageText={await translate('select_language')}/>
        </div>
      )}
      <NavigateClickWrapper method={'push'} route={KloudScreen.LoginIntro('')}>
        <LargeKloudButton title={await translate('do_start')}/>
      </NavigateClickWrapper>

    </section>
  );
}
