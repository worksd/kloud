'use client';

import React from 'react';

// 결제 진입 시 도메인 에러(예: BUNDLE_DUPLICATE_REGISTRATION)를 보기 좋게 노출.
// notFound 대신 사용. 웹은 history.back, 네이티브는 KloudEvent.back으로 뒤로가기.
export function PaymentErrorView({ title, message, backLabel }: {
  title: string;
  message: string;
  backLabel: string;
}) {
  const goBack = () => {
    const evt = (window as unknown as { KloudEvent?: { back?: () => void } }).KloudEvent;
    if (typeof evt?.back === 'function') evt.back();
    else window.history.back();
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-[76px] h-[76px] rounded-full bg-[#F2F4F6] flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9">
          <circle cx="12" cy="12" r="9" stroke="#8A949E" strokeWidth="1.8" />
          <path d="M12 7.5V13" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16.3" r="1.15" fill="#8A949E" />
        </svg>
      </div>

      <h1 className="text-[19px] font-bold text-black mb-2">{title}</h1>
      <p className="text-[15px] text-[#6D7882] leading-relaxed whitespace-pre-line max-w-[320px]">
        {message}
      </p>

      <button
        onClick={goBack}
        className="mt-9 h-13 px-12 py-4 rounded-2xl bg-black text-white font-bold text-[15px] active:scale-[0.98] transition-transform"
      >
        {backLabel}
      </button>
    </div>
  );
}
