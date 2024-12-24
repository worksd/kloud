"use client"
import Logo from "../../../../public/assets/logo_black.svg";
import { LoginForm } from "@/app/login/login.form";
import ArrowLeftIcon from "../../../../public/assets/ic_back_arrow.svg"
import { KloudScreen } from "@/shared/kloud.screen";

export default function EmailLogin(props: any) {

  const handleBack = () => {
    window.KloudEvent.back()
  };

  return (
    <section className="min-h-screen bg-white flex flex-col justify-center">
      <div className="absolute top-4 left-4">
        <button className="flex items-center justify-center text-black rounded-full" onClick={handleBack}>
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </div>
      <Logo className="mb-[60px] mx-auto" />
      <LoginForm />
    </section>
  );
}
