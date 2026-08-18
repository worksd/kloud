import React from "react";
import { RefundAccountEditForm } from "@/app/profile/setting/account/refund/RefundAccountEditForm";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function RefundAccountEditPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const user = await getUserAction()
  if (user == null || !('id' in user)) {
    return <div className={'text-black'}>{user?.message}</div>
  }

  const formProps = {
    initialAccountBank: user.refundAccountBank,
    initialAccountDepositor: user.refundAccountDepositor,
    initialAccountNumber: user.refundAccountNumber,
    baseRoute: KloudScreen.RefundAccountSetting,
    isFromBottomSheet: false,
    confirmText: await translate('confirm'),
    refundBankText: await translate('refund_account_bank'),
    refundBankPlaceholder: await translate('input_refund_account_bank'),
    refundAccountText: await translate('refund_account_number'),
    refundAccountPlaceholder: await translate('input_refund_account_number'),
    refundDepositorText: await translate('refund_account_depositor'),
    refundDepositorPlaceholder: await translate('input_refund_account_depositor'),
  };

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('refund_account')}
      mobile={
        <div className={'flex flex-col'}>
          <RefundAccountEditForm {...formProps}/>
        </div>
      }
    >
      <RefundAccountEditForm {...formProps} pcCard/>
    </SettingPcShell>
  );
}
