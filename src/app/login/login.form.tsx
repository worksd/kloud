'use client';
import React, { FormEventHandler, useState } from "react";
import { createPortal, useFormState } from "react-dom";
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { loginAction } from "@/app/login/login.action";
import PopupDialog, { PopupType } from "@/app/components/PopupDialog";

export const LoginForm = () => {
  const [actionState, formAction] = useFormState(loginAction, {
    sequence: 0,
    errorMessage: '',
    userStatus: undefined,
    accessToken: ''
  });
  const [clientSequence, setClientSequence] = useState(0);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    if (typeof window !== 'undefined') {
      if (actionState.userStatus) {
        if (actionState.userStatus == UserStatus.New) {
          window.KloudEvent.navigate(KloudScreen.Onboard);
        }
        else if (actionState.userStatus == UserStatus.Ready) {
          window.KloudEvent.navigateMain(`[{
            label: "Home",
            labelSize: 16,
            labelColor: "#FF5733",
            iconUrl: "https://example.com/icons/home.png",
            iconSize: 24,
            url: "https://example.com/home"
          },
            {
              label: "Profile",
              labelSize: 14,
              labelColor: "#33FF57",
              iconUrl: "https://example.com/icons/profile.png",
              iconSize: 20,
              url: "https://example.com/profile"
            },
            {
              label: "Settings",
              labelSize: 12,
              labelColor: "#3357FF",
              iconUrl: "https://example.com/icons/settings.png",
              iconSize: 18,
              url: "https://example.com/settings"
            }]`)
        }
      }
    }
    setClientSequence((prev) => prev + 1);
  };

  return (
    <form className={'flex flex-col'} action={formAction} onSubmit={handleSubmit}>
      <label htmlFor="email">이메일</label>
      <input
        className="text-black border border-gray-300 rounded-md p-2"
        type="email"
        id="email"
        name="email"
        placeholder='이메일을 입력해주세요'
      />
      <label className={'mt-2'} htmlFor="password">
        비밀번호
      </label>
      <input className="text-black border border-gray-300 rounded-md p-2" type="password" id="password"
             name="password"
      placeholder='비밀번호를 입력해주세요'/>

      <button className={'mt-8 bg-white text-black py-1 active:scale-95'} type="submit">
        로그인하기
      </button>

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