import { MenuItem } from "@/app/setting/setting.menu.item";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { api } from "@/app/api.client";
import { KloudScreen } from "@/shared/kloud.screen";
import Image from "next/image";
import React from "react";
import { SettingHeader } from "@/app/setting/setting.header";

export default async function Setting({
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
      <div className="flex flex-col w-screen min-h-screen bg-white mx-auto py-8 ">
        {/* 프로필 섹션 */}
        <SettingHeader user={user}/>

        {/* 메뉴 리스트 */}
        <MenuItem label="구매내역" path={KloudScreen.Tickets}/>
        <MenuItem label="약관 및 정책" path={KloudScreen.Terms}/>
        {os === 'Android' && <MenuItem label="문의하기" path={KloudScreen.Inquiry}/>}
      </div>
    );
  }
};

