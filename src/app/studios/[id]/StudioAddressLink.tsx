'use client'

import React from "react";

// 커버 하단 주소 description — 탭하면 네이버 지도(주소 검색)로 이동.
// 좌표가 없어 주소 텍스트로 검색: 앱은 openExternalBrowser, 웹은 새 탭.
export const StudioAddressLink = ({ address, appVersion }: { address: string; appVersion: string }) => {
  const openMap = () => {
    const url = `https://map.naver.com/p/search/${encodeURIComponent(address)}`;
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <button
      type="button"
      onClick={openMap}
      className="mt-1 block max-w-full text-left text-[12px] font-medium text-[#4E5968] leading-snug line-clamp-1 active:opacity-60 transition-opacity"
    >
      {address}
    </button>
  );
};
