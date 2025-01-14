'use client';
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { useEffect } from "react";

const KakaoLoginButton = () => {
  useEffect(() => {
    window.onKakaoLoginSuccess = (data: { code: string }) => {

    };
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
