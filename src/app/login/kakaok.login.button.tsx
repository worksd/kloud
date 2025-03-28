'use client';
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { useEffect } from "react";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { TranslatableText } from "@/utils/TranslatableText";
import { useRouter, useSearchParams } from "next/navigation";
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";

const KakaoLoginButton = ({appVersion, callbackUrl} : {appVersion: string, callbackUrl: string}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.onKakaoLoginSuccess = async (data: { code: string }) => {
      const res = await kakaoLoginAction({token: data.code})
      await LoginAuthNavigation({
        status: res.status,
        window: window,
        message: res.errorMessage,
      })
    }
  }, []);
  useEffect(() => {
    const handleKakaoLogin = async () => {
      const code = searchParams?.get('code');
      const state = searchParams?.get('state');

      if (code && state) {
        try {
          const res = await kakaoLoginAction({code});
          if (res.success) {
            const decodedState = decodeURIComponent(state);
            if (res.status == UserStatus.Ready) {
              router.replace(decodedState);
            } else if (res.status == UserStatus.New) {
              router.replace(KloudScreen.Onboard(decodedState))
            }
          }

        } catch (error) {
          console.error('Login error:', error);
        }
      }
    };

    handleKakaoLogin();
  }, [searchParams, router]);

  const kakaoLogin = () => {
    if (appVersion == '') {
      const state = callbackUrl ? encodeURIComponent(callbackUrl) : '';
      const URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_API_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URL}&response_type=code&state=${state}`;
      window.location.href = URL;
    } else {
      window.KloudEvent?.sendKakaoLogin()
    }
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