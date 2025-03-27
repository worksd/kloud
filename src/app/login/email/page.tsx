import Logo from "../../../../public/assets/logo_black.svg";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { LoginForm } from "@/app/login/email/login.form";

export default async function EmailLogin({searchParams}: {
  searchParams: Promise<{ appVersion: string, returnUrl: string }>
}) {
  const { returnUrl, appVersion } = await searchParams;
  return (
    <section className="min-h-screen bg-white flex flex-col">
      <SimpleHeader/>
      <Logo className="mx-auto mt-14"/>
      <LoginForm appVersion={appVersion} returnUrl={returnUrl}/>
    </section>
  );
}
