import React from 'react';

// 신청 화면 공통 안내 — 마감·정원·오류·없는 링크 등 폼 대신 띄우는 한 장짜리 화면.
export const Notice = ({emoji, title, message, children}: {
  emoji: string;
  title: string;
  message?: string;
  children?: React.ReactNode;
}) => (
  <div className="min-h-screen bg-white">
    <div className="mx-auto w-full max-w-md flex flex-col items-center gap-3 pt-24 pb-10 px-6 text-center">
      <span className="text-[44px]">{emoji}</span>
      <h1 className="text-[20px] font-bold text-black">{title}</h1>
      {message && <p className="text-[14px] text-[#6B7280] whitespace-pre-line">{message}</p>}
      {children}
    </div>
  </div>
);
