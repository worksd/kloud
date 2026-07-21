'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type Props = {
  method?: 'card' | 'applepay' | 'kakaopay' | 'zeropay';
  locale: Locale;
  onCancel: () => void;
  /** 'admin'(상담실 태블릿)이면 다이얼로그 축소 */
  variant?: 'kiosk' | 'admin';
};

export const KioskCardPaymentDialog = ({ method = 'card', locale, onCancel, variant = 'kiosk' }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const admin = variant === 'admin';
  // 카카오페이/제로페이는 QR 스캔 안내
  const isQr = method === 'kakaopay' || method === 'zeropay';
  const titleKey = isQr ? 'kiosk_qr_payment_waiting' : method === 'applepay' ? 'kiosk_applepay_waiting' : 'kiosk_card_payment_waiting';
  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center px-[5%]">
      <div
        className={`bg-white rounded-[28px] w-full px-[min(3.7vw,40px)] py-[min(6vw,64px)] flex flex-col ${admin ? 'max-w-[640px]' : 'max-w-[1080px]'}`}
        style={admin ? { zoom: 0.8 } : undefined}
      >
        <p className="text-[#1E2124] font-bold leading-tight text-center" style={{ fontSize: 'min(4.4vw, 48px)' }}>
          {t(titleKey)}
        </p>

        <div className="flex items-center justify-center my-[min(3vw,32px)]">
          <div style={{ width: '100%', maxWidth: 'min(90vw, 980px)' }}>
            <DotLottieReact
              src={method === 'applepay' ? '/assets/applepay_motion.lottie' : '/assets/card_motion.lottie'}
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
          <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>{t('kiosk_cancel')}</span>
        </button>
      </div>
    </div>
  );
};
