'use client';
import React, { FormEventHandler, useState } from "react";
import { createPortal, useFormState } from "react-dom";
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { loginAction } from "@/app/login/login.action";
import PopupDialog, { PopupType } from "@/app/components/PopupDialog";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";

export const LoginForm = () => {
  const [actionState, formAction] = useFormState(loginAction, {
    sequence: 0,
    errorMessage: '',
    userStatus: undefined,
    accessToken: ''
  });
  const [clientSequence, setClientSequence] = useState(0);

  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    if (actionState.userStatus) {
      if (actionState.userStatus == UserStatus.New) {
        if (isMobile) {
          window.KloudEvent.clearAndPush(KloudScreen.Onboard);
        } else {
          router.push(KloudScreen.Onboard);
        }
      } else if (actionState.userStatus == UserStatus.Ready) {
        if (isMobile) {
          window.KloudEvent.clearAndPush(KloudScreen.Main)
        } else {
          router.push(KloudScreen.Home);
        }
      }
    }
    setClientSequence((prev) => prev + 1);
  };

  const handleClickSignUp = () => {
    if (isMobile) {
      window.KloudEvent.push(KloudScreen.SignUp)
    } else {
      router.push(KloudScreen.SignUp);
    }
  }

  return (
    <form className="flex flex-col p-6" action={formAction} onSubmit={handleSubmit}>
      <label className="mb-2 text-[14px] font-[Pretendard] font-medium text-black"
             htmlFor="email">Email</label>
      <input
        className="text-[14px] font-medium leading-[142.857%] text-gray-400 border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
        type="email"
        id="email"
        name="email"
        placeholder='이메일을 입력해주세요'
      />
      <label className="mb-2 mt-5 text-sm font-medium text-gray-700" htmlFor="password">Password</label>
      <input className="text-[14px] font-medium leading-[142.857%] text-gray-400 border border-gray-300 focus:border-black focus:outline-none rounded-md p-4 mb-[20px]" type="password" id="password"
             name="password"
             placeholder='비밀번호를 입력해주세요'/>

      <button
        className="flex items-center justify-center bg-black text-white text-lg font-semibold rounded-lg h-14 shadow-lg w-full mb-[40px]">
        Continue
      </button>
      <div className="text-[14px] font-medium leading-[142.857%] text-gray-500 text-center font-pretendard" onClick={handleClickSignUp}>
        Don&#39;t have an account yet? Sign Up
      </div>

      {clientSequence && clientSequence === actionState.sequence
        ? createPortal(
          <PopupDialog
            popupType={actionState.userStatus ? PopupType.ERROR : actionState.userStatus ? PopupType.INFO : PopupType.WARNING}
            message={actionState.errorMessage || ''}
            buttonText={actionState.userStatus ? '시작하기' : '닫기'}
            onClose={() => {

            }}
          />,
          document.body,
        )
        : null}
    </form>
  );
};

export interface LoginActionResult {
  sequence: number;
  errorMessage?: string,
  userStatus?: UserStatus,
  accessToken?: string,
}