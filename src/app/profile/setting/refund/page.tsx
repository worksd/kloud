import React from "react";
import { RefundAccountEditForm } from "@/app/profile/setting/refund/RefundAccountEditForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";

export default async function RefundAccountEditPage() {
  const user = await getUserAction()
  if (user != null && 'id' in user) {
    return (
      <div className={'flex flex-col'}>
        <RefundAccountEditForm
          initialAccountBank={user.refundAccountBank}
          initialAccountDepositor={user.refundAccountDepositor}
          initialAccountNumber={user.refundAccountNumber}
          baseRoute={KloudScreen.RefundAccountSetting}
          isFromBottomSheet={false}
          confirmText={await translate('confirm')}
          refundBankText={await translate('refund_account_bank')}
          refundBankPlaceholder={await translate('input_refund_account_bank')}
          refundAccountText={await translate('refund_account_number')}
          refundAccountPlaceholder={await translate('input_refund_account_number')}
          refundDepositorText={await translate('refund_account_depositor')}
          refundDepositorPlaceholder={await translate('input_refund_account_depositor')}
        />
      </div>
    )
  } else {
    return <div className={'text-black'}>{user?.message}</div>
  }
}