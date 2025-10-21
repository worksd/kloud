import { MenuItem } from "@/app/profile/setting.menu.item";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { api } from "@/app/api.client";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import SettingIcon from "../../../public/assets/ic_setting.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import Image from "next/image";
import { translate } from "@/utils/translate";

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

        <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileEdit}>
          <div
            className="flex border mx-4 mb-5 justify-center py-3 rounded-[8px] border-[#E8E8E8] text-[#505356] font-medium active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none">
            {await translate('edit_profile')}
          </div>
        </NavigateClickWrapper>

        <NavigateClickWrapper method={'push'} route={KloudScreen.Tickets}>
          <MenuItem label={'my_tickets'}/>
        </NavigateClickWrapper>

        <NavigateClickWrapper method={'push'} route={KloudScreen.MyPass}>
          <MenuItem label="my_pass"/>
        </NavigateClickWrapper>

        <NavigateClickWrapper method={'push'} route={KloudScreen.MySubscription}>
          <MenuItem label="my_subscription"/>
        </NavigateClickWrapper>

        <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentRecords}>
          <MenuItem label="payment_records"/>
        </NavigateClickWrapper>
      </div>
    );
  }
};