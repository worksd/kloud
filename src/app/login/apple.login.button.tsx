'use client';
import AppleLogo from "../../../public/assets/logo_apple.svg"
import { useEffect, useState } from "react";
import { appleLoginAction } from "@/app/login/action/apple.login.action";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { useLocale } from "@/hooks/useLocale";

const AppleLoginButton = () => {
  const [isPressed, setIsPressed] = useState(false);
  const { t, locale} = useLocale()

  useEffect(() => {
    window.onAppleLoginSuccess = async (data: { code: string, name: string}) => {
      const res = await appleLoginAction({code: data.code, name: data.name})
      LoginAuthNavigation({
        status: res.status,
        window: window,
        message: res.errorMessage,
        locale: locale,
      })
    };
  }, []);

  const appleLogin = () => {
    window.KloudEvent?.sendAppleLogin()
  }

  return (
    <button
      className={`relative flex items-center justify-center bg-black text-white text-lg font-semibold 
        rounded-lg h-14 shadow-lg w-full
        transition-transform duration-75 transform
        ${isPressed ? 'scale-[0.95]' : 'scale-100'}
        `}
      onClick={appleLogin}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <span className="absolute left-4">
        <AppleLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        {t('apple_login')}
      </span>
    </button>
  );
};

export default AppleLoginButton;