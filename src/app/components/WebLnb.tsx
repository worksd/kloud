'use client';

// PC 웹 좌측 내비게이션(LNB) — 유튜브 방식 이원 구조.
// - 브라우즈 루트(홈/내 스튜디오/연습실 대관/프로필): 고정 레일. 햄버거로 펼침(240)↔숏(72, 아이콘만) 토글.
// - 그 외(상세 등): 레일 없음. 햄버거를 누르면 왼쪽에서 드로어가 슬라이드로 등장(오버레이 딤).
// 푸터(회사 정보)는 펼친 레일/드로어의 왼쪽 아래에 위치한다 (유튜브 가이드 하단 링크와 동일한 자리).

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COMPANY_INFO, LEGAL_LINKS } from '@/shared/company';

export type LnbLabels = { home: string; myStudio: string; rooms: string; profile: string };

// 아이콘 — 아웃라인/필 쌍. 활성 메뉴는 유튜브처럼 채워진 아이콘으로.
type IconProps = { className?: string; filled?: boolean };

const HomeIcon = ({className, filled}: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {filled ? (
      <path
        d="M11.03 3.62a1.6 1.6 0 0 1 1.94 0l6.9 5.3c.4.3.63.77.63 1.27v8.21A1.6 1.6 0 0 1 18.9 20h-3.62a.6.6 0 0 1-.6-.6v-3.65a2.68 2.68 0 0 0-5.36 0v3.65a.6.6 0 0 1-.6.6H5.1a1.6 1.6 0 0 1-1.6-1.6v-8.21c0-.5.23-.97.63-1.27l6.9-5.3Z"
        fill="currentColor"
      />
    ) : (
      <>
        <path d="M4.3 10.36a1 1 0 0 1 .39-.79l6.7-5.15a1 1 0 0 1 1.22 0l6.7 5.15a1 1 0 0 1 .39.79v8.04a1 1 0 0 1-1 1h-3.62v-3.65a3.08 3.08 0 0 0-6.16 0v3.65H5.3a1 1 0 0 1-1-1v-8.04Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

const StudioIcon = ({className, filled}: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {filled ? (
      <>
        <path d="M4.06 8.06 5.3 4.83A1.3 1.3 0 0 1 6.5 4h11a1.3 1.3 0 0 1 1.2.83l1.24 3.23a.7.7 0 0 1-.65.94H4.71a.7.7 0 0 1-.65-.94Z" fill="currentColor"/>
        <path d="M5 11h14v7.4A1.6 1.6 0 0 1 17.4 20H6.6A1.6 1.6 0 0 1 5 18.4V11Zm4.9 9v-3.8a2.1 2.1 0 0 1 4.2 0V20h-4.2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
      </>
    ) : (
      <>
        <path d="M4.7 8.3 5.9 5a1.5 1.5 0 0 1 1.4-1h9.4a1.5 1.5 0 0 1 1.4 1l1.2 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 8.4h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M5.6 11v7a2 2 0 0 0 2 2h8.8a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M9.8 20v-3.7a2.2 2.2 0 0 1 4.4 0V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </>
    )}
  </svg>
);

const RoomIcon = ({className, filled}: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {filled ? (
      <>
        <path d="M14.8 4.6H18a1.7 1.7 0 0 1 1.7 1.7v11.4A1.7 1.7 0 0 1 18 19.4h-3.2V4.6Z" fill="currentColor" opacity="0.45"/>
        <path d="M13.9 2.9a1 1 0 0 1 1.2 1v16.3a1 1 0 0 1-1.2 1l-7.6-1.9a1.5 1.5 0 0 1-1.1-1.4V6.1a1.5 1.5 0 0 1 1.1-1.4l7.6-1.8Z" fill="currentColor"/>
        <circle cx="12.1" cy="12" r="1" fill="white"/>
      </>
    ) : (
      <>
        <path d="M15.1 4.6H18a1.7 1.7 0 0 1 1.7 1.7v11.4A1.7 1.7 0 0 1 18 19.4h-2.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M14.3 21 6.4 19.1a1.5 1.5 0 0 1-1.1-1.4V6.3a1.5 1.5 0 0 1 1.1-1.4L14.3 3v18Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <circle cx="11.6" cy="12" r="1" fill="currentColor"/>
      </>
    )}
  </svg>
);

const ProfileIcon = ({className, filled}: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {filled ? (
      <>
        <circle cx="12" cy="8.1" r="3.9" fill="currentColor"/>
        <path d="M4.4 19.2c.9-3.5 4-5.4 7.6-5.4s6.7 1.9 7.6 5.4c.2.7-.4 1.3-1.1 1.3H5.5c-.7 0-1.3-.6-1.1-1.3Z" fill="currentColor"/>
      </>
    ) : (
      <>
        <circle cx="12" cy="8.1" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4.9 19.8c.9-3.3 3.7-5.2 7.1-5.2s6.2 1.9 7.1 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </>
    )}
  </svg>
);

const useMenus = (labels: LnbLabels, isLogin: boolean) => {
  const pathname = usePathname() ?? '/';
  return [
    { key: 'home', label: labels.home, href: '/lessons', Icon: HomeIcon, active: pathname === '/lessons' || pathname === '/' },
    // 내 스튜디오·프로필은 로그인 사용자에게만
    ...(isLogin ? [
      { key: 'myStudio', label: labels.myStudio, href: '/home', Icon: StudioIcon, active: pathname.startsWith('/home') },
    ] : []),
    { key: 'rooms', label: labels.rooms, href: '/studioRooms', Icon: RoomIcon, active: pathname.startsWith('/studioRooms') },
    ...(isLogin ? [
      { key: 'profile', label: labels.profile, href: '/profile', Icon: ProfileIcon, active: pathname.startsWith('/profile') },
    ] : []),
  ];
};

// 아이콘 크로스페이드 — 아웃라인↔필이 '샤르륵' 전환
const AnimatedIcon = ({Icon, filled}: { Icon: React.ComponentType<IconProps>; filled: boolean }) => (
  <span className="relative w-6 h-6 shrink-0">
    <Icon className={`absolute inset-0 w-6 h-6 transition-all duration-200 ease-out ${filled ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}/>
    <Icon filled className={`absolute inset-0 w-6 h-6 transition-all duration-200 ease-out ${filled ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}/>
  </span>
);

// 펼침 상태 메뉴 리스트 (레일·드로어 공용) — 활성 필(pill)은 별도 레이어로 두고 translateY로 슬라이드
const EXPANDED_ROW_STEP = 50; // h-11(44) + gap-1.5(6)

const ExpandedMenus = ({labels, isLogin, onNavigate}: { labels: LnbLabels; isLogin: boolean; onNavigate?: () => void }) => {
  const menus = useMenus(labels, isLogin);
  const activeIdx = menus.findIndex((m) => m.active);
  return (
    <div className="relative flex flex-col gap-1.5 px-3">
      {/* 슬라이딩 필 — 활성 메뉴 위치로 부드럽게 이동 */}
      {activeIdx >= 0 && (
        <div
          aria-hidden
          className="absolute top-0 left-3 right-3 h-11 rounded-xl bg-[#f1f3f6] transition-transform duration-300 ease-out"
          style={{ transform: `translateY(${activeIdx * EXPANDED_ROW_STEP}px)` }}
        />
      )}
      {menus.map(({key, label, href, Icon, active}) => (
        <Link
          key={key}
          href={href}
          onClick={onNavigate}
          className={`relative z-10 flex items-center gap-5 h-11 px-3.5 rounded-xl text-[14px] text-black transition-colors ${
            active ? 'font-semibold' : 'hover:bg-[#f7f8f9]'
          }`}
        >
          <AnimatedIcon Icon={Icon} filled={active}/>
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </div>
  );
};

// LNB 하단 푸터 — 회사 정보 법적 표기 컴팩트판 (WebFooter와 같은 값, src/shared/company.ts 단일 출처)
const LnbFooter = () => (
  <div className="px-6 pt-5 pb-6 flex flex-col gap-2.5">
    <div className="flex items-center gap-1.5 text-[12px]">
      <a href={LEGAL_LINKS.privacy} target="_blank" rel="noopener noreferrer"
         className="font-bold text-[#4E5968] hover:text-black transition-colors">개인정보 처리방침</a>
      <span className="text-[#D1D5DB]">·</span>
      <a href={LEGAL_LINKS.terms} target="_blank" rel="noopener noreferrer"
         className="font-medium text-[#6D7882] hover:text-black transition-colors">이용약관</a>
    </div>
    <div className="flex flex-col gap-0.5 text-[11px] leading-relaxed text-[#8A949E]">
      <span className="font-medium text-[#6D7882]">{COMPANY_INFO.name}</span>
      <span>대표자명 : {COMPANY_INFO.representative}</span>
      <span>사업자번호 : {COMPANY_INFO.businessRegistrationNumber}</span>
      <span>통신판매업신고 : {COMPANY_INFO.eCommerceRegNumber}</span>
      <span>고객센터 : {COMPANY_INFO.customerServicePhone}</span>
      <span>{COMPANY_INFO.address}</span>
    </div>
    <span className="text-[11px] text-[#B0B8BF]">
      © {new Date().getFullYear()} {COMPANY_INFO.copyrightName} All rights reserved.
    </span>
  </div>
);

/** 브라우즈 루트용 고정 레일 — open: 아이콘+라벨+하단 푸터 / mini: 아이콘만 */
export const WebLnbRail = ({open, labels, isLogin}: { open: boolean; labels: LnbLabels; isLogin: boolean }) => {
  const menus = useMenus(labels, isLogin);
  return (
    <nav
      aria-label="LNB"
      className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white z-40 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ${
        open ? 'w-60' : 'w-[72px]'
      } pt-3`}
    >
      {open ? (
        <>
          <ExpandedMenus labels={labels} isLogin={isLogin}/>
          <div className="mt-auto">
            <div className="mx-6 h-px bg-[#f0f1f3]"/>
            <LnbFooter/>
          </div>
        </>
      ) : (
        <div className="relative flex flex-col gap-2 px-2.5">
          {/* 슬라이딩 필 — 숏 레일도 동일하게. 타일 높이 52(py-3.5 + 아이콘 24) + gap 8 = step 60 */}
          {menus.findIndex((m) => m.active) >= 0 && (
            <div
              aria-hidden
              className="absolute top-0 left-2.5 right-2.5 h-[52px] rounded-xl bg-[#f1f3f6] transition-transform duration-300 ease-out"
              style={{ transform: `translateY(${menus.findIndex((m) => m.active) * 60}px)` }}
            />
          )}
          {menus.map(({key, label, href, Icon, active}) => (
            <Link
              key={key}
              href={href}
              title={label}
              className={`relative z-10 flex items-center justify-center py-3.5 rounded-xl text-black transition-colors ${
                active ? '' : 'hover:bg-[#f7f8f9]'
              }`}
            >
              <AnimatedIcon Icon={Icon} filled={active}/>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

/** 상세 페이지용 드로어 — 왼쪽에서 슬라이드 인/아웃, 오버레이 딤 (유튜브 watch 페이지 방식) */
export const WebLnbDrawer = ({open, labels, isLogin, onCloseAction}: {
  open: boolean;
  labels: LnbLabels;
  isLogin: boolean;
  onCloseAction: () => void;
}) => (
  <div className={`hidden lg:block ${open ? '' : 'pointer-events-none'}`}>
    {/* 오버레이 */}
    <div
      onClick={onCloseAction}
      className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden
    />
    {/* 패널 */}
    <aside
      aria-label="LNB drawer"
      className={`fixed left-0 top-0 bottom-0 z-[80] w-60 bg-white flex flex-col transition-transform duration-200 ease-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* 드로어 헤더 — 햄버거(닫기) + 로고 */}
      <div className="h-16 shrink-0 px-4 flex items-center gap-4">
        <button
          onClick={onCloseAction}
          aria-label="메뉴 닫기"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f5f6f8] transition-colors shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="#1a1a1a" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        </button>
        <Link href="/" onClick={onCloseAction} aria-label="rawgraphy" className="shrink-0 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo_black.svg" alt="rawgraphy" style={{ height: 14, width: 'auto', display: 'block' }}/>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pt-1 flex flex-col">
        <ExpandedMenus labels={labels} isLogin={isLogin} onNavigate={onCloseAction}/>
        <div className="mt-auto">
          <div className="mx-6 h-px bg-[#f0f1f3]"/>
          <LnbFooter/>
        </div>
      </div>
    </aside>
  </div>
);
