'use client';

import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import { clearToken } from "@/app/setting/clear.token.action";
import { isMobile } from "react-device-detect";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";

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
      className="flex justify-between items-center cursor-pointer py-2 border-b border-gray-200"
      onClick={handleClick}
    >
      <span className="text-gray-800">{label}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  );
};