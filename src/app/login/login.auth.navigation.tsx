'use client'
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils";
import { KloudScreen } from "@/shared/kloud.screen";

export const loginAuthNavigation = ({status, message, window}: {status?: UserStatus, message?: string, window: Window}) => {
  if (status == UserStatus.Ready) {
    const bootInfo = JSON.stringify({
      bottomMenuList: getBottomMenuList(),
      route: '',
    });
    console.log('bootInfo = ' + bootInfo);
    window.KloudEvent?.navigateMain(bootInfo)
  }
  else if (status == UserStatus.New) {
    window.KloudEvent?.clearAndPush(KloudScreen.Onboard)
  } else {
    const dialogInfo = {
      id: 'Empty',
      type: 'SIMPLE',
      title: '로그인 실패',
      message: message ?? '알 수 없는 에러가 발생했습니다',
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }
}