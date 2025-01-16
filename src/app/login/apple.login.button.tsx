'use client';
import AppleLogo from "../../../public/assets/logo_apple.svg"
import { useEffect } from "react";
import { api } from "@/app/api.client";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { loginSuccessAction } from "@/app/login/login.success.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";
import { appleLoginAction } from "@/app/login/action/apple.login.action";

const AppleLoginButton = () => {

  useEffect(() => {
    window.onAppleLoginSuccess = async (data: { code: string }) => {
      const route = await appleLoginAction({code: data.code})
      if (route == KloudScreen.Main) {
        const bootInfo = JSON.stringify({
          bottomMenuList: getBottomMenuList(),
          route: KloudScreen.Main,
        });
        window.KloudEvent.navigateMain(bootInfo)
      } else {
        window.KloudEvent.clearAndPush(route)
      }
    };
  }, []);

  const appleLogin = () => {
    window.KloudEvent?.sendAppleLogin()
  }
  return (
    <button className="relative flex items-center justify-center bg-black text-white text-lg font-semibold rounded-lg h-14 shadow-lg w-full"
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