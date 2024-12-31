"use client";
import { useFormState } from "react-dom";
import { signUpAction } from "@/app/signUp/signup.action";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import TopToolbar from "@/app/components/TopToolbar";

export const SignupForm = () => {
  const [actionState, formAction] = useFormState(signUpAction, {
    sequence: -1,
    errorCode: '',
    errorMessage: '',
    accessToken: undefined
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const router = useRouter();

  useEffect(() => {
    console.log("actionState 변경 감지:", actionState);
    setPasswordErrorMessage('');
    setEmailErrorMessage('');

    if (actionState.accessToken && !actionState.errorCode) {
      if (window.KloudEvent) {
        window.KloudEvent.clearAndPush(KloudScreen.Onboard);
      } else {
        router.push(KloudScreen.Onboard);
      }
    } else {
      if (actionState.errorCode == ExceptionResponseCode.EMAIL_ALREADY_EXISTS) {
        setEmailErrorMessage(actionState.errorMessage ?? '');
      } else if (actionState.errorCode == ExceptionResponseCode.INVALID_USER_PASSWORD_PATTERN) {
        setPasswordErrorMessage(actionState.errorMessage ?? '');
      }
    }
  }, [actionState]);

  const onClickBack = () => {
    if (window.KloudEvent) {
      window.KloudEvent.back()
    } else {
      router.back()
    }
  }

  return (
    <div>
      <TopToolbar title="가입하기" onClick={onClickBack}/>

      <form className="flex flex-col p-6 h-screen justify-between" action={formAction}>

        <div className="flex flex-col">
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
          <div className="text-black">
            {passwordErrorMessage}
          </div>

        </div>

        <div>
          <button
            disabled={!isFormValid}
            className={`flex items-center justify-center text-lg font-semibold rounded-lg h-14 shadow-lg w-full mb-[40px] ${
              isFormValid ? "bg-black text-white" : "bg-[#BCBFC2] text-white"}`}>
            Continue
          </button>

        </div>
      </form>
    </div>
  );
}

export interface SignUpActionResult {
  sequence: number,
  errorCode?: string,
  errorMessage?: string,
  accessToken?: string,
}