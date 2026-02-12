'use client'

import React from "react";
import { CommonBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { Locale } from "@/shared/StringResource";
import { PaymentMethodSheetForm } from "@/app/profile/setting/paymentMethod/sheet/PaymentMethodSheetForm";
import { getLocaleString } from "@/app/components/locale";

export const PaymentMethodAddButton = ({locale, onSuccessAction}: { locale: Locale, onSuccessAction: () => void }) => {

  const [open, setOpen] = React.useState(false);

  const handleAddPaymentMethod = () => {
    setOpen(true)
  }

  return (
    <div>
      <button
        onClick={handleAddPaymentMethod}
        className="mt-2 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-dashed border-[#D0D0D0]
                   text-[#888] text-[13px] font-medium active:bg-[#F5F5F5] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {getLocaleString({locale, key: 'add_payment_method_button'})}
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