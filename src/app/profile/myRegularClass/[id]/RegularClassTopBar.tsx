'use client';
// 내 정규반 상세(모바일) 상단 줄 — 뒤로가기 + ⋮(수업 일정 변경 메뉴).
// 네이티브 앱바를 띄우지 않는 ignoreSafeArea 화면이라(kloudNav applyTitle) 상태바 아래 줄을 직접 그린다.
// 맨 위에선 투명(그래디언트·반 이미지가 비침), 일정 높이 넘게 스크롤하면 흰 배경 — 내용이 상태바·버튼 밑으로 비치지 않게.
// 흰 배경이 생기는 지점: 이미지가 있으면 히어로(가로 4:3) 아래 끝이 버튼 줄 밑으로 들어갈 때, 없으면 헤더를 어느 정도 지난 뒤.
// overImage 면 맨 위에서 아이콘을 흰색으로 + 위쪽 어두운 그라데이션(상태바 글자·아이콘 가독성).
// Collapsing — 헤더의 반 이름 줄(COLLAPSE_TITLE_ID)이 버튼 줄 밑으로 들어가는 만큼 가운데에 학원 로고 + 반 이름이 나타나 고정된다.

import React, { useEffect, useState } from "react";
import ArrowLeftIcon from "../../../../../public/assets/ic_simple_left_arrow.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { RescheduleMenuButton } from "@/app/profile/myRegularClass/[id]/RegularClassReschedule";
import { COLLAPSE_TITLE_ID } from "@/app/profile/myRegularClass/[id]/collapse.title.id";

// env(safe-area-inset-top)이 0으로 오는 웹뷰가 있어 최소 44px 보장 (ADMIN_SAFE_TOP 과 같은 규칙)
const SAFE_TOP = 'max(env(safe-area-inset-top, 0px), 44px)';
/** 상태바 아래 버튼 줄 높이 — 본문 spacer 도 이 값을 쓴다 */
export const TOP_BAR_HEIGHT = 52;
export const TOP_BAR_SPACE = `calc(${SAFE_TOP} + ${TOP_BAR_HEIGHT}px)`;
/** 이미지 없는 화면에서 흰 배경이 생기는 스크롤 높이(px) */
const NO_IMAGE_THRESHOLD = 120;
/** 히어로 이미지 비율(폼의 aspect-[4/3]과 같아야 한다) */
const HERO_RATIO = 3 / 4;

export const RegularClassTopBar = ({ overImage = false, title, logoUrl }: {
  overImage?: boolean;
  /** 접혔을 때 가운데에 고정되는 반 이름·학원 로고 */
  title?: string;
  logoUrl?: string | null;
}) => {
  const [scrolled, setScrolled] = useState(false);
  // 0~1 — 반 이름 줄이 버튼 줄 밑으로 들어간 정도
  const [collapse, setCollapse] = useState(0);
  useEffect(() => {
    // 상태바 실제 높이 — 히어로 아래 끝이 버튼 줄(상태바 + TOP_BAR_HEIGHT) 밑으로 들어가는 시점을 잡기 위해
    const safeTop = () => {
      const probe = document.createElement('div');
      probe.style.cssText = `position:fixed;top:0;height:${SAFE_TOP};visibility:hidden;pointer-events:none`;
      document.body.appendChild(probe);
      const h = probe.getBoundingClientRect().height;
      probe.remove();
      return h;
    };
    const threshold = () => overImage
      ? Math.max(window.innerWidth * HERO_RATIO - safeTop() - TOP_BAR_HEIGHT, NO_IMAGE_THRESHOLD)
      : NO_IMAGE_THRESHOLD;
    let limit = threshold();
    let barBottom = safeTop() + TOP_BAR_HEIGHT;
    const onScroll = () => {
      setScrolled(window.scrollY > limit);
      const el = document.getElementById(COLLAPSE_TITLE_ID);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const next = Math.min(1, Math.max(0, (barBottom - r.top) / Math.max(r.height, 1)));
      setCollapse((prev) => (Math.abs(prev - next) < 0.02 ? prev : next));
    };
    const onResize = () => { limit = threshold(); barBottom = safeTop() + TOP_BAR_HEIGHT; onScroll(); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [overImage]);

  const light = overImage && !scrolled && collapse === 0;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-30 transition-colors ${scrolled || collapse > 0 ? 'bg-white' : 'bg-transparent'}`}
      style={{ paddingTop: SAFE_TOP, boxShadow: collapse >= 1 ? '0 1px 0 #F2F4F6' : 'none' }}
    >
      {light && <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 to-transparent pointer-events-none"/>}
      <div className="relative flex items-center justify-between px-3" style={{ height: TOP_BAR_HEIGHT }}>
        {/* 접힌 헤더 — 가운데 학원 로고 + 반 이름. 버튼 자리(양쪽 52px)는 비워 둔다 */}
        {title && (
          <div
            className="absolute inset-y-0 left-[52px] right-[52px] flex items-center justify-center gap-2 pointer-events-none"
            style={{ opacity: collapse, transform: `translateY(${(1 - collapse) * 8}px)` }}
            aria-hidden={collapse < 0.5}
          >
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0"/>
            )}
            <span className="text-[16px] font-bold text-black truncate tracking-[-0.3px]">{title}</span>
          </div>
        )}
        <NavigateClickWrapper method="back">
          <button type="button" aria-label="back" className="w-10 h-10 flex items-center justify-center">
            {/* svg 가 fill=#000 고정이라 흰색은 CSS fill 로 덮는다 */}
            <ArrowLeftIcon className={`w-5 h-5 transition-colors ${light ? 'fill-white drop-shadow' : 'fill-black'}`}/>
          </button>
        </NavigateClickWrapper>
        <div className="w-10 h-10 flex items-center justify-center">
          <RescheduleMenuButton light={light}/>
        </div>
      </div>
    </div>
  );
};
