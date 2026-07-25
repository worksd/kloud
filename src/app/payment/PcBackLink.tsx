'use client';

import React from "react";

// PC 결제 페이지 상단 '뒤로' 링크 — 앱 헤더가 없는 웹에서 이탈 경로 확보용.
export function PcBackLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#86898C] hover:text-black transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  );
}
