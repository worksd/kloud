'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type KioskLessonDetailModalProps = {
  lesson: { id: number; title: string; time: string; thumbnailUrl: string; price: number };
  locale: Locale;
  onClose: () => void;
  onPayment: () => void;
};

export const KioskLessonDetailModal = ({ lesson, locale, onClose, onPayment }: KioskLessonDetailModalProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[92.6%] max-w-[1000px] bg-white rounded-[42px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* 수업 이미지 */}
        <div className="px-[min(4vw,44px)] pt-[min(4.4vw,48px)] pb-[min(2.9vw,32px)]">
          <div className="w-[60%] mx-auto aspect-[640/853] rounded-[32px] overflow-hidden bg-[#E8E8EA]">
            {lesson.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lesson.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#E8E8EA]" />
            )}
          </div>
        </div>

        {/* 수업 정보 */}
        <div className="px-[min(5.6vw,60px)] pb-[min(1.8vw,20px)]">
          <p className="text-black text-[min(3.7vw,40px)] font-bold">{lesson.title}</p>
          <div className="flex items-center gap-[min(0.4vw,4px)] mt-1">
            <span className="text-[#6D7882] text-[min(2.6vw,28px)]">{lesson.time}</span>
            <span className="text-[#6D7882] text-[min(2.6vw,28px)]">·</span>
            <span className="text-[#6D7882] text-[min(2.6vw,28px)]">{fmt(lesson.price)}{t('won')}</span>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-[min(2.6vw,28px)] px-[min(4vw,44px)] pt-[min(2.9vw,32px)] pb-[min(4.4vw,48px)]">
          <button
            onClick={onClose}
            className="flex-[280] h-[min(13.9vw,150px)] rounded-[32px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] text-[min(4.2vw,45px)] font-bold">{t('kiosk_back')}</span>
          </button>
          <button
            onClick={onPayment}
            className="flex-[604] h-[min(13.9vw,150px)] rounded-[32px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-white text-[min(4.2vw,45px)] font-bold">{t('kiosk_payment_title')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
