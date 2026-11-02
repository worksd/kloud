'use client';
// 모바일 마이페이지 — 화면 전체가 한 번에 스크롤되고, 큰 프로필(사진·닉네임·이름)이 위로 접히면
// 상단 아이콘 줄(sticky)에 작은 프로필이 나타나 고정되는 Collapsing 헤더.
// 진행도 p = 스크롤 / 큰 프로필 높이(0~1). 큰 프로필은 왼쪽 기준으로 작아지며 흐려지고, 작은 프로필은 아래에서 올라오며 나타난다.

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export const ProfileCollapsingLayout = ({ nickName, name, imageUrl, actions, profile, children }: {
  nickName: string;
  name?: string | null;
  imageUrl?: string | null;
  /** 상단 줄 오른쪽 아이콘들(편집·설정) */
  actions: React.ReactNode;
  /** 접히는 큰 프로필 블록 */
  profile: React.ReactNode;
  children: React.ReactNode;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const h = profileRef.current?.offsetHeight || 1;
      const next = Math.min(1, Math.max(0, el.scrollTop / h));
      setP((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    el.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // 작은 프로필은 큰 프로필이 반 넘게 접힌 뒤부터 나타난다
  const compact = Math.min(1, Math.max(0, (p - 0.5) / 0.5));

  return (
    <div ref={scrollRef} className="h-screen w-full max-w-screen overflow-y-auto overflow-x-hidden bg-white">
      {/* 고정 상단 줄 — 왼쪽 작은 프로필(접힌 상태), 오른쪽 아이콘. 다 접히면 아래 구분선 */}
      <div
        className="sticky top-0 z-20 bg-white flex items-center gap-3 px-5 h-[48px] transition-shadow"
        style={{ boxShadow: p >= 1 ? '0 1px 0 #F2F4F6' : 'none' }}
      >
        <div
          className="flex-1 min-w-0 flex items-center gap-2"
          style={{ opacity: compact, transform: `translateY(${(1 - compact) * 8}px)`, pointerEvents: compact > 0.5 ? 'auto' : 'none' }}
          aria-hidden={compact < 0.5}
        >
          {imageUrl && (
            <Image src={imageUrl} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0"/>
          )}
          <span className="text-[15px] font-bold text-black truncate">
            {nickName}
            {name && <span className="text-[13px] font-normal text-[#999]"> ({name})</span>}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      </div>

      {/* 큰 프로필 — 스크롤하면 왼쪽 기준으로 작아지며 흐려진다 */}
      <div ref={profileRef}>
        <div style={{ opacity: 1 - p, transform: `scale(${1 - p * 0.15})`, transformOrigin: 'left center' }}>
          {profile}
        </div>
      </div>

      {children}
    </div>
  );
};
