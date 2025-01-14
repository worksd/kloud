import { MenuItem } from "@/app/setting/setting.menu.item";
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { api } from "@/app/api.client";
import { redirect } from "next/navigation";

export default async function Setting(){
  console.log(cookies().get(userIdKey)?.value)
  const user = await api.user.get({
    id: Number(cookies().get(userIdKey)?.value)
  })
  if ('id' in user) {
    console.log('hello setting' + cookies().get(accessTokenKey)?.value)
    return (
      <div className="w-screen min-h-screen bg-white mx-auto py-8 ">
        {/* 프로필 섹션 */}
        <div className="mb-8 px-4">
          <div className="font-bold text-lg text-black">{user.name}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>

        {/* 메뉴 리스트 */}
        <MenuItem label="구매내역" path="/tickets"/>
        <MenuItem label="문의하기" path="/contact"/>
        <MenuItem label="자주 묻는 질문" path="/faq"/>
        <MenuItem label="공지사항" path="/notices"/>
        <MenuItem label="약관 및 정책" path="/terms-and-policies"/>
        <MenuItem label="로그아웃" path="/logout" />
      </div>
    );
  }
};

