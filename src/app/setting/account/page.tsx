import { MenuItem } from "@/app/setting/setting.menu.item";
import React from "react";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function AccountSetting({
                                        searchParams
                                      }: {
  searchParams: Promise<{ appVersion: string }>
}) {
  return (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto py-8 ">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="계정"/>
      </div>
      <MenuItem label="프로필 수정" path="/profileEdit"/>
      <MenuItem label="알림" path="/notification"/>
      <div
        className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
      >
        <div className="text-gray-800">앱버전</div>
        <div className="text-gray-400">{(await searchParams).appVersion}</div>
      </div>
      <MenuItem label="로그아웃" path="/logout"/>
      <div className="mt-4">
        <MenuItem label="회원탈퇴" path="/setting/account/signOut"/>
      </div>

    </div>
  )
}