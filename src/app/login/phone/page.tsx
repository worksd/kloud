import PhoneVerificationForm from "@/app/login/phone/PhoneVerificationForm";
import { getPhoneVerificationSteps } from "@/app/login/action/get.phone.verification.steps";
import { getLocale } from "@/utils/translate";
import { LOGIN_GRADIENT_STYLE, LoginGradientBlobs } from "@/app/login/loginWebDecor";

export default async function PhoneLoginPage({ searchParams }: {
  searchParams: Promise<{ returnUrl?: string, appVersion?: string }>
}) {
  const { returnUrl, appVersion } = await searchParams;
  // 웹 직접 접근이면 그래디언트 + PC(lg) 카드 — 앱 웹뷰는 기존 그대로.
  const isWeb = appVersion === '' || appVersion == null;

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col ${isWeb ? 'overflow-hidden' : ''}`}
      style={isWeb ? LOGIN_GRADIENT_STYLE : undefined}
    >
      {isWeb && <LoginGradientBlobs/>}
      <PhoneVerificationForm
        steps={await getPhoneVerificationSteps()}
        locale={await getLocale()}
        isFromLogin={true}
        returnUrl={returnUrl}
        isWeb={isWeb}
      />
    </div>
  )
}
