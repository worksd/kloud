import { MenuItem } from "@/app/profile/setting.menu.item";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { api } from "@/app/api.client";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import SettingIcon from "../../../public/assets/ic_setting.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import Image from "next/image";

export default async function SettingPage({
                                            searchParams
                                          }: {
  searchParams: Promise<{ os: string }>
}) {
  const os = (await searchParams).os
  const cookieStore = await cookies()
  const user = await api.user.get({
    id: Number(cookieStore.get(userIdKey)?.value)
  })

  if ('id' in user) {
    return (
      <div className="flex flex-col min-h-screen bg-white py-8 w-full max-w-screen overflow-x-hidden">
        <div className="flex justify-end px-4 mb-4">
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileSetting}>
            <SettingIcon/>
          </NavigateClickWrapper>
        </div>

        <div className={"flex flex-row w-full items-start ml-6 mb-5"}>
          <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
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
        <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentRecords}>
          <MenuItem label="payment_records"/>
        </NavigateClickWrapper>

        <NavigateClickWrapper method={'push'} route={KloudScreen.MyPass}>
          <MenuItem label="my_pass"/>
        </NavigateClickWrapper>

        <NavigateClickWrapper method={'push'} route={KloudScreen.Policy}>
          <MenuItem label="terms_and_policy"/>
        </NavigateClickWrapper>

        {os === 'Android' &&
          <NavigateClickWrapper method={'push'} route={KloudScreen.Inquiry}>
            <MenuItem label="inquiry"/>
          </NavigateClickWrapper>
        }
      </div>
    );
  }
};