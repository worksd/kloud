import { LoginButtonForm } from "@/app/login/login.button.form";
import { DevTapLogo } from "@/app/login/DevTapToGo";
import { translate } from "@/utils/translate";
import { LOGIN_GRADIENT_STYLE, LOGIN_WEB_CARD_CLS, LoginGradientBlobs } from "@/app/login/loginWebDecor";
import { WebLoginRedirect } from "@/app/login/WebLoginRedirect";

export default async function LoginIntroPage({
                                               searchParams,
                                             }: {
  searchParams: Promise<{
    os: string;
    appVersion: string;
    code: string;
    state: string;
  }>;
}) {

  const {os, appVersion, code} = await searchParams;

  const translations = {
    continueWithApple: await translate('continue_with_apple'),
    continueWithGoogle: await translate('continue_with_google'),
    continueWithKakao: await translate('continue_with_kakao'),
    continueWithPhone: await translate('continue_with_phone'),
    continueWithEmail: await translate('continue_with_email'),
    recentLogin: await translate('recent_login'),
  };

  // PC 카드 레이아웃/장식 배경은 웹 직접 접근일 때만 — 태블릿 '앱' 웹뷰(가로 ≥1024px)의 로그인은 기존 그대로.
  const isWeb = appVersion === '' || appVersion == null;
  // PC 웹(lg+)은 전용 페이지 대신 /?login=true(공통 다이얼로그)로 —
  // 단, 카카오 OAuth 콜백(code) 처리 중엔 리다이렉트하면 코드 소비 전에 이탈하므로 제외.
  const redirectPcToDialog = isWeb && !code;

  return (
    <section
      className={`relative w-full min-h-screen flex flex-col items-center pb-7 px-5 ${isWeb ? 'overflow-hidden lg:justify-center lg:pb-0' : 'bg-white'} ${redirectPcToDialog ? 'lg:hidden' : ''}`}
      style={isWeb ? LOGIN_GRADIENT_STYLE : undefined}
    >
      {redirectPcToDialog && <WebLoginRedirect/>}
      {/* 장식 블롭 — 웹 전용. pointer-events 차단 없이 배경 분위기만. 컨텐츠는 relative로 위에 얹는다. */}
      {isWeb && <LoginGradientBlobs/>}

      {/* 모바일: 로고 상단 + 버튼 하단(세로 스트레치) / PC(lg): 반투명 유리 카드 */}
      <div className={isWeb
        ? `contents relative lg:flex lg:flex-col lg:items-center ${LOGIN_WEB_CARD_CLS} lg:px-10 lg:pt-14 lg:pb-12`
        : "contents"}>
        <div className={`relative flex-1 w-full flex flex-col items-center pt-36 ${isWeb ? 'lg:flex-none lg:pt-0' : ''}`}>
          <DevTapLogo />
          {/* 웹 전용 환영 카피 — 앱은 기존 로고 단독 유지 */}
          {isWeb && (
            <div className="flex flex-col items-center mt-6 mb-2 lg:mb-8 text-center">
              <h1 className="font-paperlogy text-[20px] lg:text-[22px] text-black leading-snug">
                {await translate('login_intro_title')}
              </h1>
              <p className="text-[13px] lg:text-[14px] text-[#6d7882] mt-2 whitespace-pre-line leading-relaxed">
                {await translate('login_intro_subtitle')}
              </p>
            </div>
          )}
        </div>

        <div className="relative w-full flex justify-center">
          <LoginButtonForm os={os} appVersion={appVersion} translations={translations}/>
        </div>
      </div>

    </section>

  )
}
