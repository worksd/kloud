import PhoneVerificationForm from "@/app/login/phone/PhoneVerificationForm";
import { getPhoneVerificationSteps } from "@/app/login/action/get.phone.verification.steps";

export default async function PhoneLoginPage() {

  return (
    <div className={'min-h-screen w-full flex flex-col'}>
      <PhoneVerificationForm steps={await getPhoneVerificationSteps()}/>
    </div>
  )
}
