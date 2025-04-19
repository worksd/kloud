'use client';
import AppleLogo from "../../../public/assets/logo_apple.svg"
import { useEffect, useState } from "react";
import { appleLoginAction } from "@/app/login/action/apple.login.action";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import { TranslatableText } from "@/utils/TranslatableText";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { createDialog } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";

const AppleLoginButton = () => {
  useEffect(() => {
    window.onAppleLoginSuccess = async (data: { code: string, name: string }) => {
      const res = await appleLoginAction({code: data.code, name: data.name})
      if (res.success) {
        await LoginAuthNavigation({
          status: res.status,
          window: window,
          message: res.errorMessage,
        })
      } else {
        if (res.errorCode == ExceptionResponseCode.APPLE_LOGIN_FAILED) {
          const dialog = await createDialog('Simple', await translate('apple_login_failed'))
          window.KloudEvent.showDialog(JSON.stringify(dialog))
        }
        else if (res.errorCode == ExceptionResponseCode.USER_EMAIL_EMPTY) {
          const dialog = await createDialog('Simple', await translate('user_email_empty_message'))
          window.KloudEvent.showDialog(JSON.stringify(dialog))
        }
        else {
          const dialog = await createDialog('Simple', res.errorMessage)
          window.KloudEvent.showDialog(JSON.stringify(dialog))
        }
      }
    };
  }, []);

  const appleLogin = () => {
    window.KloudEvent?.sendAppleLogin()
  }

  return (
    <button
      className={`relative flex items-center justify-center bg-black text-white text-lg font-semibold 
        rounded-lg h-14 shadow-lg w-full
        active:scale-[0.95] transition-transform duration-150 select-none
        `}
      onClick={appleLogin}
    >
      <span className="absolute left-4">
        <AppleLogo/>
      </span>
      <TranslatableText className="flex-1 text-center text-[16px]" titleResource={'apple_login'}/>
    </button>
  );
};

export default AppleLoginButton;