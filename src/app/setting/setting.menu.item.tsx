'use client';

import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import { clearToken } from "@/app/setting/clear.token.action";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import RightArrowIcon from "../../../public/assets/right-arrow.svg"

export const MenuItem = ({ label, path }: { label: string; path: string }) => {
  const router = useRouter();

  const handleClick = async() => {
    if (path === "/logout") {
      // 서버 액션으로 토큰 클리어
      await clearToken();
      
      // 클라이언트 쿠키 삭제
      document.cookie = `${accessTokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `${userIdKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

      // 로컬 스토리지도 클리어
      localStorage.clear();

      // 세션 스토리지도 클리어
      sessionStorage.clear();

      // 모바일 앱 처리
      if (window.KloudEvent) {
        window.KloudEvent.showToast('성공적으로 로그아웃하였습니다.')
        window.KloudEvent.clearAndPush(KloudScreen.Login);
      } else {
        // 웹 브라우저 처리
        router.push("/login");
        // 강제로 페이지 새로고침하여 상태 초기화
        router.refresh();
      }
    } else {
      // 다른 메뉴 아이템 처리
      if (window.KloudEvent) {
        window.KloudEvent.push(path);
      } else {
        router.push(path);
      }
    }
  };

  return (
    <div
      className="flex justify-between items-center bg-white px-4 py-4 cursor-pointer border-gray-200 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
      onClick={handleClick}
    >
      <div className="text-gray-800">{label}</div>
      <RightArrowIcon/>
    </div>
  );
};