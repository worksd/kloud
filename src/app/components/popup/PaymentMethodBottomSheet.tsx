'use client'

import React from "react";
import { CommonBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { Locale } from "@/shared/StringResource";
import { PaymentMethodSheetForm } from "@/app/profile/setting/paymentMethod/sheet/PaymentMethodSheetForm";
import { getLocaleString } from "@/app/components/locale";

export const PaymentMethodAddButton = ({locale, onSuccessAction, birth}: { locale: Locale, onSuccessAction: () => void, birth?: string | null }) => {

  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="mt-2 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-dashed border-[#D0D0D0]
                   text-[#888] text-[13px] font-medium active:bg-[#F5F5F5] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {getLocaleString({locale, key: 'add_payment_method_button'})}
      </button>
      {open && (
        <PaymentMethodAddBottomSheet
          open={true}
          locale={locale}
          onCloseAction={() => setOpen(false)}
          onSuccessAction={onSuccessAction}
          initialBirth={birth}
        />
      )}
    </div>
  )
}

export const PaymentMethodAddBottomSheet = ({open, locale, onCloseAction, onSuccessAction, initialBirth}: {
  open: boolean,
  locale: Locale,
  onCloseAction: () => void,
  onSuccessAction: () => void,
  initialBirth?: string | null,
}) => {
  return (
    <div className="fixed inset-0 z-[1000]">
      <CommonBottomSheet open={open} onCloseAction={onCloseAction}>
        <PaymentMethodSheetForm locale={locale} onCloseAction={onCloseAction} onSuccessAction={onSuccessAction} initialBirth={initialBirth}/>
      </CommonBottomSheet>
    </div>
  )
}
