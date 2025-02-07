import { SettingHeader } from "@/app/setting/setting.header";
import { MenuItem } from "@/app/setting/setting.menu.item";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function AccountSetting({
                                        searchParams
                                      }: {
  searchParams: Promise<{ os: string }>
}) {
  return (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto py-8 ">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="계정"/>
      </div>
      <MenuItem label="프로필 수정" path="/profileEdit"/>
      <MenuItem label="알림" path="/notification"/>
      <MenuItem label="로그아웃" path="/logout"/>
      <div className="mt-4">
        <MenuItem label="회원탈퇴" path="/setting/account/signOut"/>
      </div>

    </div>
  )
}