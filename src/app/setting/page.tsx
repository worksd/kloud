'use client'
import { MenuItem } from "@/app/setting/setting.menu.item";
import { clearToken } from "@/app/setting/clear.token.action";

export default function Setting(){
  return (
    <div className="w-screen min-h-screen bg-white mx-auto py-8 px-4">
      {/* 프로필 섹션 */}
      <div className="mb-8">
        <div className="font-bold text-lg text-black">서종렬</div>
        <div className="text-gray-500">jongryeol.seo@worksd.kr</div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="space-y-4">
        <MenuItem label="구매내역" path="/purchase-history"/>
        <MenuItem label="문의하기" path="/contact"/>
        <MenuItem label="자주 묻는 질문" path="/faq"/>
        <MenuItem label="공지사항" path="/notices"/>
        <MenuItem label="약관 및 정책" path="/terms-and-policies"/>
        <MenuItem label="로그아웃" path="/logout" />
      </div>
    </div>
  );
};

