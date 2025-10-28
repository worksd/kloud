'use client'
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { createDialog } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";

export const LoginAuthNavigation = async ({status, message, window}: {status?: UserStatus, message?: string, window: Window}) => {
  if (status == UserStatus.Ready) {
    await kloudNav.navigateMain({})
  }
  else if (status == UserStatus.Deactivate) {
    await kloudNav.push(KloudScreen.LoginDeactivate)
  }
  else if (status == UserStatus.New) {
    kloudNav.clearAndPush(KloudScreen.Onboard(''))
  } else {
    const dialogInfo = await createDialog({id: 'LoginFail', message})
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }
}