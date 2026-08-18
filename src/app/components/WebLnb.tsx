'use client';

// PC 웹 좌측 내비게이션(LNB) — 유튜브 방식 이원 구조.
// - 브라우즈 루트(홈/내 스튜디오/연습실 대관/프로필): 고정 레일. 햄버거로 펼침(240)↔숏(72, 아이콘만) 토글.
// - 그 외(상세 등): 레일 없음. 햄버거를 누르면 왼쪽에서 드로어가 슬라이드로 등장(오버레이 딤).
// 푸터(회사 정보)는 펼친 레일/드로어의 왼쪽 아래에 위치한다 (유튜브 가이드 하단 링크와 동일한 자리).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { COMPANY_INFO, LEGAL_LINKS } from '@/shared/company';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { changeLocale } from '@/utils/translate';
import { LOCALE_MAP } from '@/app/components/LocaleMap';
import { localeKey } from '@/shared/cookies.key';

const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined;
};

const isLocale = (v: string | undefined): v is Locale =>
  v === 'ko' || v === 'en' || v === 'jp' || v === 'zh';

export type LnbLabels = { home: string; myStudio: string; rooms: string; profile: string };

/** LNB '내 스튜디오' 하위에 보여줄 스튜디오 요약 */
export type LnbStudio = { id: number; name: string; profileImageUrl?: string };

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

const useMenus = (labels: LnbLabels, isLogin: boolean, myStudios: LnbStudio[] = []) => {
  const pathname = usePathname() ?? '/';
  // 내 스튜디오 클릭 = 첫 번째 스튜디오 선택. 목록이 아직 안 왔으면 /myStudio(서버가 정함) 폴백.
  const myStudioHref = myStudios.length > 0 ? `/myStudio?id=${myStudios[0].id}` : '/myStudio';
  return [
    { key: 'home', label: labels.home, href: '/', Icon: HomeIcon, active: pathname === '/' },
    // 내 스튜디오·프로필은 로그인 사용자에게만
    ...(isLogin ? [
      { key: 'myStudio', label: labels.myStudio, href: myStudioHref, Icon: StudioIcon, active: pathname.startsWith('/myStudio') },
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
const EXPANDED_ROW_STEP = 50;  // 메뉴 행: h-11(44) + gap-1.5(6)
const STUDIO_ROW_STEP = 42;    // 스튜디오 서브 행: h-9(36) + gap-1.5(6)

const ExpandedMenus = ({labels, isLogin, myStudios = [], onNavigate}: {
  labels: LnbLabels;
  isLogin: boolean;
  myStudios?: LnbStudio[];
  onNavigate?: () => void;
}) => {
  const menus = useMenus(labels, isLogin, myStudios);
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  // /myStudio?id=33 — 지금 보고 있는 스튜디오 하이라이트.
  // id 없이 /myStudio에 있으면 기본으로 첫 번째 스튜디오가 선택된 것으로 표시한다.
  const activeStudioId = pathname === '/myStudio'
    ? (searchParams.get('id') ?? (myStudios[0] ? String(myStudios[0].id) : null))
    : null;
  const activeIdx = menus.findIndex((m) => m.active);
  const myStudioIdx = menus.findIndex((m) => m.key === 'myStudio');
  const showStudios = myStudioIdx >= 0 && myStudios.length > 0;

  // 필 위치 — '내 스튜디오' 아래 스튜디오 서브 행들이 끼면 그 높이만큼 밀어준다
  const pillOffset = (idx: number) =>
    idx * EXPANDED_ROW_STEP + (showStudios && idx > myStudioIdx ? myStudios.length * STUDIO_ROW_STEP : 0);

  return (
    <div className="relative flex flex-col gap-1.5 px-3">
      {/* 슬라이딩 필 — 활성 메뉴 위치로 부드럽게 이동 */}
      {activeIdx >= 0 && (
        <div
          aria-hidden
          className="absolute top-0 left-3 right-3 h-11 rounded-xl bg-[#f1f3f6] transition-transform duration-300 ease-out"
          style={{ transform: `translateY(${pillOffset(activeIdx)}px)` }}
        />
      )}
      {menus.map(({key, label, href, Icon, active}) => (
        <React.Fragment key={key}>
          <Link
            href={href}
            onClick={onNavigate}
            className={`relative z-10 flex items-center gap-5 h-11 px-3.5 rounded-xl text-[14px] text-black transition-colors ${
              active ? 'font-semibold' : 'hover:bg-[#f7f8f9]'
            }`}
          >
            <AnimatedIcon Icon={Icon} filled={active}/>
            <span className="truncate">{label}</span>
          </Link>

          {/* '내 스튜디오' 하위 — 내가 다니는 스튜디오. 세로 가이드 라인 + 작은 로고/텍스트로 메뉴와 구분 */}
          {key === 'myStudio' && showStudios && (
            <div className="relative z-10 ml-[26px] pl-3 border-l-2 border-[#eef0f2] flex flex-col gap-1.5">
              {myStudios.map((studio) => (
                <Link
                  key={`studio-${studio.id}`}
                  href={`/myStudio?id=${studio.id}`}
                  onClick={onNavigate}
                  title={studio.name}
                  className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] transition-colors ${
                    activeStudioId === String(studio.id)
                      ? 'bg-[#f1f3f6] text-black font-semibold'
                      : 'text-[#6D7882] hover:bg-[#f7f8f9] hover:text-black'
                  }`}
                >
                  <span className="w-[22px] h-[22px] rounded-full overflow-hidden bg-[#F1F3F6] shrink-0">
                    {studio.profileImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={studio.profileImageUrl} alt="" className="w-full h-full object-cover"/>
                    )}
                  </span>
                  <span className="truncate">{studio.name}</span>
                </Link>
              ))}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// LNB 하단 푸터 — 회사 정보 법적 표기 컴팩트판 (WebFooter와 같은 값, src/shared/company.ts 단일 출처)
// + 언어 변경 스위처. 라벨은 StringResource — 회사 상호/주소 등 법적 표기 값 자체는 한국어 유지.
const LnbFooter = () => {
  const [locale, setLocale] = useState<Locale>('ko');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookieLocale = readCookie(localeKey);
    if (isLocale(cookieLocale)) setLocale(cookieLocale);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [langOpen]);

  const handleSelectLocale = async (next: Locale) => {
    setLangOpen(false);
    if (next === locale) return;
    await changeLocale(next);
    // 풀 리로드 — 서버 컴포넌트(상단바·페이지 문구)까지 새 언어로
    window.location.reload();
  };

  return (
    <div className="px-6 pt-5 pb-6 flex flex-col gap-2.5">
      {/* 언어 변경 — 위로 열리는 컴팩트 드롭다운 */}
      <div ref={langRef} className="relative">
        {langOpen && (
          <div className="absolute bottom-[calc(100%+6px)] left-0 w-[148px] bg-white rounded-xl border border-[#f0f1f3] shadow-[0_8px_28px_-6px_rgba(0,0,0,0.16)] py-1.5 z-50">
            {(Object.keys(LOCALE_MAP) as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => handleSelectLocale(l)}
                className={`w-full text-left flex items-center gap-2 px-3.5 py-2 text-[12px] transition-colors hover:bg-[#f7f8f9] ${
                  l === locale ? 'font-bold text-black' : 'text-[#505356]'
                }`}
              >
                <span>{LOCALE_MAP[l].emoji}</span>
                <span>{LOCALE_MAP[l].name}</span>
                {l === locale && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 ml-auto">
                    <path d="M5 12l5 5 9-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#6D7882] hover:text-black transition-colors"
        >
          {/* 지구본 아이콘 */}
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
            <ellipse cx="12" cy="12" rx="3.8" ry="8.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 9.5h16M4 14.5h16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>{LOCALE_MAP[locale].name}</span>
          <svg viewBox="0 0 24 24" fill="none" className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`}>
            <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[12px]">
        <a href={LEGAL_LINKS.privacy} target="_blank" rel="noopener noreferrer"
           className="font-bold text-[#4E5968] hover:text-black transition-colors">
          {getLocaleString({locale, key: 'privacy_agreement'})}
        </a>
        <span className="text-[#D1D5DB]">·</span>
        <a href={LEGAL_LINKS.terms} target="_blank" rel="noopener noreferrer"
           className="font-medium text-[#6D7882] hover:text-black transition-colors">
          {getLocaleString({locale, key: 'terms_of_use'})}
        </a>
      </div>
      <div className="flex flex-col gap-0.5 text-[11px] leading-relaxed text-[#8A949E]">
        <span className="font-medium text-[#6D7882]">{COMPANY_INFO.name}</span>
        <span>{getLocaleString({locale, key: 'footer_representative'})} : {COMPANY_INFO.representative}</span>
        <span>{getLocaleString({locale, key: 'footer_business_number'})} : {COMPANY_INFO.businessRegistrationNumber}</span>
        <span>{getLocaleString({locale, key: 'footer_ecommerce_number'})} : {COMPANY_INFO.eCommerceRegNumber}</span>
        <span>{getLocaleString({locale, key: 'footer_customer_center'})} : {COMPANY_INFO.customerServicePhone}</span>
        <span>{COMPANY_INFO.address}</span>
      </div>
      <span className="text-[11px] text-[#B0B8BF]">
        © {new Date().getFullYear()} {COMPANY_INFO.copyrightName} All rights reserved.
      </span>
    </div>
  );
};

/** 브라우즈 루트용 고정 레일 — open: 아이콘+라벨+하단 푸터 / mini: 아이콘만 */
export const WebLnbRail = ({open, labels, isLogin, myStudios}: { open: boolean; labels: LnbLabels; isLogin: boolean; myStudios?: LnbStudio[] }) => {
  const menus = useMenus(labels, isLogin, myStudios);
  // 컨텐츠 교체를 폭 애니메이션(200ms)과 동기화 — 닫힐 땐 애니메이션이 끝난 뒤에 mini로 교체.
  // 펼친 컨텐츠(메뉴 라벨·푸터)는 아래에서 고정 폭(w-60)으로 두므로, 폭이 줄어드는 동안
  // 텍스트가 재줄바꿈되며 푸터가 꿀렁이지 않고 overflow-x-hidden 클리핑으로 매끄럽게 가려진다.
  const [showExpanded, setShowExpanded] = useState(open);
  useEffect(() => {
    if (open) {
      setShowExpanded(true);
      return;
    }
    const t = setTimeout(() => setShowExpanded(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <nav
      aria-label="LNB"
      className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white z-40 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ${
        open ? 'w-60' : 'w-[72px]'
      } pt-3`}
    >
      {showExpanded ? (
        // 고정 폭 w-60 — 레일 폭이 애니메이션되는 동안에도 내부 레이아웃(특히 푸터 줄바꿈)이 변하지 않게
        <div className="w-60 shrink-0 flex-1 flex flex-col">
          <ExpandedMenus labels={labels} isLogin={isLogin} myStudios={myStudios}/>
          <div className="mt-auto">
            <div className="mx-6 h-px bg-[#f0f1f3]"/>
            <LnbFooter/>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col gap-2 px-2.5 w-[72px] shrink-0">
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
export const WebLnbDrawer = ({open, labels, isLogin, myStudios, onCloseAction}: {
  open: boolean;
  labels: LnbLabels;
  isLogin: boolean;
  myStudios?: LnbStudio[];
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
        <ExpandedMenus labels={labels} isLogin={isLogin} myStudios={myStudios} onNavigate={onCloseAction}/>
        <div className="mt-auto">
          <div className="mx-6 h-px bg-[#f0f1f3]"/>
          <LnbFooter/>
        </div>
      </div>
    </aside>
  </div>
);
