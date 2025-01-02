'use client';

import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import AppleLoginButton from "@/app/login/apple.login.button";
import GoogleLoginButton from "@/app/login/google.login.button";
import KakaoLoginButton from "@/app/login/kakaok.login.button";

export default function LoginButtonForm() {
  const router = useRouter();

  const handleRedirect = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.LoginEmail);
    } else {
      router.push(KloudScreen.LoginEmail);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center">
      <div className="space-y-4 w-full">
        <AppleLoginButton/>
        <GoogleLoginButton/>
        <KakaoLoginButton/>
      </div>
      <div className="text-[#86898C] text-[14px] cursor-pointer mt-12" onClick={handleRedirect}>
        이메일로 시작하기
      </div>
    </section>
  );
}