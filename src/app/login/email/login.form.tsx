'use client';
import React, { useEffect, useState } from "react";
import emailLoginAction from "@/app/login/action/email.login.action";
import { KloudScreen } from "@/shared/kloud.screen";
import ShowPasswordIcon from "../../../../public/assets/show-password.svg"
import HidePasswordIcon from "../../../../public/assets/hide-password.svg"
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";
import Logo from "../../../../public/assets/logo_black.svg";
import { useRouter } from "next/navigation";
import { saveRecentLoginMethod } from "@/app/login/recentLoginMethod";
import { safeLocalStorage } from "@/utils/safe.storage";
import { LOGIN_WEB_CARD_CLS } from "@/app/login/loginWebDecor";

type LoginFormProps = {
  appVersion: string;
  /** 웹 직접 접근 여부 — PC(lg) 유리 카드 레이아웃 적용 기준 (page.tsx에서 판정) */
  isWeb?: boolean;
  returnUrl?: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  buttonText: string;
  noMemberSignUpText: string;
  createAccountText: string;
  signUpTitle: string;
}

const CACHED_EMAIL_KEY = 'kloud_cached_email';

export const LoginForm = (props: LoginFormProps) => {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 웹(appVersion === '')에서 로그인 실패 시 인라인 에러(네이티브 showDialog 대체)
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  // 캐시된 이메일 불러오기
  useEffect(() => {
    const cachedEmail = safeLocalStorage.getItem(CACHED_EMAIL_KEY);
    if (cachedEmail) {
      setEmail(cachedEmail);
    }
  }, []);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (loginError) setLoginError(null);
  }

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (loginError) setLoginError(null);
  }

  const onClickSignUp = async () => {
    const signUpQuery = props.returnUrl ? `?returnUrl=${encodeURIComponent(props.returnUrl)}` : ''
    const route = KloudScreen.SignUp(signUpQuery)
    if (props.appVersion === '') {
      router.replace(route)
    } else {
      kloudNav.push(route)
    }
  }

  const onClickLogin = async () => {
    const res = await emailLoginAction({
      email: email,
      password: password,
    })
    if ('status' in res) {
      // 로그인 성공 시 이메일 캐시 저장
      safeLocalStorage.setItem(CACHED_EMAIL_KEY, email);
      saveRecentLoginMethod('email');

      if (props.appVersion == '') {
        // 웹: 풀 리로드로 방금 세팅된 세션 쿠키가 서버 컴포넌트에 확실히 반영되게
        window.location.replace(props.returnUrl || '/');
      } else {
        await LoginAuthNavigation({
          status: res.status,
          window: window,
        })
      }
    } else if (res.errorCode) {
      if (props.appVersion === '') {
        // 웹: 네이티브 다이얼로그 대신 인라인 에러
        setLoginError(res.errorMessage || '로그인에 실패했어요');
      } else {
        const dialogInfo = await createDialog({id: 'LoginFail', message: res.errorMessage})
        window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      }
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {

    }
  }, []);

  const isFormValid = email.trim() !== "" && password.trim() !== "";
  const isWeb = props.isWeb ?? false;

  return (
    // 웹 PC(lg): fixed 풀스크린 흰 배경 대신 문서 흐름으로 — 페이지의 그래디언트/상단바가 보이게
    <div className={`fixed inset-0 bg-white overscroll-none ${isWeb ? 'lg:static lg:bg-transparent' : ''}`}>
      {/* 가운데 블록 */}
      <div className={`h-full w-full flex items-center justify-center ${isWeb ? 'lg:h-auto lg:min-h-screen' : ''}`}>
        <div className={`w-full max-w-sm px-6 ${isWeb ? `${LOGIN_WEB_CARD_CLS} lg:px-10 lg:py-14` : ''}`}>
          <div className="flex flex-col items-center text-center gap-6 ">
            {/* 로고 */}
            <Logo className="mx-auto h-10"/>

            {/* 입력 카드 */}
            <div className="w-full mt-4 space-y-3">
              {/* 이메일 */}
              <div
                className="group rounded-xl ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-black transition">
                <input
                  className="w-full bg-transparent p-4 text-[15px] font-medium text-black placeholder:text-gray-400 outline-none"
                  type="email"
                  id="email"
                  name="email"
                  onChange={onEmailChange}
                  value={email}
                  placeholder={props.emailPlaceholder}
                  autoComplete="email"
                />
              </div>

              {/* 비밀번호 */}
              <div
                className="group relative rounded-xl ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-black transition">
                <input
                  className="w-full bg-transparent p-4 pr-12 text-[15px] font-medium text-black placeholder:text-gray-400 outline-none"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={onPasswordChange}
                  placeholder={props.passwordPlaceholder}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-1 my-1 flex items-center justify-center w-9 rounded-md hover:bg-gray-100 active:scale-[0.98] transition"
                >
                  {showPassword ? <HidePasswordIcon/> : <ShowPasswordIcon/>}
                </button>
              </div>
            </div>

            {/* 인라인 에러 (웹) */}
            {loginError && (
              <p className="w-full -mt-2 text-left text-[13px] font-medium text-[#E5484D]">{loginError}</p>
            )}

            {/* 시작하기 버튼 (가운데) */}
            <button
              onClick={onClickLogin}
              disabled={!isFormValid}
              className={`w-full h-14 rounded-lg text-lg font-semibold shadow-lg transition
              ${isFormValid ? 'bg-black text-white active:scale-[0.99]' : 'bg-[#BCBFC2] text-white cursor-not-allowed'}`}
            >
              {props.buttonText}
            </button>

            {/* “아직 회원이 아니신가요?” — 모바일: 화면 맨 아래 고정 / 웹 PC(lg): 카드 안 버튼 아래 */}
            <div className={`fixed inset-x-0 bottom-8 z-50 ${isWeb ? 'lg:static lg:z-auto' : ''}`}>
        <div
          className="
      mx-auto flex items-center justify-center gap-1
      px-4 text-[12px] text-center
      whitespace-nowrap
      max-w-[90%]
    "
          onClick={onClickSignUp}
        >
    <span className="text-[#86898C] flex-shrink-0">
      {props.noMemberSignUpText}
    </span>
          <button
            type="button"
            className="text-black font-semibold underline-offset-2 hover:underline flex-shrink-0"
          >
            {props.createAccountText}
          </button>
        </div>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};