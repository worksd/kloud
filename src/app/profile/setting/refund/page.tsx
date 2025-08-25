import React from "react";
import { RefundAccountEditForm } from "@/app/profile/setting/refund/RefundAccountEditForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { KloudScreen } from "@/shared/kloud.screen";

export default async function RefundAccountEditPage() {
  const user = await getUserAction()
  if (user != null && 'id' in user) {
    return (
      <div className={'flex flex-col'}>
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource={'refund_account'}/>
        </div>
        <RefundAccountEditForm
          initialAccountBank={user.refundAccountBank}
          initialAccountDepositor={user.refundAccountDepositor}
          initialAccountNumber={user.refundAccountNumber}
          baseRoute={KloudScreen.RefundAccountSetting}
          isFromBottomSheet={false}
        />
      </div>
    )
  } else {
    return <div className={'text-black'}>{user?.message}</div>
  }
}