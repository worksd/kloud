'use client';
import React, { FormEventHandler, useEffect, useState } from "react";
import { createPortal, useFormState } from "react-dom";
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { loginAction } from "@/app/login/login.action";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";

export const LoginForm = () => {
  const [actionState, formAction] = useFormState(loginAction, {
    sequence: -1,
    errorCode: '',
    errorMessage: '',
    userStatus: undefined,
    accessToken: ''
  });
  const [sequence, setClientSequence] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    console.log("actionState 변경 감지:", actionState);
    setPasswordErrorMessage('');
    setEmailErrorMessage('');

    if (actionState.userStatus) {
      if (actionState.userStatus === UserStatus.New) {
        if (isMobile) {
          window.KloudEvent.clearAndPush(KloudScreen.Onboard);
        } else {
          router.push(KloudScreen.Onboard);
        }
      } else if (actionState.userStatus === UserStatus.Ready) {
        if (isMobile) {
          window.KloudEvent.clearAndPush(KloudScreen.Main);
        } else {
          router.push(KloudScreen.Home);
        }
      }
    } else if (actionState.errorMessage) {
      if (actionState.errorCode === ExceptionResponseCode.USER_PASSWORD_NOT_MATCH) {
        setPasswordErrorMessage(actionState.errorMessage);
      } else if (actionState.errorCode == ExceptionResponseCode.USER_EMAIL_NOT_FOUND) {
        setEmailErrorMessage(actionState.errorMessage);
      }
    }
  }, [actionState]);

  const handleClickSignUp = () => {
    if (isMobile) {
      window.KloudEvent.push(KloudScreen.SignUp)
    } else {
      router.push(KloudScreen.SignUp);
    }
  }

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <form className="flex flex-col p-6" action={formAction}>
      <label className="mb-2 text-[14px] font-[Pretendard] font-medium text-black"
             htmlFor="email">Email</label>
      <input
        className="text-[14px] font-medium leading-[142.857%] text-gray-400 border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
        type="email"
        id="email"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        placeholder='이메일을 입력해주세요'
      />
      <div className="text-[#E55B5B]">
        {emailErrorMessage}
      </div>
      <label className="mb-2 mt-5 text-sm font-medium text-gray-700" htmlFor="password">Password</label>
      <input
        className="text-[14px] font-medium leading-[142.857%] text-gray-400 border border-gray-300 focus:border-black focus:outline-none rounded-md p-4 mb-[20px]"
        type="password" id="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='비밀번호를 입력해주세요'/>

      <div className="text-[#E55B5B]">
        {passwordErrorMessage}
      </div>

      <button
        disabled={!isFormValid}
        className={`flex items-center justify-center text-lg font-semibold rounded-lg h-14 shadow-lg w-full mb-[40px] ${
          isFormValid ? "bg-black text-white" : "bg-[#BCBFC2] text-white"}`}>
        Continue
      </button>
      <div className="text-[14px] font-medium leading-[142.857%] text-gray-500 text-center font-pretendard"
           onClick={handleClickSignUp}>
        Don&#39;t have an account yet? Sign Up
      </div>

    </form>
  );
};

export interface LoginActionResult {
  sequence: number,
  errorCode?: string,
  errorMessage?: string,
  userStatus?: UserStatus,
  accessToken?: string,
}