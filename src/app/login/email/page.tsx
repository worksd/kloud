import Logo from "../../../../public/assets/logo_black.svg";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { LoginForm } from "@/app/login/email/login.form";

export default function EmailLogin(props: any) {

  return (
    <section className="min-h-screen bg-white flex flex-col">
      <SimpleHeader />
      <Logo className="mx-auto mt-14"/>
      <LoginForm/>
    </section>
  );
}
