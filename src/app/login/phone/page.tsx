import PhoneVerificationForm from "@/app/login/phone/PhoneVerificationForm";
import { getPhoneVerificationSteps } from "@/app/login/action/get.phone.verification.steps";
import { getLocale } from "@/utils/translate";

export default async function PhoneLoginPage({ searchParams }: {
  searchParams: Promise<{ returnUrl?: string }>
}) {
  const { returnUrl } = await searchParams;

  return (
    <div className={'min-h-screen w-full flex flex-col'}>
      <PhoneVerificationForm steps={await getPhoneVerificationSteps()} locale={await getLocale()} isFromLogin={true} returnUrl={returnUrl}/>
    </div>
  )
}
