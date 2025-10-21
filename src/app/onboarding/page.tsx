import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { getStudioList } from "@/app/home/action/get.studio.list.action";
import { OnboardingForm } from "@/app/onboarding/OnboardingForm";
import { translate } from "@/utils/translate";
import { getPhoneVerificationSteps } from "@/app/login/action/get.phone.verification.steps";

export default async function Onboarding({searchParams}: {
  searchParams: Promise<{ appVersion: string, returnUrl: string }>
}) {

  const res = await getStudioList({})
  const user = await getUserAction();
  const {returnUrl, appVersion} = await searchParams;

  if (user && 'id' in user) {
    return (
      <OnboardingForm
        user={user}
        confirmText={await translate('confirm')}
        inputBirthMessage={await translate('input_birth_message')}
        inputGenderMessage={await translate('input_gender_message')}
        inputNameMessage={await translate('input_name_message')}
        inputNickNameMessage={await translate('input_nick_name_message')}
        phoneVerificationSteps={await getPhoneVerificationSteps()}
        agreementMessage={await translate('agreement_message')}
        completeMessage={await translate('complete')}
      />
    )
  }
}