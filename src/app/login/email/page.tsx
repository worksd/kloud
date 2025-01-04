"use client"
import Logo from "../../../../public/assets/logo_black.svg";
import ArrowLeftIcon from "../../../../public/assets/left-arrow.svg"
import { isMobile } from "react-device-detect";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/app/login/login.form";

export default function EmailLogin(props: any) {

  const router = useRouter()

  const handleBack = () => {
    if (window) {
      window.KloudEvent.back()
    } else {
      router.back()
    }
  };

  return (
    <section className="min-h-screen bg-white flex flex-col justify-center">

      <Logo className="mb-[60px] mx-auto" />
      <LoginForm />
    </section>
  );
}
