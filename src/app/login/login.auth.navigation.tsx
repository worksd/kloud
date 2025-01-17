'use client'
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils";
import { KloudScreen } from "@/shared/kloud.screen";

export const loginAuthNavigation = ({status, window}: {status?: UserStatus, window: Window}) => {
  if (status == UserStatus.Ready) {
    const bootInfo = JSON.stringify({
      bottomMenuList: getBottomMenuList(),
      route: KloudScreen.Main,
    });
    window.KloudEvent?.navigateMain(bootInfo)
  }
  else if (status == UserStatus.New) {
    window.KloudEvent?.clearAndPush(KloudScreen.Onboard)
  } else {
    const dialogInfo = {
      title: "로그인에 실패했습니다",
      withConfirmButton: true,
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
  }
}