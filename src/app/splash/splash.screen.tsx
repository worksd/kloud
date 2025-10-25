"use client";

import { useEffect } from "react";
import { authToken } from "@/app/splash/auth.token.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { getStoreLink } from "@/app/components/MobileWebViewTopBar";
import { kloudNav } from "@/app/lib/kloudNav";

export const SplashScreen = ({os}: { os: string }) => {
  useEffect(() => {
    setTimeout(async () => {
      if (process.env.NEXT_PUBLIC_MAINTENANCE == 'true') {
        kloudNav.clearAndPush(KloudScreen.Maintenance)
        return;
      }
      const res = await authToken()
      if (res.code == 'APP_UPGRADE_REQUIRED') {
        const dialog = await createDialog({id: 'AppUpgrade', message: res.errorTitle})
        window.KloudEvent.showDialog(JSON.stringify(dialog))
        return;
      }
      const status = res.status
      if (status == UserStatus.New) {
        kloudNav.clearAndPush(KloudScreen.Onboard(''))
      }
      else if (status == UserStatus.Ready) {
        const bootInfo = JSON.stringify({
          bottomMenuList: await getBottomMenuList(),
          route: '',
          withFcmToken: true,
        });
        window.KloudEvent?.navigateMain(bootInfo)
      }
      else if (status == UserStatus.Deactivate) {
        kloudNav.clearAndPush(KloudScreen.LoginDeactivate)
      } else {
        kloudNav.clearAndPush(KloudScreen.Login(''))
      }
    }, 1000)
  }, []);

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {
      if (dialogInfo.id == 'AppUpgrade') {
        const url = getStoreLink({os})?.url
        if (url) {
          window.KloudEvent.openExternalBrowser(url)
        }
      }
    }
  }, []);

  return (
    <div className="bg-black">
    </div>
  );
};