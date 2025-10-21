import { SignupForm } from "@/app/signUp/signup.form";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { translate } from "@/utils/translate";

export default async function EmailSignUpPage({searchParams}: { searchParams: Promise<{ returnUrl: string, appVersion: string }> }) {
  const {returnUrl, appVersion} = await searchParams
  return (
    <div className={"flex flex-col pt-24"}>
      <div className="flex justify-between items-center">
        {appVersion == '' && <SimpleHeader titleResource={'sign_up'}/>}
      </div>
      <SignupForm
        returnUrl={returnUrl}
        appVersion={appVersion}
        requireLabel={await translate('required')}
        emailLabel={await translate('email')}
        emailPlaceholder={await translate('input_email_phone_message')}
        passwordLabel={await translate('password')}
        passwordPlaceholder={await translate('input_password_message')}
        buttonText={await translate('sign_up')}
        passwordMinLengthText={await translate('password_min_length')}
        passwordEmailFormatText={await translate('email_format')}
        passwordRequirementsText={await translate('password_requirements')}
      />
    </div>
  );

}

