'use client'

import React from "react";

// 스튜디오 주소 카드 — 탭하면 openUrl(현재는 인스타)로 이동. openUrl 없으면 동작 안 함.
export const StudioAddressCard = ({ address, appVersion, openUrl }: { address: string; appVersion: string; openUrl?: string }) => {
  const openLink = () => {
    if (!openUrl) return;
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(openUrl);
    } else {
      window.open(openUrl, '_blank');
    }
  };

  return (
    <button
      type="button"
      onClick={openLink}
      className="flex flex-1 items-center gap-0.5 min-w-0 text-left active:opacity-60 transition-opacity"
    >
      <span className="min-w-0 truncate text-[#171717] text-[12px] font-medium">{address}</span>
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
        <path d="M9 6l6 6-6 6" stroke="#B0B8BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};
