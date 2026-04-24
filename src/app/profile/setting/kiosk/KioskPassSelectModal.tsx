'use client';

import React, { useEffect, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { MyPassResponse } from "@/app/endpoint/user.endpoint";
import { kioskGetMyPassesAction } from "@/app/profile/setting/kiosk/kiosk.actions";

type KioskPassSelectModalProps = {
  locale: Locale;
  onBack: () => void;
  onSelectPass: (pass: MyPassResponse) => void;
};

export const KioskPassSelectModal = ({ locale, onBack, onSelectPass }: KioskPassSelectModalProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [passes, setPasses] = useState<MyPassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<MyPassResponse | null>(null);

  useEffect(() => {
    kioskGetMyPassesAction()
      .then(res => setPasses(res.passes))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[92.6%] max-w-[1000px] bg-white rounded-[42px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* 타이틀 — Figma: fs52 bold, p60/60/60/20 */}
        <div style={{ padding: 'min(5.6vw,60px) min(5.6vw,60px) min(1.8vw,20px)' }}>
          <p className="text-black font-bold leading-tight" style={{ fontSize: 'min(4.8vw, 52px)' }}>
            {t('kiosk_select_pass')}
          </p>
        </div>

        {/* 패스 목록 — Figma: p40/20, gap 24, 각 카드 920x140 r32 bg #f9f9fb */}
        <div className="overflow-y-auto" style={{ padding: 'min(1.8vw,20px) min(3.7vw,40px)', maxHeight: '50vh' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin" />
            </div>
          ) : passes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#6D7882]" style={{ fontSize: 'min(3.3vw, 36px)' }}>
                {t('kiosk_no_pass')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 'min(2.2vw, 24px)' }}>
              {passes.map((pass) => {
                const isSelected = selectedPass?.id === pass.id;
                return (
                  <button
                    key={pass.id}
                    onClick={() => setSelectedPass(isSelected ? null : pass)}
                    className={`flex items-center rounded-[32px] transition-all text-left ${
                      isSelected
                        ? 'bg-[#1E2124] ring-2 ring-[#1E2124]'
                        : 'bg-[#F9F9FB]'
                    }`}
                    style={{ padding: 'min(3.7vw,40px)', gap: 'min(2.2vw,24px)' }}
                  >
                    {/* 패스 이미지 */}
                    <div className="w-[min(5.6vw,60px)] h-[min(5.6vw,60px)] rounded-[12px] bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {pass.passPlan?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pass.passPlan.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path d="M4 5H18C18.8 5 19.5 5.7 19.5 6.5V9.2C18.4 9.5 17.5 10.4 17.5 11.5C17.5 12.6 18.4 13.5 19.5 13.8V15.5C19.5 16.3 18.8 17 18 17H4C3.2 17 2.5 16.3 2.5 15.5V13.8C3.6 13.5 4.5 12.6 4.5 11.5C4.5 10.4 3.6 9.5 2.5 9.2V6.5C2.5 5.7 3.2 5 4 5Z" stroke={isSelected ? '#fff' : '#B1B8BE'} strokeWidth="1.5"/>
                        </svg>
                      )}
                    </div>
                    {/* 패스 정보 */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`font-bold truncate ${isSelected ? 'text-white' : 'text-[#1E2124]'}`} style={{ fontSize: 'min(3vw, 32px)' }}>
                        {pass.passPlan?.name ?? '패스권'}
                      </span>
                      <span className={isSelected ? 'text-white/60' : 'text-[#6D7882]'} style={{ fontSize: 'min(2.2vw, 24px)' }}>
                        {pass.startDate} ~ {pass.endDate}
                      </span>
                    </div>
                    {/* 선택 인디케이터 */}
                    <div className={`w-[min(2.6vw,28px)] h-[min(2.6vw,28px)] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-white bg-white' : 'border-[#CDD1D5]'
                    }`}>
                      {isSelected && (
                        <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#1E2124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 버튼 — Figma: 이전 280, 확인 604, gap 28, p44/32/44/48 */}
        <div className="flex" style={{ gap: 'min(2.6vw,28px)', padding: 'min(2.9vw,32px) min(4vw,44px) min(4.4vw,48px)' }}>
          <button
            onClick={onBack}
            className="flex-[280] rounded-[32px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
            style={{ height: 'min(13.9vw,150px)' }}
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(4.2vw, 45px)' }}>{t('kiosk_back')}</span>
          </button>
          <button
            onClick={() => selectedPass && onSelectPass(selectedPass)}
            disabled={!selectedPass}
            className={`flex-[604] rounded-[32px] flex items-center justify-center active:scale-[0.97] transition-all ${
              selectedPass ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'
            }`}
            style={{ height: 'min(13.9vw,150px)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(4.2vw, 45px)' }}>{t('confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
