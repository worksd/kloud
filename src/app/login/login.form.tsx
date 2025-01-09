'use client';
import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { UserStatus } from "@/entities/user/user.status";
import { useRouter } from "next/navigation";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import loginAction from "@/app/login/login.action";
import { KloudScreen } from "@/shared/kloud.screen";
import ShowPasswordIcon from "../../../public/assets/show-password.svg"
import HidePasswordIcon from "../../../public/assets/hide-password.svg"
import { loginSuccessAction } from "@/app/login/login.success.action";
import { push } from "@/utils/kloud.navigate";

export const LoginForm = () => {
  const [actionState, formAction] = useFormState(loginAction, {
    sequence: 0,
    errorCode: '',
    errorMessage: '',
    userId: -1,
    userStatus: undefined,
    accessToken: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  useEffect(() => {
    if (actionState.sequence > 0) {
      setPasswordErrorMessage('');
      setEmailErrorMessage('');

      if (actionState.userStatus && actionState.accessToken && actionState.userId) {
        loginSuccessAction({
          status: actionState.userStatus,
          userId: actionState.userId,
          accessToken: actionState.accessToken,
        })
      } else if (actionState.errorMessage) {
        if (actionState.errorCode === ExceptionResponseCode.USER_PASSWORD_NOT_MATCH) {
          setPasswordErrorMessage(actionState.errorMessage);
        } else if (actionState.errorCode === ExceptionResponseCode.USER_EMAIL_NOT_FOUND) {
          setEmailErrorMessage(actionState.errorMessage);
        }
      }
    }
  }, [actionState]);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordErrorMessage('');
    setEmailErrorMessage('');
  }

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
  }

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <form
      className="flex flex-col p-6"
      action={formAction}
    >
      <label className="mb-2 text-[14px] font-[Pretendard] font-normal text-black">이메일</label>
      <input
        className="text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
        type="email"
        id="email"
        name="email"
        onChange={onEmailChange}
        value={email}
        placeholder='이메일을 입력해주세요'
      />
      <div className="text-[#E55B5B] mb-2 text-[12px]">
        {emailErrorMessage}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-[14px] font-normal text-black">비밀번호</label>
      </div>
      <div className="relative mb-2">
        <input
          className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-[8px] p-4"
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          onChange={onPasswordChange}
          placeholder='비밀번호를 입력해주세요'
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
        >
          {showPassword ? <HidePasswordIcon/> : <ShowPasswordIcon/>}
        </button>
      </div>

      <div className="text-[#E55B5B] text-[12px] mb-3">
        {passwordErrorMessage}
      </div>


      <div className="flex items-center justify-end mb-4" onClick={() => push({route: KloudScreen.SignUp})}>
        <span className="text-[#86898C] text-[12px]">아직 회원이 아니신가요?</span>
        <span className="text-black ml-1 font-semibold cursor-pointer text-[12px]">회원가입하기</span>
      </div>

      <button
        disabled={!isFormValid}
        className={`sticky bottom-0 flex items-center justify-center text-lg font-semibold rounded-lg h-14 shadow-lg w-full ${
          isFormValid ? "bg-black text-white" : "bg-[#BCBFC2] text-white"}`}>
        시작하기
      </button>


    </form>
  );
};

export interface LoginActionResult {
  sequence: number,
  errorCode?: string,
  errorMessage?: string,
  userId?: number,
  userStatus?: UserStatus,
  accessToken?: string,
}