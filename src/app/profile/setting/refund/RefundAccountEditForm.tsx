'use client'
import { InputComponent } from "@/app/components/InputComponent";
import React, { useEffect } from "react";
import { CommonSubmitButton } from "@/app/components/buttons";
import { TranslatableText } from "@/utils/TranslatableText";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";

export const RefundAccountEditForm = ({
                                        initialAccountNumber,
                                        initialAccountBank,
                                        initialAccountDepositor,
                                        baseRoute,
  isFromBottomSheet
                                      }: {
  initialAccountNumber?: string;
  initialAccountBank?: string;
  initialAccountDepositor?: string;
  baseRoute?: string;
  isFromBottomSheet?: boolean;
}) => {

  const [refundAccountNumber, setRefundAccountNumber] = React.useState(initialAccountNumber ?? '');
  const [refundAccountBank, setRefundAccountBank] = React.useState(initialAccountBank ?? '');
  const [refundAccountDepositor, setRefundAccountDepositor] = React.useState(initialAccountDepositor ?? '');

  const handleClickSubmit = async () => {
    if (refundAccountBank.length == 0 || refundAccountDepositor.length == 0 || refundAccountNumber.length == 0) {
      const dialog = await createDialog({id: 'EmptyAccountInformation'})
      window.KloudEvent.showDialog(JSON.stringify(dialog));
      return;
    }
    const res = await updateUserAction({
      refundAccountBank,
      refundAccountNumber: refundAccountNumber.replace('-', ''),
      refundDepositor: refundAccountDepositor,
    })

    if (res.success) {
      const dialog = await createDialog({id: 'RefundAccountUpdateSuccess'})
      window.KloudEvent.showDialog(JSON.stringify(dialog));
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      window.KloudEvent.refresh(baseRoute)
      if (data.id == 'RefundAccountUpdateSuccess') {
        if (isFromBottomSheet) {
          window.KloudEvent.closeBottomSheet()
        } else {
          kloudNav.back()
        }
      }
    }
  })

  return (
    <div className="flex flex-col bg-white">
      {/* 입력 필드 영역 */}
      <div className="flex flex-col px-4 space-y-2 pt-[24px] pb-[24px]">
        <InputComponent
          isRequired={false}
          labelResource={'refund_account_bank'}
          placeholderResource={'input_refund_account_bank'}
          value={refundAccountBank}
          onValueChangeAction={(value: string) => setRefundAccountBank(value)}
        />
        <InputComponent
          isRequired={false}
          labelResource={'refund_account_number'}
          placeholderResource={'input_refund_account_number'}
          value={refundAccountNumber}
          onValueChangeAction={(value: string) => setRefundAccountNumber(value)}
        />
        <InputComponent
          isRequired={false}
          labelResource={'refund_account_depositor'}
          placeholderResource={'input_refund_account_depositor'}
          value={refundAccountDepositor}
          onValueChangeAction={(value: string) => setRefundAccountDepositor(value)}
        />

        {/* 버튼 영역 (자연스럽게 아래쪽에 위치) */}
        <div className="mt-[100px]">
          <CommonSubmitButton originProps={{onClick: handleClickSubmit}}>
            <TranslatableText titleResource={'confirm'}/>
          </CommonSubmitButton>
        </div>
      </div>
    </div>
  )
}