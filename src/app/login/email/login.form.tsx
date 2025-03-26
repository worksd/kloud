'use client';
import React, { useEffect, useState } from "react";
import emailLoginAction from "@/app/login/action/email.login.action";
import { KloudScreen } from "@/shared/kloud.screen";
import ShowPasswordIcon from "../../../../public/assets/show-password.svg"
import HidePasswordIcon from "../../../../public/assets/hide-password.svg"
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { clearCookies } from "@/app/setting/clear.token.action";
import { useLocale } from "@/hooks/useLocale";
import { createDialog } from "@/utils/dialog.factory";
import { getTranslatedText, TranslatableText } from "@/utils/TranslatableText";
import { useRouter } from "next/navigation";

export const LoginForm = ({appVersion}: { appVersion: string }) => {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const { t } = useLocale();
  const router = useRouter();

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
    if (window.KloudEvent) {
      window.KloudEvent?.push(KloudScreen.SignUp)
    } else {
      router.push(KloudScreen.SignUp)
    }
  }

  const onClickLogin = async () => {
    const res = await emailLoginAction({
      email: email,
      password: password,
    })
    if ('status' in res) {
      if (appVersion == '') {
        router.replace(KloudScreen.Login);
      } else {
        await LoginAuthNavigation({
          status: res.status,
          window: window,
        })
      }
    } else if (res.errorCode) {
      if (res.errorCode === ExceptionResponseCode.USER_PASSWORD_NOT_MATCH) {
        setPasswordErrorMessage(res.errorMessage ?? '');
      } else if (res.errorCode === ExceptionResponseCode.USER_EMAIL_NOT_FOUND) {
        setEmailErrorMessage(res.errorMessage ?? '');
      } else {
        const dialogInfo = await createDialog('LoginFail', res.errorMessage)
        window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      }
    }
  }

  useEffect(() => {
    const clear = async () => {
      await clearCookies();
      localStorage.clear();
      sessionStorage.clear();
      window.KloudEvent?.clearToken()
    }
    clear();
  }, []);

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="flex flex-col p-6"
    >
      <label className="mb-2 text-[14px] font-normal text-black"><TranslatableText titleResource={'email'}/></label>
      <input
        className="text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
        type="email"
        id="email"
        name="email"
        onChange={onEmailChange}
        value={email}
        placeholder={getTranslatedText({ titleResource: 'input_email_message', text: t('input_email_message'), mounted: mounted})}
      />
      <div className="text-[#E55B5B] mb-2 text-[12px]">
        {emailErrorMessage}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-[14px] font-normal text-black"><TranslatableText titleResource={'password'}/></label>
      </div>
      <div className="relative mb-2">
        <input
          className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-[8px] p-4"
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={password}
          onChange={onPasswordChange}
          placeholder={getTranslatedText({ titleResource: 'input_password_message', text: t('input_password_message'), mounted: mounted})}
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
        <span className="text-[#86898C] text-[12px]"><TranslatableText titleResource={"not_member_sign_up"}/></span>
        <span className="text-black ml-1 font-semibold cursor-pointer text-[12px]"><TranslatableText titleResource={'create_account'}/></span>
      </div>

      <button
        onClick={onClickLogin}
        disabled={!isFormValid}
        className={`sticky bottom-0 flex items-center justify-center text-lg font-semibold rounded-lg h-14 shadow-lg w-full ${
          isFormValid ? "bg-black text-white" : "bg-[#BCBFC2] text-white"}`}>
        {/*{mounted ? t('do_start') : ''}*/}
        {/*{getTranslatedText({ titleResource: 'do_start', text: t('do_start'), mounted: mounted})}*/}
        <TranslatableText titleResource={'do_start'}/>
      </button>
    </div>
  );
};