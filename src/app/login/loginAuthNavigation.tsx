'use client'
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { StringResource } from "@/shared/StringResource";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";

export const LoginAuthNavigation = ({status, message, window, locale}: {status?: UserStatus, message?: string, window: Window, locale: keyof typeof StringResource}) => {
  if (status == UserStatus.Ready) {
    const bootInfo = JSON.stringify({
      bottomMenuList: getBottomMenuList(locale),
      route: '',
      withFcmToken: true,
    });
    console.log('bootInfo = ' + bootInfo);
    window.KloudEvent?.navigateMain(bootInfo)
  }
  else if (status == UserStatus.Deactivate) {
    window.KloudEvent?.clearAndPush(KloudScreen.LoginDeactivate)
  }
  else if (status == UserStatus.New) {
    window.KloudEvent?.clearAndPush(KloudScreen.Onboard)
  } else {
    const dialogInfo = {
      id: 'Empty',
      type: 'SIMPLE',
      title: '로그인 실패',
      message: message,
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }
}