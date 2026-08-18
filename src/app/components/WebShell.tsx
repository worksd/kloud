'use client';

// PC 웹 공통 크롬 셸 — 유튜브 방식 LNB 이원 구조의 상태 소유자.
// - 브라우즈 루트(LNB 메뉴 목적지): 고정 레일 + 레일 폭만큼 밀리는 컨텐츠. 햄버거는 펼침↔숏 토글.
// - 그 외(상세 등): 레일 없음(컨텐츠 풀폭). 햄버거는 왼쪽 슬라이드 드로어 열기.
// 푸터는 컨텐츠 하단이 아니라 LNB(펼친 레일/드로어) 왼쪽 아래에 산다.
// 레이아웃(서버)에서 showWebChrome일 때만 렌더 — 앱 웹뷰/키오스크는 이 셸을 타지 않는다.

import React, { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WebTopNav } from '@/app/components/WebTopNav';
import { WebLnbRail, WebLnbDrawer, LnbLabels } from '@/app/components/WebLnb';
import { NoOverscrollOnPc } from '@/app/components/NoOverscrollOnPc';
import { WebFooter } from '@/app/components/WebFooter';
import { accessTokenKey } from '@/shared/cookies.key';
import { getMyStudiosAction } from '@/app/components/get.my.studios.action';
import { LnbStudio } from '@/app/components/WebLnb';

const LNB_OPEN_KEY = 'kloud_lnb_open';

const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined;
};

// 고정 레일을 보여주는 브라우즈 루트 — LNB 메뉴의 최상위 목적지들
const BROWSE_ROOTS = new Set(['/', '/myStudio', '/studioRooms', '/profile', '/search']);

export const WebShell = ({initialLogin, lnbLabels, myStudioId, children}: {
  initialLogin: boolean;
  lnbLabels: LnbLabels;
  /** 스튜디오 쿠키(서버) — LNB '내 스튜디오' 링크(/myStudios/:id)용 */
  myStudioId?: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname() ?? '/';
  // /myStudios/:id는 LNB '내 스튜디오' 메뉴의 목적지 — 브라우즈 루트로 취급
  const isBrowse = BROWSE_ROOTS.has(pathname);

  const [railOpen, setRailOpen] = useState(true);     // 브라우즈: 펼침 vs 숏
  const [drawerOpen, setDrawerOpen] = useState(false); // 상세: 슬라이드 드로어
  // 로그인 여부 — SSR은 layout(쿠키) 판단, 이후엔 경로 전환마다 쿠키 재확인 (WebTopNav와 동일 규칙).
  // 미로그인이면 LNB의 내 스튜디오·프로필 메뉴를 숨긴다.
  const [isLogin, setIsLogin] = useState(initialLogin);
  // LNB '내 스튜디오' 하위 스튜디오 목록 — 로그인 상태에서 1회 조회 (셸이 라우팅에도 살아있어 캐시 유지)
  const [myStudios, setMyStudios] = useState<LnbStudio[]>([]);

  useEffect(() => {
    setIsLogin(!!readCookie(accessTokenKey));
  }, [pathname]);

  useEffect(() => {
    if (!isLogin) {
      setMyStudios([]);
      return;
    }
    let alive = true;
    getMyStudiosAction().then((studios) => { if (alive) setMyStudios(studios); });
    return () => { alive = false; };
  }, [isLogin]);

  // 저장된 레일 펼침 상태 복원 (기본 펼침)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LNB_OPEN_KEY);
      if (saved != null) setRailOpen(saved === '1');
    } catch { /* noop */ }
  }, []);

  // 라우트가 바뀌면 드로어는 닫고, 잔여 스크롤 없이 맨 위에서 시작
  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const toggleLnb = () => {
    if (isBrowse) {
      setRailOpen((v) => {
        try { localStorage.setItem(LNB_OPEN_KEY, v ? '0' : '1'); } catch { /* noop */ }
        return !v;
      });
    } else {
      setDrawerOpen((v) => !v);
    }
  };

  // 키오스크는 자체 전체화면 UI — 크롬 없이 컨텐츠만 (SPA로 진입하는 예외 대비)
  if (pathname.startsWith('/kiosk')) {
    return <div className="lg:min-h-screen">{children}</div>;
  }

  return (
    <>
      {/* PC(lg)에선 문서 위아래 오버스크롤 바운스 제거 — 전 페이지 공통. 모바일 웹 제스처는 유지 */}
      <NoOverscrollOnPc/>
      {/* WebTopNav는 useSearchParams(?login=true) 사용 — 정적 프리렌더 대비 Suspense 경계 필요 */}
      <Suspense fallback={null}>
        <WebTopNav initialLogin={initialLogin} onToggleLnb={toggleLnb}/>
      </Suspense>

      {/* 브라우즈 루트: 고정 레일 / 상세: 슬라이드 드로어.
          LNB는 useSearchParams(?id= 하이라이트) 사용 — 정적 프리렌더 대비 Suspense 경계 필요 */}
      <Suspense fallback={null}>
        {isBrowse
          ? <WebLnbRail open={railOpen} labels={lnbLabels} isLogin={isLogin} myStudios={myStudios}/>
          : <WebLnbDrawer open={drawerOpen} labels={lnbLabels} isLogin={isLogin} myStudios={myStudios} onCloseAction={() => setDrawerOpen(false)}/>}
      </Suspense>

      {/* 컨텐츠 — 브라우즈 루트에서만 레일 폭만큼 좌측 패딩. lg 미만/상세는 풀폭 */}
      <div className={`transition-[padding-left] duration-200 ${isBrowse ? (railOpen ? 'lg:pl-60' : 'lg:pl-[72px]') : ''}`}>
        {/* 컨텐츠 영역이 lg에서 항상 최소 100vh — 페이지 전환 중 레이아웃이 무너지지 않게 (기존 규칙 유지) */}
        <div className="lg:min-h-screen">
          {children}
        </div>
        {/* 상세 페이지(레일 없음)엔 컨텐츠 하단 공통 푸터 — 브라우즈 루트는 LNB의 LnbFooter가 담당 */}
        {!isBrowse && <WebFooter/>}
      </div>
    </>
  );
};
