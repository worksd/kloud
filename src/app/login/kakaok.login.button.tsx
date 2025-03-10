'use client';
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { useEffect } from "react";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { TranslatableText } from "@/utils/TranslatableText";

const KakaoLoginButton = () => {
  useEffect(() => {
    window.onKakaoLoginSuccess = async (data: { code: string }) => {
      const res = await kakaoLoginAction({code: data.code})
      await LoginAuthNavigation({
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
            active:scale-[0.95] transition-transform duration-150 select-none'}
      `}
      onClick={kakaoLogin}
    >
      <span className="absolute left-4">
        <KakaoLogo/>
      </span>
      <TranslatableText className={'flex-1 text-center text-[16px]'} titleResource={'kakao_login'}/>
    </button>
  );
};

export default KakaoLoginButton;