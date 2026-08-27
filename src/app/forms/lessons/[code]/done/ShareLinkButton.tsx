'use client';

import React, { useState } from 'react';

// 신청 폼 링크 공유 — /done 을 뗀 현재 주소가 곧 폼 링크다.
export const ShareLinkButton = ({label, copiedLabel}: { label: string; copiedLabel: string }) => {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname.replace(/\/done\/?$/, '')}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // 사용자가 공유 시트를 닫은 것 — 복사로 폴백하지 않는다
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" onClick={share}
            className="w-full py-4 rounded-xl bg-black text-white text-[16px] font-bold active:bg-[#333] transition-colors">
      {copied ? copiedLabel : label}
    </button>
  );
};
