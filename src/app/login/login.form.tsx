'use client';
import React, { useState } from "react";
import emailLoginAction from "@/app/login/email.login.action";
import { KloudScreen } from "@/shared/kloud.screen";
import ShowPasswordIcon from "../../../public/assets/show-password.svg"
import HidePasswordIcon from "../../../public/assets/hide-password.svg"
import { UserStatus } from "@/entities/user/user.status";
import { loginAuthNavigation } from "@/app/login/login.auth.navigation";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";

export const LoginForm = () => {


  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

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

  const onClickSignUp = () => {
    window.KloudEvent?.push(KloudScreen.SignUp)
  }

  const onClickLogin = async () => {
    const res = await emailLoginAction({
      email: email,
      password: password,
    })
    if ('status' in res) {
      loginAuthNavigation({
        status: res.status,
        window: window,
      })
    } else if (res.errorCode) {
      if (res.errorCode === ExceptionResponseCode.USER_PASSWORD_NOT_MATCH) {
        setPasswordErrorMessage(res.errorMessage ?? '');
      } else if (res.errorCode === ExceptionResponseCode.USER_EMAIL_NOT_FOUND) {
        setEmailErrorMessage(res.errorMessage ?? '');
      } else {
        const dialogInfo = {
          id: 'Empty',
          type: 'SIMPLE',
          title: '로그인 실패',
          message: res.errorMessage,
        }
        window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      }
    }
  }

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <div
      className="flex flex-col p-6"
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


      <div className="flex items-center justify-end mb-4" onClick={onClickSignUp}>
        <span className="text-[#86898C] text-[12px]">아직 회원이 아니신가요?</span>
        <span className="text-black ml-1 font-semibold cursor-pointer text-[12px]">회원가입하기</span>
      </div>

      <button
        onClick={onClickLogin}
        disabled={!isFormValid}
        className={`sticky bottom-0 flex items-center justify-center text-lg font-semibold rounded-lg h-14 shadow-lg w-full ${
          isFormValid ? "bg-black text-white" : "bg-[#BCBFC2] text-white"}`}>
        시작하기
      </button>
    </div>
  );
};