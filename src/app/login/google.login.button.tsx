'use client'
import GoogleLogo from "../../../public/assets/logo_google.svg";
import { useEffect } from "react";
import { googleLoginAction } from "@/app/login/action/google.login.action";
import { loginAuthNavigation } from "@/app/login/login.auth.navigation";

const GoogleLoginButton = () => {
  useEffect(() => {
    window.onGoogleLoginSuccess = async (data: { code: string }) => {
      const res = await googleLoginAction({code: data.code})
      loginAuthNavigation({
        status: res.status,
        window: window,
      })
    };
  }, []);

  const googleLogin = () => {
    const configuration = {
      serverClientId: process.env.NEXT_PUBLIC_GOOGLE_SERVER_CLIENAT_ID,
      nonce: process.env.NEXT_PUBLIC_GOOGLE_NONCE,
    }
    window.KloudEvent?.sendGoogleLogin(JSON.stringify(configuration));
  }

  return (
    <button
      className="relative flex items-center justify-center bg-white text-black text-lg font-semibold rounded-lg h-14 shadow-lg w-full border border-gray-200 active:scale-[0.90] transition-transform duration-150 select-none"
      onClick={googleLogin}>
      <span className="absolute left-4">
        <GoogleLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        Google로 시작하기
      </span>
    </button>
  );
};

export default GoogleLoginButton