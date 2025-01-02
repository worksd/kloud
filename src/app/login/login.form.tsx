'use client';
import React, { FormEventHandler, useEffect, useState } from "react";
import { createPortal, useFormState } from "react-dom";
import { UserStatus } from "@/entities/user/user.status";
import { useRouter } from "next/navigation";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import loginAction from "@/app/login/login.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import ShowPasswordIcon from "../../../public/assets/show-password.svg"
import HidePasswordIcon from "../../../public/assets/hide-password.svg"

export const LoginForm = () => {
  const [actionState, formAction] = useFormState(loginAction, {
    sequence: 0,
    errorCode: '',
    errorMessage: '',
    userId: -1,
    userStatus: undefined,
    accessToken: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sequence, setClientSequence] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (actionState.sequence > 0) {
      console.log("actionState 변경 감지:", actionState);
      setPasswordErrorMessage('');
      setEmailErrorMessage('');

      if (actionState.userStatus && actionState.accessToken) {
        // 로그인 성공 시 쿠키 설정
        document.cookie = `${accessTokenKey}=${actionState.accessToken};path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `${userIdKey}=${actionState.userId};path=/; max-age=2592000; SameSite=Lax`;

        // 이후 라우팅 처리
        if (actionState.userStatus === UserStatus.New) {
          if (window.KloudEvent) {
            window.KloudEvent.clearAndPush(KloudScreen.Onboard);
          } else {
            router.push(KloudScreen.Onboard);
          }
        } else if (actionState.userStatus === UserStatus.Ready) {
          if (window.KloudEvent) {
            window.KloudEvent.clearAndPush(KloudScreen.Main);
          } else {
            router.push(KloudScreen.Home);
          }
        }
      } else if (actionState.errorMessage) {
        if (actionState.errorCode === ExceptionResponseCode.USER_PASSWORD_NOT_MATCH) {
          setPasswordErrorMessage(actionState.errorMessage);
        } else if (actionState.errorCode === ExceptionResponseCode.USER_EMAIL_NOT_FOUND) {
          setEmailErrorMessage(actionState.errorMessage);
        }
      }
    }
  }, [actionState]);

  const handleClickSignUp = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.SignUp)
    } else {
      router.push(KloudScreen.SignUp);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    setIsSubmitting(true);
  };

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
      action={async (formData) => {
        await formAction(formData);
        setIsSubmitting(false);
      }}
      onSubmit={handleSubmit}
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
      <div className="text-[#E55B5B] mb-5 text-[12px]">
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

      <button
        disabled={!isFormValid}
        className={`flex items-center justify-center text-lg font-semibold rounded-lg h-14 shadow-lg w-full mb-[40px] ${
          isFormValid ? "bg-black text-white" : "bg-[#BCBFC2] text-white"}`}>
        Continue
      </button>

      <div className="flex items-center justify-center" onClick={handleClickSignUp}>
        <span className="text-[#86898C] text-[14px]">아직 회원이 아니신가요?</span>
        <span className="text-black ml-1 font-medium cursor-pointer text-[14px]">회원가입하기</span>
      </div>

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