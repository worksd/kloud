'use client'
import GoogleLogo from "../../../public/assets/logo_google.svg";
import { useEffect } from "react";
import { googleLoginAction } from "@/app/login/action/google.login.action";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { TranslatableText } from "@/utils/TranslatableText";

const GoogleLoginButton = () => {

  useEffect(() => {
    window.onGoogleLoginSuccess = async (data: { code: string }) => {
      const res = await googleLoginAction({code: data.code})
      await LoginAuthNavigation({
        status: res.status,
        window: window,
        message: res.errorMessage,
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
      className={`relative flex items-center justify-center bg-white text-black text-lg font-semibold rounded-lg h-14 shadow-lg w-full 
            active:scale-[0.95] transition-transform duration-150 border border-gray-200`}
      onClick={googleLogin}
    >
      <span className="absolute left-4">
        <GoogleLogo/>
      </span>
      <TranslatableText titleResource={'google_login'} className={"flex-1 text-center text-[16px]"}/>
    </button>
  );
};

export default GoogleLoginButton;