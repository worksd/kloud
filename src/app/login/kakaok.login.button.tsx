'use client';
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { useEffect } from "react";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";
import { loginAuthNavigation } from "@/app/login/login.auth.navigation";

const KakaoLoginButton = () => {
  useEffect(() => {
    window.onKakaoLoginSuccess = async (data: { code: string }) => {
      const res = await kakaoLoginAction({code: data.code})
      loginAuthNavigation({
        status: res.status,
        window: window,
      })
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
