import { LoginForm } from "@/app/login/email/login.form";
import { translate } from "@/utils/translate";
import { MobileWebViewTopBar } from "@/app/components/MobileWebViewTopBar";
import { LOGIN_GRADIENT_STYLE, LoginGradientBlobs } from "@/app/login/loginWebDecor";
import { WebLoginRedirect } from "@/app/login/WebLoginRedirect";

export default async function EmailLogin({searchParams}: {
  searchParams: Promise<{ appVersion: string, os: string }>
}) {
  const {appVersion, os} = await searchParams;
  // 웹 직접 접근이면 그래디언트 — 앱 웹뷰는 기존 흰 배경 그대로.
  // PC 웹(lg+)은 전용 페이지 대신 WebLoginRedirect가 /lessons?login=true(공통 다이얼로그)로 보낸다.
  const isWeb = appVersion === '' || appVersion == null;
  return (
    <section
      className={`relative min-h-screen flex flex-col ${isWeb ? 'overflow-hidden lg:hidden' : 'bg-white'}`}
      style={isWeb ? LOGIN_GRADIENT_STYLE : undefined}
    >
      {isWeb && <WebLoginRedirect/>}
      {isWeb && <LoginGradientBlobs/>}
      {/* 모바일 웹 전용 상단바 — PC(lg)는 다이얼로그로 리다이렉트되어 이 페이지를 보지 않는다 */}
      {isWeb && (
        <div className="lg:hidden">
          <MobileWebViewTopBar os={os}/>
        </div>
      )}
      <LoginForm
        appVersion={appVersion}
        isWeb={isWeb}
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
