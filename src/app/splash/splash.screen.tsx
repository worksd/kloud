"use client";

import { useEffect } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { UserStatus } from "@/entities/user/user.status";
import Logo from "../../../public/assets/logo_white.svg"

export const SplashScreen = ({status}: { status: UserStatus | undefined }) => {
  useEffect(() => {
    try {
      setTimeout(() => {
        const route = !status
          ? KloudScreen.Login
          : status === UserStatus.New
            ? KloudScreen.Onboard
            : status === UserStatus.Ready
              ? KloudScreen.Main
              : '';
        const bottomMenuList = getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: KloudScreen.Main,
        });

        if (route == KloudScreen.Main) {
          window.KloudEvent.navigateMain(bootInfo)
        } else {
          window.KloudEvent.clearAndPush(route);
        }
      }, 1000)
    } catch (error) {
      console.log(error);
    }

  }, [status]);

  return (
    <div>
    </div>
  );
};

export function getBottomMenuList() {
  return [
    {
      label: "홈",
      labelSize: 16,
      labelColor: "#FF5733",
      iconUrl: "https://picsum.photos/250/250",
      iconSize: 24,
      page: {
        route: "/home",
        initialColor: "#FFFFFF"
      },
    },
    {
      label: "검색",
      labelSize: 12,
      labelColor: "#3357FF",
      iconUrl: "https://picsum.photos/250/250",
      iconSize: 18,
      page: {
        route: "/search",
        initialColor: "#FFFFFF"
      },
    },
    {
      label: "알림",
      labelSize: 14,
      labelColor: "#33FF57",
      iconUrl: "https://picsum.photos/250/250",
      iconSize: 20,
      page: {
        route: "/notifications",
        initialColor: "#FFFFFF"
      },
    },
    {
      label: "마이페이지",
      labelSize: 14,
      labelColor: "#33FF57",
      iconUrl: "https://picsum.photos/250/250",
      iconSize: 20,
      page: {
        route: "/setting",
        initialColor: "#FFFFFF"
      },
    },
  ];
}