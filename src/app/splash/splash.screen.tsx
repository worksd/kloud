"use client";

import { useEffect } from "react";
import { authToken } from "@/app/splash/auth.token.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { getStoreLink } from "@/app/components/MobileWebViewTopBar";

export const SplashScreen = ({os}: { os: string }) => {
  useEffect(() => {
    setTimeout(async () => {
      if (process.env.NEXT_PUBLIC_MAINTENANCE == 'true') {
        window.KloudEvent?.clearAndPush(KloudScreen.Maintenance)
        return;
      }
      const res = await authToken()
      if (res.code == 'APP_UPGRADE_REQUIRED') {
        const dialog = await createDialog('AppUpgrade', res.errorTitle)
        window.KloudEvent.showDialog(JSON.stringify(dialog))
        return;
      }
      const status = res.status

      const route = !status
        ? KloudScreen.Login('')
        : status === UserStatus.New
          ? KloudScreen.Onboard('')
          : status === UserStatus.Ready
            ? KloudScreen.Main
            : status == UserStatus.Deactivate ? KloudScreen.LoginDeactivate : KloudScreen.Login('')


      if (route == KloudScreen.Main) {
        const bootInfo = JSON.stringify({
          bottomMenuList: await getBottomMenuList(),
          route: '',
          withFcmToken: true,
        });
        window.KloudEvent?.navigateMain(bootInfo)
      } else {
        window.KloudEvent?.clearAndPush(route)
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