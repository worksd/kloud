'use client';

import { KloudScreen } from "@/shared/kloud.screen";
import { clearToken } from "@/app/setting/clear.token.action";
import RightArrowIcon from "../../../public/assets/right-arrow.svg"

export const MenuItem = ({label, path}: { label: string; path: string }) => {

  const handleClick = async () => {
    if (path === "/logout") {
      await clearToken();
      localStorage.clear();
      sessionStorage.clear();
      window.KloudEvent?.clearToken()
      window.KloudEvent?.showToast('성공적으로 로그아웃하였습니다.')
      window.KloudEvent?.clearAndPush(KloudScreen.Login);
    } else {
      window.KloudEvent?.push(path);
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