import { LoginForm } from "@/app/login/email/login.form";
import { translate } from "@/utils/translate";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function EmailLogin({searchParams}: {
  searchParams: Promise<{ appVersion: string, returnUrl?: string }>
}) {
  const {returnUrl, appVersion} = await searchParams;
  return (
    <section className="min-h-screen bg-white flex flex-col">
      {appVersion == '' && <SimpleHeader titleResource={'login'}/>}
      <LoginForm
        appVersion={appVersion}
        returnUrl={returnUrl}
        emailLabel={await translate('email')}
        passwordLabel={await translate('password')}
        emailPlaceholder={await translate('input_email_phone_message')}
        passwordPlaceholder={await translate('input_password_message')}
        buttonText={await translate('do_start')}
        noMemberSignUpText={await translate('not_member_sign_up')}
        createAccountText={await translate('create_account')}
        signUpTitle={await translate('sign_up')}
      />
    </section>
  );
}
