import PhoneVerificationForm from "@/app/login/phone/PhoneVerificationForm";
import { getLocale } from "@/utils/translate";
import { getPhoneVerificationSteps } from "@/app/login/action/get.phone.verification.steps";

export default async function CertificationPage() {
  const locale = await getLocale();
  return (
    <div>
      <PhoneVerificationForm steps={await getPhoneVerificationSteps()} locale={locale} isFromLogin={false}/>
    </div>
  )
}