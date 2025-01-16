'use client'
import GoogleLogo from "../../../public/assets/logo_google.svg";
import { useEffect, useState } from "react";
import { api } from "@/app/api.client";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { loginSuccessAction } from "@/app/login/login.success.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";
import { googleLoginAction } from "@/app/login/action/google.login.action";

const GoogleLoginButton = () => {
  useEffect(() => {
    window.onGoogleLoginSuccess = async (data: { code: string }) => {
      const route = await googleLoginAction({code: data.code})
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
        Google로 시작하기
      </span>
    </button>
  );
};

export default GoogleLoginButton