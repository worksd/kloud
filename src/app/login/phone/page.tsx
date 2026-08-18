import PhoneVerificationForm from "@/app/login/phone/PhoneVerificationForm";
import { getPhoneVerificationSteps } from "@/app/login/action/get.phone.verification.steps";
import { getLocale } from "@/utils/translate";
import { LOGIN_GRADIENT_STYLE, LoginGradientBlobs } from "@/app/login/loginWebDecor";
import { WebLoginRedirect } from "@/app/login/WebLoginRedirect";

export default async function PhoneLoginPage({ searchParams }: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  // 웹 직접 접근이면 그래디언트 — 앱 웹뷰는 기존 그대로.
  // PC 웹(lg+)은 전용 페이지 대신 WebLoginRedirect가 /lessons?login=true(공통 다이얼로그)로 보낸다.
  const isWeb = appVersion === '' || appVersion == null;

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col ${isWeb ? 'overflow-hidden lg:hidden' : ''}`}
      style={isWeb ? LOGIN_GRADIENT_STYLE : undefined}
    >
      {isWeb && <WebLoginRedirect/>}
      {isWeb && <LoginGradientBlobs/>}
      <PhoneVerificationForm
        steps={await getPhoneVerificationSteps()}
        locale={await getLocale()}
        isFromLogin={true}
        isWeb={isWeb}
      />
    </div>
  )
}
