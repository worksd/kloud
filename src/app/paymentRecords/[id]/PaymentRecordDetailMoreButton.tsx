'use client';

import { useState } from 'react';
import { CommonBottomSheet } from '@/app/onboarding/GenderBottomSheet';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { KloudScreen } from '@/shared/kloud.screen';
import MoreIcon from '@/../public/assets/ic_more.svg'

export function PaymentRecordDetailMoreButton({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-6 h-6"
      >
        <MoreIcon/>
      </button>

      <CommonBottomSheet open={open} onCloseAction={() => setOpen(false)}>
        <div className="bg-white rounded-t-[12px] pb-[34px]">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Cancel button */}
          <NavigateClickWrapper
            method="push"
            route={KloudScreen.PaymentRecordRefund(paymentId)}
          >
            <div
              className="flex items-center justify-center h-12 px-5 active:bg-gray-100 transition-colors"
              onClick={() => setOpen(false)}
            >
              <span className="text-[14px] font-medium text-black">취소하기</span>
            </div>
          </NavigateClickWrapper>
        </div>
      </CommonBottomSheet>
    </>
  );
}



