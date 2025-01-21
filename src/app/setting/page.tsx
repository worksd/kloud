import { MenuItem } from "@/app/setting/setting.menu.item";
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { api } from "@/app/api.client";
import { redirect } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";

export default async function Setting(){
  const cookieStore = await cookies()
  const user = await api.user.get({
    id: Number(cookieStore.get(userIdKey)?.value)
  })
  if ('id' in user) {
    return (
      <div className="w-screen min-h-screen bg-white mx-auto py-8 ">
        {/* 프로필 섹션 */}
        <div className="mb-8 px-4">
          <div className="font-bold text-lg text-black">{user.name}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>

        {/* 메뉴 리스트 */}
        <MenuItem label="구매내역" path={KloudScreen.Tickets}/>
        <MenuItem label="약관 및 정책" path={KloudScreen.Terms}/>
        <MenuItem label="로그아웃" path="/logout" />
      </div>
    );
  }
};

