"use client";

import { useEffect } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { UserStatus } from "@/entities/user/user.status";
import Logo from "../../../public/assets/logo_white.svg"

export const SplashScreen = ({status}: { status: UserStatus | undefined }) => {
  useEffect(() => {
    try {
      setTimeout(() => {
        console.log('splash screen = ' + status);
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

        window.KloudEvent.sendBootInfo(bootInfo);
        window.KloudEvent.clearAndPush(route);
      }, 1000)
    } catch (error) {
      console.log(error);
    }

  }, [status]);

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Logo/>
    </div>
  );
};

export function getBottomMenuList() {
  return [
    {
      label: "Home",
      labelSize: 16,
      labelColor: "#FF5733",
      iconUrl: "https://example.com/icons/home.png",
      iconSize: 24,
      page: {
        route: "/home",
        initialColor: "#000000"
      },
    },
    {
      label: "Notifications",
      labelSize: 12,
      labelColor: "#3357FF",
      iconUrl: "https://example.com/icons/settings.png",
      iconSize: 18,
      page: {
        route: "/notifications",
        initialColor: "#000000"
      },
    },
    {
      label: "Profile",
      labelSize: 14,
      labelColor: "#33FF57",
      iconUrl: "https://example.com/icons/profile.png",
      iconSize: 20,
      page: {
        route: "/profile",
        initialColor: "#000000"
      },
    },
  ];
}