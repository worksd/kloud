'use client'
import { InputComponent } from "@/app/components/InputComponent";
import React from "react";
import { CommonSubmitButton } from "@/app/components/buttons";
import { TranslatableText } from "@/utils/TranslatableText";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog } from "@/utils/dialog.factory";

export const RefundAccountEditForm = ({
                                      initialAccountNumber,
                                      initialAccountBank,
                                      initialAccountDepositor
                                    }: {
  initialAccountNumber?: string;
  initialAccountBank?: string;
  initialAccountDepositor?: string;
}) => {

  const [refundAccountNumber, setRefundAccountNumber] = React.useState(initialAccountNumber ?? '');
  const [refundAccountBank, setRefundAccountBank] = React.useState(initialAccountBank ?? '');
  const [refundAccountDepositor, setRefundAccountDepositor] = React.useState(initialAccountDepositor ?? '');

  const handleClickSubmit = async () => {
    if (refundAccountBank.length == 0 || refundAccountDepositor.length == 0 || refundAccountNumber.length == 0) {
      const dialog = await createDialog('EmptyAccountInformation')
      window.KloudEvent.showDialog(JSON.stringify(dialog));
      return;
    }
    const res = await updateUserAction({
      refundAccountBank,
      refundAccountNumber: refundAccountNumber.replace('-', ''),
      refundDepositor: refundAccountDepositor,
    })

    if (res.success) {
      const dialog = await createDialog('RefundAccountUpdateSuccess')
      window.KloudEvent.showDialog(JSON.stringify(dialog));
    }
  }

  return (
    <div className={'flex flex-col px-4 space-y-2'}>
      <InputComponent
        isRequired={false}
        labelResource={'refund_account_bank'}
        placeholderResource={'input_refund_account_bank'}
        value={refundAccountBank}
        onValueChangeAction={(value: string) => setRefundAccountBank(value)}/>
      <InputComponent
        isRequired={false}
        labelResource={'refund_account_number'}
        placeholderResource={'input_refund_account_number'}
        value={refundAccountNumber}
        onValueChangeAction={(value: string) => setRefundAccountNumber(value)}/>
      <InputComponent
        isRequired={false}
        labelResource={'refund_account_depositor'}
        placeholderResource={'input_refund_account_depositor'}
        value={refundAccountDepositor}
        onValueChangeAction={(value: string) => setRefundAccountDepositor(value)}/>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 bg-white">
        <CommonSubmitButton originProps={{onClick: handleClickSubmit}}>
          <TranslatableText titleResource={'edit_profile'}/>
        </CommonSubmitButton>
      </div>
    </div>
  )
}