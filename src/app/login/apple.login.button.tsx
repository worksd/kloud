'use client';
import AppleLogo from "../../../public/assets/logo_apple.svg"
import { useEffect } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils";
import { appleLoginAction } from "@/app/login/action/apple.login.action";
import { loginAuthNavigation } from "@/app/login/login.auth.navigation";

const AppleLoginButton = () => {

  useEffect(() => {
    window.onAppleLoginSuccess = async (data: { code: string }) => {
      const res = await appleLoginAction({code: data.code})
      loginAuthNavigation({
        status: res.status,
        window: window,
      })
    };
  }, []);

  const appleLogin = () => {
    window.KloudEvent?.sendAppleLogin()
  }
  return (
    <button
      className="relative flex items-center justify-center bg-black text-white text-lg font-semibold rounded-lg h-14 shadow-lg w-full"
      onClick={appleLogin}>
      <span className="absolute left-4">
        <AppleLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        Apple로 시작하기
      </span>
    </button>
  );
};

export default AppleLoginButton