'use client'
import Image from "next/image";
import React from "react";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import SettingIcon from "../../../public/assets/ic_setting.svg";

export const SettingHeader = ({user}: { user: GetUserResponse }) => {

  const onClickSettingAccount = () => {
    window.KloudEvent?.push(KloudScreen.AccountSetting)
  }

  return (
    <div className={"flex flex-row items-center justify-between mb-8 w-full"}>

      <div className={"flex flex-row justify-center items-center"}>
        <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={user.profileImageUrl ?? ''}
            alt="studio logo"
            width={40}
            height={40}
            className="w-full h-full object-cover"

          />
        </div>
        <div className="flex flex-col px-4">
          <div className="font-bold text-lg text-black">{user.nickName}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>
      </div>

      <div onClick={onClickSettingAccount}>
        <SettingIcon/>
      </div>


    </div>
  )
}