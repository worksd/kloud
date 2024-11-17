"use client";

import { useEffect } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { UserStatus } from "@/entities/user/user.status";
import Logo from "../../../public/assets/logo_white.svg"

export const SplashScreen = () => {
  useEffect(() => {

    try {
      const res = {
        status: UserStatus.Ready // 동적으로 상태를 가져오도록 변경 가능
      };
      const routeScreen = !res.status
        ? KloudScreen.Login
        : res.status === UserStatus.New
          ? KloudScreen.Onboard
          : res.status === UserStatus.Ready
            ? KloudScreen.Main
            : '';
      const bottomMenuList = getBottomMenuList();
      const bootInfo = JSON.stringify({
        bottomMenuList: bottomMenuList,
        route: routeScreen,
      });

      window.KloudEvent.sendBootInfo(bootInfo);
    } catch (error) {
      console.log(error);
    }


    // const handlePageStarted = async () => {
    //
    //
    // console.log("add event");
    // window.addEventListener("onSplashStarted", handlePageStarted);
    //
    // return () => {
    //   console.log("remove event");
    //   window.removeEventListener("onSplashStarted", handlePageStarted);

  }, []);

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
      url: "home",
    },
    {
      label: "Profile",
      labelSize: 14,
      labelColor: "#33FF57",
      iconUrl: "https://example.com/icons/profile.png",
      iconSize: 20,
      url: "profile",
    },
    {
      label: "Settings",
      labelSize: 12,
      labelColor: "#3357FF",
      iconUrl: "https://example.com/icons/settings.png",
      iconSize: 18,
      url: "settings",
    },
  ];
}