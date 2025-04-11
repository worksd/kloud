import React from "react";
import { RefundAccountEditForm } from "@/app/setting/account/refund/RefundAccountEditForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getUserAction } from "@/app/onboarding/action/get.user.action";

export default async function ProfileEditPage() {
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
        />
      </div>
    )
  } else {
    return <div className={'text-black'}>{user?.message}</div>
  }
}