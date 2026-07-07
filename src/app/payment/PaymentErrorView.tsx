'use client';

import React from 'react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';

// 에러 응답에 함께 내려오는 충돌 수업 (예: BUNDLE_DUPLICATE_REGISTRATION의 개별구매 수업)
export type PaymentErrorLesson = {
  id: number;
  title: string;
  date?: string;
  startDate?: string;
  thumbnailUrl?: string;
};

// 결제 진입 시 도메인 에러(예: BUNDLE_DUPLICATE_REGISTRATION)를 보기 좋게 노출.
// notFound 대신 사용. 웹은 history.back, 네이티브는 KloudEvent.back으로 뒤로가기.
export function PaymentErrorView({ title, message, backLabel, lessons = [] }: {
  title: string;
  message: string;
  backLabel: string;
  lessons?: PaymentErrorLesson[];
}) {
  const goBack = () => {
    const evt = (window as unknown as { KloudEvent?: { back?: () => void } }).KloudEvent;
    if (typeof evt?.back === 'function') evt.back();
    else window.history.back();
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-[76px] h-[76px] rounded-full bg-[#F2F4F6] flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9">
          <circle cx="12" cy="12" r="9" stroke="#8A949E" strokeWidth="1.8" />
          <path d="M12 7.5V13" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16.3" r="1.15" fill="#8A949E" />
        </svg>
      </div>

      <h1 className="text-[19px] font-bold text-black mb-2">{title}</h1>
      <p className="text-[15px] text-[#6D7882] leading-relaxed whitespace-pre-line max-w-[340px]">
        {message}
      </p>

      {/* 충돌 수업 목록 — 어떤 수업이 문제인지 안내 */}
      {lessons.length > 0 && (
        <div className="mt-7 w-full max-w-[380px] flex flex-col gap-2">
          {lessons.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => kloudNav.push(KloudScreen.LessonDetail(l.id))}
              className="flex items-center gap-3 p-3 bg-[#F7F8F9] rounded-2xl text-left w-full active:scale-[0.98] transition-transform"
            >
              <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-[#E8E8EA] shrink-0">
                {l.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[14px] font-bold text-black truncate">{l.title}</span>
                {(l.date || l.startDate) && (
                  <span className="text-[12px] text-[#86898C] truncate mt-0.5">{l.date ?? l.startDate}</span>
                )}
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#B0B8BF]">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={goBack}
        className="mt-9 h-13 px-12 py-4 rounded-2xl bg-black text-white font-bold text-[15px] active:scale-[0.98] transition-transform"
      >
        {backLabel}
      </button>
    </div>
  );
}
