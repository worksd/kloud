"use client";
import { useFormState } from "react-dom";
import { signUpAction } from "@/app/signUp/signup.action";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import TopToolbar from "@/app/components/TopToolbar";
import ArrowLeftIcon from "../../../public/assets/left-arrow.svg";
import CheckIcon from "../../../public/assets/check.svg"
import HidePasswordIcon from "../../../public/assets/hide-password.svg";
import ShowPasswordIcon from "../../../public/assets/show-password.svg";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";

export const SignupForm = () => {
  const [actionState, formAction] = useFormState(signUpAction, {
    sequence: -1,
    errorCode: '',
    errorMessage: '',
    userId: -1,
    accessToken: undefined
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [isEmailPatternValid, setIsEmailPatternValid] = useState(false);
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);
  const [isPasswordPatternValid, setIsPasswordPatternValid] = useState(false);

  const router = useRouter();

  useEffect(() => {
    console.log("actionState 변경 감지:", actionState);
    setEmailErrorMessage('');

    if (actionState.accessToken && !actionState.errorCode) {
      if (window.KloudEvent) {
        document.cookie = `${accessTokenKey}=${actionState.accessToken};path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `${userIdKey}=${actionState.userId};path=/; max-age=2592000; SameSite=Lax`;
        window.KloudEvent.clearAndPush(KloudScreen.Onboard);
      } else {
        router.push(KloudScreen.Onboard);
      }
    } else {
      if (actionState.errorCode == ExceptionResponseCode.EMAIL_ALREADY_EXISTS) {
        setEmailErrorMessage(actionState.errorMessage ?? '');
      }
    }
  }, [actionState]);

  const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailErrorMessage('');
    const email = e.target.value;
    setEmail(email);

    // 이메일 패턴: 계정@도메인.최상위도메인
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsEmailPatternValid(emailPattern.test(email));
  }

  const onPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(password);

    // 비밀번호 패턴: 영문/숫자/특수문자 조합, 8자 이상
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/;
    setIsPasswordPatternValid(passwordPattern.test(password));
    setIsPasswordLengthValid(password.length >= 8);
  }

  const onClickBack = () => {
    if (window.KloudEvent) {
      window.KloudEvent.back()
    } else {
      router.back()
    }
  }

  return (
    <div>
      <div className="relative flex items-center justify-center h-[56px]">
        <div className="absolute top-4 left-4">
          <button className="flex items-center justify-center text-black rounded-full" onClick={onClickBack}>
            <ArrowLeftIcon className="w-6 h-6"/>
          </button>
        </div>
        <h1 className="text-[16px] font-bold text-black">가입하기</h1>
      </div>

      <form className="flex flex-col p-6 h-screen justify-between" action={formAction}>

        <div className="flex flex-col">
          <div className="flex items-center gap-1 mb-2">
            <label className="text-[14px] font-medium text-black">이메일</label>
            <span className="text-[10px] font-normal text-[#E55B5B]">필수</span>
          </div>
          <input
            className="text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
            id="email"
            name="email"
            onChange={onEmailChanged}
            value={email}
            placeholder='이메일을 입력해주세요'
          />
          <div className="flex items-center gap-2 mt-2">
            <CheckIcon className={`${isEmailPatternValid ? "stroke-black" : "stroke-gray-300"}`}/>
            <span className={`text-[12px] ${isEmailPatternValid ? "text-black" : "text-gray-300"}`}>
              이메일 주소 형식
            </span>
          </div>
          <div className="text-[#E55B5B] mt-2 text-[12px]">
            {emailErrorMessage}
          </div>
          <div className="flex items-center gap-1 mb-2 mt-5">
            <label className="text-[14px] font-medium text-black" htmlFor="password">비밀번호</label>
            <span className="text-[10px] font-normal text-[#E55B5B]">필수</span>
          </div>
          <div className="relative mb-2">
            <input
              className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={onPasswordChanged}
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

          <div className="flex items-center gap-2 mt-2">
            <CheckIcon className={`${isPasswordLengthValid ? "stroke-black" : "stroke-gray-300"}`}/>
            <span className={`text-[12px] ${isPasswordLengthValid ? "text-black" : "text-gray-300"}`}>
              8자리 이상
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <CheckIcon className={`${isPasswordPatternValid ? "stroke-black" : "stroke-gray-300"}`}/>
            <span className={`text-[12px] ${isPasswordPatternValid ? "text-black" : "text-gray-300"}`}>
              영문 / 숫자 / 특수문자 혼용
            </span>
          </div>
        </div>

        <div>
          <button
            disabled={!isEmailPatternValid || !isPasswordPatternValid || !isPasswordLengthValid}
            className={`flex items-center justify-center text-lg font-bold rounded-lg h-14 w-full mb-[40px] font-[16px] ${
              isEmailPatternValid && isPasswordPatternValid && isPasswordLengthValid ? "bg-black text-white" : "bg-[#BCBFC2] text-white"}`}>
            다음으로
          </button>

        </div>
      </form>
    </div>
  );
}

export interface SignUpActionResult {
  sequence: number,
  userId?: number,
  errorCode?: string,
  errorMessage?: string,
  accessToken?: string,
}