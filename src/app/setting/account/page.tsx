import { MenuItem } from "@/app/setting/setting.menu.item";
import React from "react";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { VersionMenu } from "@/app/setting/account/version.menu";

export default async function AccountSetting({
                                        searchParams
                                      }: {
  searchParams: Promise<{ appVersion: string }>
}) {
  return (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto py-8 ">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="account"/>
      </div>
      <MenuItem label="edit_profile" path="/profileEdit"/>
      <MenuItem label="notification_setting" path="/notification"/>
      <MenuItem label="language_setting" path="/setting/account/language"/>
      <VersionMenu version={(await searchParams).appVersion}/>
      <MenuItem label="log_out" path="/logout"/>
      <div className="mt-4">
        <MenuItem label="sign_out" path="/setting/account/signOut"/>
      </div>

    </div>
  )
}