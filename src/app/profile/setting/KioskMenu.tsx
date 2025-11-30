'use server'
import {getUserAction} from "@/app/onboarding/action/get.user.action";
import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {KloudScreen} from "@/shared/kloud.screen";
import {MenuItem} from "@/app/profile/setting.menu.item";
import React from "react";

export const KioskMenu = async () => {
  const res = await getUserAction();
  if (res && 'id' in res) {
    return (
      <NavigateClickWrapper method={'push'} route={KloudScreen.Kiosk}>
        <MenuItem label="kiosk"/>
      </NavigateClickWrapper>
    );
  } else {
    return null;
  }
}
