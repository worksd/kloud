'use client';

import React from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';

type AdminKioskPaymentSuccessProps = {
  title: string;
  thumbnailUrl?: string;
  amount: number;
  locale: Locale;
  onHome: () => void;
};

// admin(상담실) 결제 완료 화면 — 무인 키오스크 성공 오버레이와 별개.
// 직원이 결제한 실금액을 그대로 보여준다.
export const AdminKioskPaymentSuccess = ({title, thumbnailUrl, amount, locale, onHome}: AdminKioskPaymentSuccessProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});

  return (
    <div className="fixed inset-0 z-30 bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-[56px]">
        <div className="w-[96px] h-[96px] rounded-full bg-[#3CC0AF] flex items-center justify-center mb-[28px]">
          <svg viewBox="0 0 24 24" fill="none" style={{width: 44, height: 44}}>
            <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p className="text-black text-[38px] font-bold tracking-[-1px] text-center">
          {t('kiosk_admin_payment_done')}
        </p>

        <div className="w-full max-w-[560px] mt-[36px] bg-gray-50 rounded-[20px] px-[28px] py-[24px] flex items-center gap-[18px]">
          <div className="w-[72px] h-[72px] rounded-[14px] overflow-hidden bg-gray-200 shrink-0">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={kioskImageSrc(thumbnailUrl, 256)} alt="" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[28px]">🕺</div>
            )}
          </div>
          <span className="flex-1 min-w-0 text-black text-[22px] font-bold leading-snug line-clamp-2">{title || '-'}</span>
          <span className="shrink-0 flex items-baseline gap-[6px]">
            <span className="text-black text-[30px] font-bold">{amount.toLocaleString('ko-KR')}</span>
            <span className="text-[#86898C] text-[18px]">{t('won')}</span>
          </span>
        </div>
      </div>

      <div className="shrink-0 px-[56px] pb-[40px] flex flex-col gap-[12px]">
        {/* 전자영수증 발급 — 액션은 추후 연동 */}
        <button
          onClick={() => { /* TODO: 전자영수증 발급 연동 */ }}
          className="w-full rounded-[16px] border-2 border-[#1E2124] bg-white flex items-center justify-center active:scale-[0.98] transition-transform"
          style={{height: 76}}
        >
          <span className="text-[#1E2124] text-[24px] font-bold">{t('kiosk_admin_issue_receipt')}</span>
        </button>
        <button
          onClick={onHome}
          className="w-full rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.98] transition-transform"
          style={{height: 76}}
        >
          <span className="text-white text-[24px] font-bold">{t('kiosk_to_home')}</span>
        </button>
      </div>
    </div>
  );
};
