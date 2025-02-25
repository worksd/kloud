'use client'
import GoogleLogo from "../../../public/assets/logo_google.svg";
import { useEffect, useState } from "react";
import { googleLoginAction } from "@/app/login/action/google.login.action";
import { loginAuthNavigation } from "@/app/login/login.auth.navigation";

const GoogleLoginButton = () => {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    window.onGoogleLoginSuccess = async (data: { code: string }) => {
      const res = await googleLoginAction({code: data.code})
      loginAuthNavigation({
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
        transition-transform duration-75 transform border border-gray-200 
        ${isPressed ? 'scale-[0.95]' : 'scale-100'}
        `}
      onClick={googleLogin}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <span className="absolute left-4">
        <GoogleLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        Google로 시작하기
      </span>
    </button>
  );
};

export default GoogleLoginButton;