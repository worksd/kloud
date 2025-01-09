'use client';

import AppleLoginButton from "@/app/login/apple.login.button";
import GoogleLoginButton from "@/app/login/google.login.button";
import KakaoLoginButton from "@/app/login/kakaok.login.button";
import { KloudScreen } from "@/shared/kloud.screen";

export default function LoginButtonForm() {

  return (
    <section className="flex flex-col items-center justify-center">
      <div className="space-y-2 w-full p-2">
        <AppleLoginButton/>
        <GoogleLoginButton/>
        <KakaoLoginButton/>
      </div>
      <div className="text-[#86898C] text-[14px] cursor-pointer mt-12"
           onClick={() => window.KloudEvent?.push(KloudScreen.LoginEmail)}>
        이메일로 시작하기
      </div>
    </section>
  );
}