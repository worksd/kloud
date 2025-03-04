import { MenuItem } from "@/app/setting/setting.menu.item";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { api } from "@/app/api.client";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { SettingHeader } from "@/app/setting/setting.header";
import { PassPurchaseButton } from "@/app/setting/PassPurchaseButton";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

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
      <div className="flex flex-col min-h-screen bg-white py-8">
        <div className={"px-4 mb-4"}>
          <SettingHeader user={user}/>
          <PassPurchaseButton/>
        </div>
        <NavigateClickWrapper method={'push'} route={KloudScreen.Tickets}>
          <MenuItem label="payment_records"/>
        </NavigateClickWrapper>

        <NavigateClickWrapper method={'push'} route={KloudScreen.Terms}>
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