'use client'
import GoogleLogo from "../../../public/assets/logo_google.svg";
import { useEffect, useState } from "react";

const GoogleLoginButton = () => {
  const [code, setCode] = useState<string>("NO Code");
  useEffect(() => {
    window.onGoogleLoginSuccess = (data: { code: string }) => {
      setCode(data.code)
    };
  }, []);

  const googleLogin = () => {
    window.KloudEvent?.sendGoogleLogin()
  }

  return (
    <button
      className="relative flex items-center justify-center bg-white text-black text-lg font-semibold rounded-lg h-14 shadow-lg w-full border border-gray-200"
      onClick={googleLogin}>
      <span className="absolute left-4">
        <GoogleLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        Google로 시작하기 {code}
      </span>
    </button>
  );
};

export default GoogleLoginButton