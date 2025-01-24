'use client';
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { useEffect, useState } from "react";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";
import { loginAuthNavigation } from "@/app/login/login.auth.navigation";

const KakaoLoginButton = () => {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    window.onKakaoLoginSuccess = async (data: { code: string }) => {
      const res = await kakaoLoginAction({code: data.code})
      loginAuthNavigation({
        status: res.status,
        window: window,
        message: res.errorMessage,
      })
    }
  }, []);

  const kakaoLogin = () => {
    window.KloudEvent?.sendKakaoLogin()
  };

  return (
    <button
      className={`relative flex items-center justify-center bg-[#FEE500] text-black text-lg font-semibold rounded-lg h-14 shadow-lg w-full 
        transition-transform duration-75 transform
        ${isPressed ? 'scale-[0.95]' : 'scale-100'}
      `}
      onClick={kakaoLogin}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
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