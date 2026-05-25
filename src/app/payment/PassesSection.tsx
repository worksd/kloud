'use client'

import React from 'react';
import { GetPassResponse } from '@/app/endpoint/pass.endpoint';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';

/**
 * 보유 패스권을 결제수단처럼 노출하는 별도 섹션.
 * 결제수단/할인과 같은 레벨로 표시. 선택 시 부모가 selectedMethod='pass'와 함께 처리.
 *
 * payment.methods에 'pass' 타입이 없으면(=BE가 패스 결제 비활성) 부모에서 렌더 안 함.
 */
export const PassesSection = ({
  locale,
  passes,
  selectedPass,
  onSelectPass,
}: {
  locale: Locale;
  passes: GetPassResponse[];
  selectedPass?: GetPassResponse;
  onSelectPass: (pass: GetPassResponse | undefined) => void;
}) => {
  if (passes.length === 0) return null;

  return (
    <div className="flex flex-col gap-y-2 px-6">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'pass' })}
      </div>

      <div className="rounded-2xl border border-[#EEEFF0] overflow-hidden">
        {passes.map((pass, idx) => {
          const isSelected = selectedPass?.id === pass.id;
          const isUsable = pass.usable;
          return (
            <div
              key={pass.id}
              onClick={isUsable ? () => onSelectPass(isSelected ? undefined : pass) : undefined}
              className={[
                'flex items-center gap-3 px-5 py-[15px] transition-all duration-150 select-none',
                idx > 0 ? 'border-t border-[#F0F0F0]' : '',
                !isUsable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                isSelected ? 'bg-[#F0F1F3]' : 'bg-white hover:bg-[#FBFBFC]',
              ].filter(Boolean).join(' ')}
            >
              {/* 패스권 아이콘 */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 5H18C18.8 5 19.5 5.7 19.5 6.5V9.2C18.4 9.5 17.5 10.4 17.5 11.5C17.5 12.6 18.4 13.5 19.5 13.8V15.5C19.5 16.3 18.8 17 18 17H4C3.2 17 2.5 16.3 2.5 15.5V13.8C3.6 13.5 4.5 12.6 4.5 11.5C4.5 10.4 3.6 9.5 2.5 9.2V6.5C2.5 5.7 3.2 5 4 5Z"
                      stroke={isSelected ? '#111' : '#BDBDBD'} strokeWidth="1.4"/>
              </svg>

              <div className="flex-grow flex flex-col min-w-0">
                <span className={`text-[14px] truncate ${isSelected ? 'text-black font-bold' : 'text-[#888] font-medium'}`}>
                  {pass.passPlan?.name ?? getLocaleString({ locale, key: 'pass' })}
                </span>
                {!isUsable && pass.reason && (
                  <span className="text-[11px] text-[#B0B8C1] mt-0.5 truncate">{pass.reason}</span>
                )}
              </div>

              {/* 체크 마크 */}
              <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all
                ${isSelected ? 'border-black bg-black' : 'border-[#D4D4D4]'}`}>
                {isSelected && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
