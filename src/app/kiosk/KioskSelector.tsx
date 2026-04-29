'use client';

import React from 'react';
import { KioskResponse } from '@/app/endpoint/kiosk.endpoint';

type Props = {
  kiosks: KioskResponse[];
  onSelect: (kiosk: KioskResponse) => void;
};

export const KioskSelector = ({ kiosks, onSelect }: Props) => {
  return (
    <div className="bg-white w-full h-screen flex flex-col items-center px-[5%] py-[40px]">
      <p className="text-black font-bold text-center" style={{ fontSize: 'min(3vh,32px)' }}>
        사용할 키오스크를 선택해주세요
      </p>
      <p className="text-[#86898C] mt-[8px] text-center" style={{ fontSize: 'min(1.6vh,18px)' }}>
        활성 상태인 키오스크만 사용할 수 있어요
      </p>

      <div className="mt-[28px] w-full max-w-[680px] flex flex-col gap-[12px] overflow-y-auto">
        {kiosks.map((k) => {
          const disabled = k.status !== 'Active';
          return (
            <button
              key={k.id}
              disabled={disabled}
              onClick={() => onSelect(k)}
              className={`w-full rounded-[20px] p-[20px] flex items-center gap-[16px] text-left active:scale-[0.99] transition-transform ${
                disabled ? 'bg-[#F2F4F6] opacity-60 cursor-not-allowed' : 'bg-[#F9F9FB] cursor-pointer'
              }`}
            >
              <div className="w-[64px] h-[64px] rounded-[16px] bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                {k.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={k.imageUrl} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#B1B8BE" strokeWidth="1.5"/>
                    <path d="M9 17H15" stroke="#B1B8BE" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-black font-bold truncate" style={{ fontSize: 'min(2vh,22px)' }}>{k.name}</span>
                <span className={`mt-[4px] ${k.status === 'Active' ? 'text-[#3181F5]' : 'text-[#86898C]'}`} style={{ fontSize: 'min(1.4vh,16px)' }}>
                  {k.status === 'Active' ? '사용 가능' : '비활성'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
