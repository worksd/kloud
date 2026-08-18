import { LoginForm } from "@/app/login/email/login.form";
import { translate } from "@/utils/translate";
import { MobileWebViewTopBar } from "@/app/components/MobileWebViewTopBar";
import { LOGIN_GRADIENT_STYLE, LoginGradientBlobs } from "@/app/login/loginWebDecor";

export default async function EmailLogin({searchParams}: {
  searchParams: Promise<{ appVersion: string, returnUrl?: string, os: string }>
}) {
  const {returnUrl, appVersion, os} = await searchParams;
  // 웹 직접 접근이면 그래디언트 + PC(lg) 카드 — 앱 웹뷰는 기존 흰 배경 그대로.
  const isWeb = appVersion === '' || appVersion == null;
  return (
    <section
      className={`relative min-h-screen flex flex-col ${isWeb ? 'overflow-hidden' : 'bg-white'}`}
      style={isWeb ? LOGIN_GRADIENT_STYLE : undefined}
    >
      {isWeb && <LoginGradientBlobs/>}
      {/* 모바일 웹 전용 상단바 — PC(lg)는 공통 WebTopNav가 이미 있어 숨긴다 */}
      {isWeb && (
        <div className="lg:hidden">
          <MobileWebViewTopBar os={os} isLogin={false}/>
        </div>
      )}
      <LoginForm
        appVersion={appVersion}
        isWeb={isWeb}
        returnUrl={returnUrl}
        emailLabel={await translate('email')}
        passwordLabel={await translate('password')}
        emailPlaceholder={await translate('input_email_message')}
        passwordPlaceholder={await translate('input_password_message')}
        buttonText={await translate('do_start')}
        noMemberSignUpText={await translate('not_member_sign_up')}
        createAccountText={await translate('create_account')}
        signUpTitle={await translate('sign_up')}
      />
    </section>
  );
}
