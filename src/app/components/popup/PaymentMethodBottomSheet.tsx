'use client'

import { TranslatableText } from "@/utils/TranslatableText";
import React from "react";
import { CommonBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { Locale } from "@/shared/StringResource";
import { PaymentMethodSheetForm } from "@/app/profile/setting/paymentMethod/sheet/PaymentMethodSheetForm";

export const PaymentMethodAddButton = ({locale, onSuccessAction}: { locale: Locale, onSuccessAction: () => void }) => {

  const [open, setOpen] = React.useState(false);

  const handleAddPaymentMethod = () => {
    setOpen(true)
  }

  return (
    <div>
      <button
        onClick={handleAddPaymentMethod}
        className="mt-2 w-full block px-4 py-2 rounded-xl border border-dashed border-gray-400 text-gray-600 text-sm hover:bg-gray-100 transition"
      >
        <TranslatableText titleResource="add_payment_method_button"/>
      </button>
      {open && (
        <PaymentMethodAddBottomSheet open={open} locale={locale} onCloseAction={() => setOpen(false)} onSuccessAction={onSuccessAction}/>
      )}
    </div>
  )
}

export const PaymentMethodAddBottomSheet = ({open, locale, onCloseAction, onSuccessAction}: {
  open: boolean,
  locale: Locale,
  onCloseAction: () => void,
  onSuccessAction: () => void,
}) => {
  return (
    <div className="fixed inset-0 z-[1000]">

      <CommonBottomSheet open={open} onCloseAction={onCloseAction}>
        <PaymentMethodSheetForm locale={locale} onCloseAction={onCloseAction} onSuccessAction={onSuccessAction}/>
      </CommonBottomSheet>
    </div>
  )
}