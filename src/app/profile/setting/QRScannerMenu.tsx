'use server'
import {getUserAction} from "@/app/onboarding/action/get.user.action";
import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {KloudScreen} from "@/shared/kloud.screen";
import {MenuItem} from "@/app/profile/setting.menu.item";
import React from "react";
import {UserType} from "@/entities/user/user.type";

export const QRScannerMenu = async () => {
  const res = await getUserAction();
  if (res && 'id' in res && (res.type == UserType.Operator || res.type == UserType.Partner)) {
    return (
      <NavigateClickWrapper method={'push'} route={KloudScreen.QRScan}>
        <MenuItem label="qr_scanner"/>
      </NavigateClickWrapper>
    );
  } else {
    return null;
  }
}
