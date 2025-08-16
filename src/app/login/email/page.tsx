import Logo from "../../../../public/assets/logo_black.svg";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { LoginForm } from "@/app/login/email/login.form";

export default async function EmailLogin({searchParams}: {
  searchParams: Promise<{ appVersion: string, returnUrl?: string }>
}) {
  const { returnUrl, appVersion } = await searchParams;
  console.log('returnUrl ' + returnUrl);
  console.log('appVersion ' + appVersion);
  return (
    <section className="min-h-screen bg-white flex flex-col">
      <SimpleHeader titleResource={'email_login'}/>
      <Logo className="mx-auto mt-28"/>
      <LoginForm appVersion={appVersion} returnUrl={returnUrl}/>
    </section>
  );
}
