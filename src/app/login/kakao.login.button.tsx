'use client';
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { useEffect, useRef, useState } from "react";
import { kakaoLoginAction } from "@/app/login/action/kakao.login.action";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { TranslatableText } from "@/utils/TranslatableText";
import { useRouter, useSearchParams } from "next/navigation";
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { createDialog } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";

const KakaoLoginButton = ({appVersion, callbackUrl} : {appVersion: string, callbackUrl?: string}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prevCodeRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      try {
        if (isSubmitting) {
          return;
        }
        setIsSubmitting(true);
        const code = searchParams?.get('code');
        const state = searchParams?.get('state');

        if (code && state) {
          if (code === prevCodeRef.current) {
            return;
          }
          prevCodeRef.current = code;

          try {
            const res = await kakaoLoginAction({code});
            if (res.success) {
              const decodedState = decodeURIComponent(state);
              if (res.status === UserStatus.Ready) {
                router.replace(decodedState);
              } else if (res.status === UserStatus.New) {
                router.replace(KloudScreen.Onboard(decodedState));
              }
            }
            else {
              if (res.errorCode == ExceptionResponseCode.USER_EMAIL_EMPTY) {
                const dialog = await createDialog({id: 'Simple', message: await translate('user_email_empty_message')})
                window.KloudEvent.showDialog(JSON.stringify(dialog))
              }
              else {
                const dialog = await createDialog({id: 'Simple', message: res.errorMessage})
                window.KloudEvent.showDialog(JSON.stringify(dialog))
              }
            }
          } catch (error) {
            console.error("Kakao Login Error:", error);
          }
        }
      } finally {
        setIsSubmitting(false)
      }
    };

    handleKakaoLogin();
  }, [searchParams, router, prevCodeRef.current]);

  const kakaoLogin = () => {
    try {
      if (isSubmitting) return;
      setIsSubmitting(true);
      if (appVersion == '') {
        const state = callbackUrl ? encodeURIComponent(callbackUrl) : encodeURIComponent('/');
        const URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_API_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URL}&response_type=code&state=${state}`;
        window.location.href = URL;
      } else {
        window.KloudEvent?.sendKakaoLogin()
      }
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <button
      className={`relative flex items-center justify-center bg-[#FEE500] text-black text-lg font-semibold rounded-lg h-14 shadow-lg w-full 
            active:scale-[0.95] transition-transform duration-150 select-none'}
      `}
      onClick={kakaoLogin}
      disabled={isSubmitting}
    >
      <span className="absolute left-4">
        <KakaoLogo/>
      </span>
      <TranslatableText className={'flex-1 text-center text-[16px]'} titleResource={'kakao_login'}/>
    </button>
  );
};

export default KakaoLoginButton;