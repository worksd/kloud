import { MenuItem } from "@/app/setting/setting.menu.item";
import React from "react";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { VersionMenu } from "@/app/setting/account/version.menu";
import { DialogClickWrapper } from "@/utils/DialogClickWrapper";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";

export default async function AccountSetting({
                                               searchParams
                                             }: {
  searchParams: Promise<{ appVersion: string }>
}) {
  return (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto py-8 ">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="account"/>
      </div>
      <DialogClickWrapper id={"UnderDevelopment"}>
        <MenuItem label="edit_profile"/>
      </DialogClickWrapper>
      <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileEdit}>
        <MenuItem label="edit_refund_account"/>
      </NavigateClickWrapper>
      <DialogClickWrapper id={"UnderDevelopment"}>
        <MenuItem label="notification_setting"/>
      </DialogClickWrapper>
      <NavigateClickWrapper method={'push'} route={KloudScreen.LanguageSetting}>
        <MenuItem label="language_setting"/>
      </NavigateClickWrapper>
      <VersionMenu
        title={await translate('app_version')}
        version={(await searchParams).appVersion}/>

      <DialogClickWrapper id={"Logout"}>
        <MenuItem label="log_out"/>
      </DialogClickWrapper>

      <NavigateClickWrapper method={'push'} route={KloudScreen.SignOut}>
        <MenuItem label="sign_out"/>
      </NavigateClickWrapper>
    </div>
  )
}