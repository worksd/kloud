'use client';
// 내 정규반 상세(모바일) 상단 줄 — 뒤로가기 + ⋮(수업 일정 변경 메뉴).
// 네이티브 앱바를 띄우지 않는 ignoreSafeArea 화면이라(kloudNav applyTitle) 상태바 아래 줄을 직접 그린다.
// 맨 위에선 투명(그래디언트·반 이미지가 비침), 스크롤하면 흰 배경 — 내용이 상태바·버튼 밑으로 비치지 않게.
// overImage 면 맨 위에서 아이콘을 흰색으로 + 위쪽 어두운 그라데이션(상태바 글자·아이콘 가독성).

import React, { useEffect, useState } from "react";
import ArrowLeftIcon from "../../../../../public/assets/ic_simple_left_arrow.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { RescheduleMenuButton } from "@/app/profile/myRegularClass/[id]/RegularClassReschedule";

// env(safe-area-inset-top)이 0으로 오는 웹뷰가 있어 최소 44px 보장 (ADMIN_SAFE_TOP·RECAP_SAFE_TOP 과 같은 규칙)
const SAFE_TOP = 'max(env(safe-area-inset-top, 0px), 44px)';
/** 상태바 아래 버튼 줄 높이 — 본문 spacer 도 이 값을 쓴다 */
export const TOP_BAR_HEIGHT = 52;
export const TOP_BAR_SPACE = `calc(${SAFE_TOP} + ${TOP_BAR_HEIGHT}px)`;

export const RegularClassTopBar = ({ overImage = false }: { overImage?: boolean }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const light = overImage && !scrolled;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-30 transition-colors ${scrolled ? 'bg-white' : 'bg-transparent'}`}
      style={{ paddingTop: SAFE_TOP }}
    >
      {light && <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 to-transparent pointer-events-none"/>}
      <div className="flex items-center justify-between px-3" style={{ height: TOP_BAR_HEIGHT }}>
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
