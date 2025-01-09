import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { clearAndPush, navigateMain } from "@/utils/kloud.navigate";

export const authNavigateAction = ({status} : { status?: UserStatus }) => {
  'use client'

  const route = !status
    ? KloudScreen.Login
    : status === UserStatus.New
      ? KloudScreen.Onboard
      : status === UserStatus.Ready
        ? KloudScreen.Main
        : '';
  if (route == KloudScreen.Main) {
    navigateMain()
  } else {
    clearAndPush({route})
  }
}