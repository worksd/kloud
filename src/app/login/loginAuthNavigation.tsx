'use client'
import { UserStatus } from "@/entities/user/user.status";
import { KloudScreen } from "@/shared/kloud.screen";
import { createDialog } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";
import { enterAfterAuth } from "@/app/lib/enterAfterAuth";
import { UserType } from "@/entities/user/user.type";

export const LoginAuthNavigation = async ({status, type, message, window}: {status?: UserStatus, type?: UserType, message?: string, window: Window}) => {
  if (status == UserStatus.Ready) {
    // 관리자(Partner/Operator)는 관리자 홈으로 — 스플래시와 같은 분기
    await enterAfterAuth({ type })
  }
  else if (status == UserStatus.Deactivate) {
    kloudNav.push(KloudScreen.LoginDeactivate)
  }
  else if (status == UserStatus.New) {
    kloudNav.clearAndPush(KloudScreen.Onboard)
  } else {
    const dialogInfo = await createDialog({id: 'LoginFail', message})
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }
}