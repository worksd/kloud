'use client'
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { createDialog } from "@/utils/dialog.factory";

export const LoginAuthNavigation = async ({status, message, window}: {status?: UserStatus, message?: string, window: Window}) => {
  if (status == UserStatus.Ready) {
    const bootInfo = JSON.stringify({
      bottomMenuList: await getBottomMenuList(),
      route: '',
      withFcmToken: true,
    });
    window.KloudEvent?.navigateMain(bootInfo)
  }
  else if (status == UserStatus.Deactivate) {
    window.KloudEvent?.push(KloudScreen.LoginDeactivate)
  }
  else if (status == UserStatus.New) {
    window.KloudEvent?.clearAndPush(KloudScreen.Onboard(''))
  } else {
    const dialogInfo = await createDialog({id: 'LoginFail', message})
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }
}