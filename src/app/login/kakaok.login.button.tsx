'use client';
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { useEffect } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";

const KakaoLoginButton = () => {
  useEffect(() => {
    window.onKakaoLoginSuccess = async (data: { code: string }) => {
      const route = await kakaoLoginAction({code: data.code})
      if (route == KloudScreen.Main) {
        const bootInfo = JSON.stringify({
          bottomMenuList: getBottomMenuList(),
          route: KloudScreen.Main,
        });
        window.KloudEvent.navigateMain(bootInfo)
      } else {
        window.KloudEvent.clearAndPush(route)
      }
    }
  }, []);

  const kakaoLogin = () => {
    window.KloudEvent?.sendKakaoLogin()
  };

  return (
    <button
      className="relative flex items-center justify-center bg-[#FEE500] text-black text-lg font-semibold rounded-lg h-14 shadow-lg w-full"
      onClick={kakaoLogin}
    >
      <span className="absolute left-4">
        <KakaoLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        카카오로 시작하기
      </span>
    </button>
  );
};

export default KakaoLoginButton;
