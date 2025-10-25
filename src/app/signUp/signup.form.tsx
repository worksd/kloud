"use client";

import React, { useEffect, useState } from "react";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import CheckIcon from "../../../public/assets/check.svg"
import HidePasswordIcon from "../../../public/assets/hide-password.svg";
import ShowPasswordIcon from "../../../public/assets/show-password.svg";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { signUpAction } from "@/app/signUp/signup.action";
import { createDialog } from "@/utils/dialog.factory";
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";

type SignUpFormProps = {
  appVersion: string;
  returnUrl: string;
  requireLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  buttonText: string;
  passwordMinLengthText: string;
  passwordEmailFormatText: string;
  passwordRequirementsText: string;
}

export const SignupForm = (props: SignUpFormProps) => {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [isEmailPatternValid, setIsEmailPatternValid] = useState(false);
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);
  const [isPasswordPatternValid, setIsPasswordPatternValid] = useState(false);

  const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailErrorMessage('');
    const email = e.target.value;
    setEmail(email);
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsEmailPatternValid(emailPattern.test(email));
  }

  const onPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(password);
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~․!@#$%^&*()_\-+=\[\]|\\;:'"<>,.\/?])[A-Za-z\d~․!@#$%^&*()_\-+=\[\]|\\;:'"<>,.\/?]+$/;
    setIsPasswordPatternValid(passwordPattern.test(password));
    setIsPasswordLengthValid(password.length >= 8);
  }

  const onClickSignUp = async () => {
    setEmailErrorMessage('');

    const res = await signUpAction({ email, password })
    if (res.success) {
      if (props.appVersion == '') {
        // TODO 스마트하게 바꿔보자..
        if (res.status == UserStatus.Ready) {
          router.replace(props.returnUrl);
        }
        else if (res.status == UserStatus.Deactivate) {
          router.replace(KloudScreen.LoginDeactivate)
        }
        else if (res.status == UserStatus.New) {
          router.replace(KloudScreen.Onboard(props.returnUrl))
        }
      } else {
        await
        await LoginAuthNavigation({
          status: res.status,
          window: window,
        })
      }
    } else {
      if (res.errorCode == ExceptionResponseCode.EMAIL_ALREADY_EXISTS) {
        setEmailErrorMessage(res.errorMessage ?? '')
      } else {
        const dialogInfo = await createDialog({id: 'SignUpFail', message: res.errorMessage})
        window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      }
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <div className={"flex flex-col"}>
      <div className="flex flex-col p-6 justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 mb-2">
            <label className="text-[14px] font-medium text-black">{props.emailLabel}</label>
            <span className="text-[10px] font-normal text-[#E55B5B]">{props.requireLabel}</span>
          </div>
          <input
            className="text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
            id="email"
            name="email"
            onChange={onEmailChanged}
            value={email}
            placeholder={props.emailPlaceholder}
          />
          <div className="flex items-center gap-2 mt-2">
            <CheckIcon className={`${isEmailPatternValid ? "stroke-black" : "stroke-gray-300"}`}/>
            <span className={`text-[12px] ${isEmailPatternValid ? "text-black" : "text-gray-300"}`}>
              {props.passwordEmailFormatText}
            </span>
          </div>
          <div className="text-[#E55B5B] mt-2 text-[12px]">
            {emailErrorMessage}
          </div>
          <div className="flex items-center gap-1 mb-2 mt-5">
            <label className="text-[14px] font-medium text-black" htmlFor="password">{props.passwordLabel}</label>
            <span className="text-[10px] font-normal text-[#E55B5B]">{props.requireLabel}</span>
          </div>
          <div className="relative mb-2">
            <input
              className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={onPasswordChanged}
              placeholder={props.passwordPlaceholder}
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
              {props.passwordMinLengthText}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <CheckIcon className={`${isPasswordPatternValid ? "stroke-black" : "stroke-gray-300"}`}/>
            <span className={`text-[12px] ${isPasswordPatternValid ? "text-black" : "text-gray-300"}`}>
              {props.passwordRequirementsText}
            </span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-6 pb-5 bg-white">
          <button
            onClick={onClickSignUp}
            className={`flex items-center justify-center font-bold rounded-lg h-14 w-full text-[16px] ${
              isEmailPatternValid && isPasswordPatternValid && isPasswordLengthValid
                ? "bg-black text-white"
                : "bg-[#BCBFC2] text-white"
            }`}
            disabled={!isEmailPatternValid || !isPasswordPatternValid || !isPasswordLengthValid}>
            {props.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}