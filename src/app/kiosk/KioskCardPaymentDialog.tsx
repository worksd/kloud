'use client';

import React from 'react';

type Props = {
  onCancel: () => void;
};

export const KioskCardPaymentDialog = ({ onCancel }: Props) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-start justify-center px-[5%] pt-[min(20vh,200px)]">
      <div className="bg-white rounded-[28px] w-full max-w-[720px] p-[min(3.7vw,40px)] flex flex-col">
        <p className="text-[#1E2124] font-bold leading-tight" style={{ fontSize: 'min(3vw, 32px)' }}>
          카드를 넣고 잠시만 기다려주세요
        </p>

        <div className="flex items-center justify-center my-[min(3vw,32px)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/ic_kiosk_card_payment.svg"
            alt=""
            className="w-full h-auto block"
            style={{ maxWidth: 'min(45vw, 480px)' }}
          />
        </div>

        <button
          onClick={onCancel}
          className="w-full h-[min(8vw,86px)] rounded-[20px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>취소</span>
        </button>
      </div>
    </div>
  );
};
