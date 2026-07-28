'use client'

import React from "react";
import InstagramIcon from "@/../public/assets/instagram-colored.svg";

// 인스타 주소/핸들에서 @아이디만 추출.
// 'https://instagram.com/rawgraphy/?hl=ko' · 'instagram.com/rawgraphy' · '@rawgraphy' · 'rawgraphy' 모두 허용.
const toHandle = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withoutQuery = trimmed.split(/[?#]/)[0];
  const afterHost = withoutQuery.replace(/^https?:\/\//i, '').replace(/^(www\.)?instagram\.com\//i, '');
  const id = afterHost.replace(/^@/, '').replace(/\/+$/, '').split('/')[0];
  return id ? `@${id}` : null;
};

// 커버 하단 인스타 — 아이콘 + @아이디(slug 행과 동일 규격). 탭 시 프로필 열기.
export const StudioInstaLink = ({ url, appVersion }: { url: string; appVersion: string }) => {
  const handle = toHandle(url);
  const openInsta = () => {
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <button
      type="button"
      onClick={openInsta}
      className="flex items-center gap-1.5 min-w-0 max-w-full active:opacity-60 transition-opacity"
    >
      <span className="w-5 h-5 shrink-0 flex items-center justify-center">
        <InstagramIcon />
      </span>
      {handle && (
        // slug 행과 동일 규격(paperlogy 13px) + 인스타 브랜드 그라디언트 텍스트.
        // bg-clip-text/text-transparent 조합이라 배경 그라디언트가 글자 안쪽에만 보인다.
        <span
          className="font-paperlogy text-[13px] leading-[1.4] truncate bg-clip-text text-transparent
            bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
        >
          {handle}
        </span>
      )}
    </button>
  );
};
