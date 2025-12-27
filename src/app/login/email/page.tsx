import { LoginForm } from "@/app/login/email/login.form";
import { translate } from "@/utils/translate";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import {MobileWebViewTopBar} from "@/app/components/MobileWebViewTopBar";

export default async function EmailLogin({searchParams}: {
  searchParams: Promise<{ appVersion: string, returnUrl?: string, os: string }>
}) {
  const {returnUrl, appVersion, os} = await searchParams;
  return (
    <section className="min-h-screen bg-white flex flex-col">
      {appVersion == '' && <MobileWebViewTopBar os={os} isLogin={false}/>}
      <LoginForm
        appVersion={appVersion}
        returnUrl={returnUrl}
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
