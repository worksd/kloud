'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type Props = {
  onCancel: () => void;
};

export const KioskCardPaymentDialog = ({ onCancel }: Props) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center px-[5%]">
      <div className="bg-white rounded-[28px] w-full max-w-[1080px] px-[min(3.7vw,40px)] py-[min(6vw,64px)] flex flex-col">
        <p className="text-[#1E2124] font-bold leading-tight text-center" style={{ fontSize: 'min(4.4vw, 48px)' }}>
          카드를 넣고 잠시만 기다려주세요
        </p>

        <div className="flex items-center justify-center my-[min(3vw,32px)]">
          <div style={{ width: '100%', maxWidth: 'min(90vw, 980px)' }}>
            <DotLottieReact
              src="/assets/card_motion.lottie"
              loop
              autoplay
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-full h-[min(8vw,86px)] mt-[min(8vw,80px)] rounded-[20px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>취소</span>
        </button>
      </div>
    </div>
  );
};
