import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";

export const authNavigateAction = ({status} : { status?: UserStatus }) => {
  return !status
    ? KloudScreen.Login
    : status === UserStatus.New
      ? KloudScreen.Onboard
      : status === UserStatus.Ready
        ? KloudScreen.Main
        : '';
}