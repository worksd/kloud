'use client';
import React, { useEffect, useState } from "react";
import emailLoginAction from "@/app/login/action/email.login.action";
import { KloudScreen } from "@/shared/kloud.screen";
import ShowPasswordIcon from "../../../../public/assets/show-password.svg"
import HidePasswordIcon from "../../../../public/assets/hide-password.svg"
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { clearCookies } from "@/app/profile/clear.token.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";
import Logo from "../../../../public/assets/logo_black.svg";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  appVersion: string;
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

export const LoginForm = (props: LoginFormProps) => {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }

  const onClickSignUp = async () => {
    const signUpQuery = props.returnUrl ? `?returnUrl=${props.returnUrl}` : ''
    await kloudNav.push(KloudScreen.SignUp(signUpQuery))
  }

  const onClickLogin = async () => {
    const res = await emailLoginAction({
      email: email,
      password: password,
    })
    if ('status' in res) {
      if (props.appVersion == '') {
        if (props.returnUrl) {
          router.replace(props.returnUrl);
        } else {
          router.replace('/');
        }
      } else {
        await LoginAuthNavigation({
          status: res.status,
          window: window,
        })
      }
    } else if (res.errorCode) {
      const dialogInfo = await createDialog({id: 'LoginFail', message: res.errorMessage})
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {

    }
  }, []);

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <div className="fixed inset-0 bg-white overscroll-none">
      {/* 가운데 블록 */}
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
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

            {/* 시작하기 버튼 (가운데) */}
            <button
              onClick={onClickLogin}
              disabled={!isFormValid}
              className={`w-full h-14 rounded-lg text-lg font-semibold shadow-lg transition
              ${isFormValid ? 'bg-black text-white active:scale-[0.99]' : 'bg-[#BCBFC2] text-white cursor-not-allowed'}`}
            >
              {props.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* “아직 회원이 아니신가요?” 항상 화면 맨 아래 중앙 고정 */}
      <div className="fixed inset-x-0 bottom-8 z-50">
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
  );
};