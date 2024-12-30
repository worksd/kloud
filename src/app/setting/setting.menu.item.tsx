'use client';

import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import { clearToken } from "@/app/setting/clear.token.action";
import { isMobile } from "react-device-detect";

export const MenuItem = ({ label, path }: { label: string; path: string }) => {

  const router = useRouter();
  const handleClick = async() => {
    if (path == "/logout") {
      await clearToken();
      if (window.KloudEvent) {
        window.KloudEvent.setToken('');
        window.KloudEvent.clearAndPush(KloudScreen.Login)
      } else {
        router.push("login");
      }
    } else {

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