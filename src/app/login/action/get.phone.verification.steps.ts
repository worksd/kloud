import { PhoneVerificationStepConfig } from "@/app/login/phone/PhoneVerificationForm";
import { translate } from "@/utils/translate";

export const getPhoneVerificationSteps = async (): Promise<PhoneVerificationStepConfig[]>  => {
  return [
    {
      id: 'phone',
      message: await translate('phone_login_message'),
      buttonText: await translate('submit_code'),
    },
    {
      id: 'code',
      message: await translate('verification_code_message'),
      buttonText: await translate('confirm'),
      placeholder: await translate('placeholder_six_code')
    }
  ]
}