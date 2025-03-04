"use client";

import { useEffect } from "react";
import { authToken } from "@/app/splash/auth.token.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { useLocale } from "@/hooks/useLocale";

export const SplashScreen = () => {
  const { locale } = useLocale()
  useEffect(() => {
    setTimeout(async () => {
      if (process.env.NEXT_PUBLIC_MAINTENANCE == 'true') {
        window.KloudEvent?.clearAndPush(KloudScreen.Maintenance)
        return
      }
      const res = await authToken()
      const status = res.status

      const route = !status
        ? KloudScreen.Login
        : status === UserStatus.New
          ? KloudScreen.Onboard
          : status === UserStatus.Ready
            ? KloudScreen.Main : KloudScreen.Login


      if (route == KloudScreen.Main) {
        const bootInfo = JSON.stringify({
          bottomMenuList: getBottomMenuList(locale),
          route: '',
          withFcmToken: true,
        });
        window.KloudEvent?.navigateMain(bootInfo)
      } else {
        window.KloudEvent?.clearAndPush(route)
      }
    }, 1000)
  }, []);

  return (
    <div className="bg-black">
    </div>
  );
};