"use client";

import { useEffect } from "react";
import { UserStatus } from "@/entities/user/user.status";
import { authNavigateAction } from "@/app/splash/auth.navigate.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils";

export const SplashScreen = ({status}: { status: UserStatus | undefined }) => {
  useEffect(() => {
    setTimeout(() => {
      const route = authNavigateAction({status: status})
      if (route == KloudScreen.Main) {
        console.log(getBottomMenuList())
        const bootInfo = JSON.stringify({
          bottomMenuList: getBottomMenuList(),
          route: KloudScreen.Main,
        });
        window.KloudEvent?.navigateMain(bootInfo)
      } else {
        window.KloudEvent?.clearAndPush(route)
      }
    }, 1000)
  }, [status]);

  return (
    <div className="bg-black">
    </div>
  );
};