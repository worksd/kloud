'use client';

import { KloudScreen } from "@/shared/kloud.screen";
import { clearToken } from "@/app/setting/clear.token.action";
import RightArrowIcon from "../../../public/assets/right-arrow.svg"
import { useEffect } from "react";
import { deleteUserAction } from "@/app/setting/sign.out.action";

export const MenuItem = ({label, path}: { label: string; path: string }) => {

  const handleClick = async () => {
    if (path === "/logout") {
      const dialogInfo = {
        id: 'Logout',
        type: 'YESORNO',
        title: '로그아웃',
        message: "정말로 로그아웃 하시겠습니까?",
        route: KloudScreen.Login,
      }
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));

    } else if (path === '/deactivate') {
      window.KloudEvent?.push(KloudScreen.SignOut)
    } else if (path === '/profileEdit' || path == '/notification') {
      // TODO: 구현
      const dialogInfo = {
        id: 'ProfileEdit',
        type: 'SIMPLE',
        title: '프로필 수정',
        message: "개발 중인 메뉴입니다. 조금만 기다려주세요!",
        route: KloudScreen.Login,
      }
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    } else {
      window.KloudEvent?.push(path);
    }
  }


  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      console.log(data)
      if (data.route && data.id == 'Logout') {
        await clearToken();
        localStorage.clear();
        sessionStorage.clear();
        window.KloudEvent?.clearToken()
        window.KloudEvent?.showToast('성공적으로 로그아웃하였습니다.')
        window.KloudEvent.clearAndPush(data.route)
      }
    }
  }, [])

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

export type DialogInfo = {
  id: string;
  route: string;
}