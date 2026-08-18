'use client';

// PC 웹(≥lg, 앱 웹뷰 아님) 전 페이지 공통 상단바 — 로고 + 로그인/프로필.
// shelf 'Add PC-specific components'의 WebTopNav에서 상단바만 이식한 축소판:
//  - 좌측 사이드바(수업/패스권/연습실/행사)는 목록 페이지들이 아직 없어 제외
//  - 검색 input은 /search가 빈 스텁이라 제외
//  - fixed + 페이지별 padding 대신 sticky(문서 흐름 안)라 어떤 페이지도 겹침 없이 밀려 내려간다
// 웹/앱 판단은 layout(서버, x-guinness-version 헤더)이 한다 — 여기서 mounted 게이트로 하면
// SSR HTML에 없다가 hydration 후 나타나며 컨텐츠를 밀어내는 깜빡임이 생긴다(풀 리로드마다 재발).
// /kiosk 경로 가드만 클라이언트에 남긴다(SPA로 키오스크에 진입하는 예외 대비).

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KloudScreen } from '@/shared/kloud.screen';
import { accessTokenKey, localeKey } from '@/shared/cookies.key';
import { clearCookies } from '@/app/profile/clear.token.action';
import { unregisterDeviceAction } from '@/app/home/action/unregister.device.action';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { getWebTopNavProfileAction } from '@/app/components/web.top.nav.action';
import { WebLoginDialog } from '@/app/components/WebLoginDialog';

const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined;
};

const isLocale = (v: string | undefined): v is Locale =>
  v === 'ko' || v === 'en' || v === 'jp' || v === 'zh';

type Profile = { nickName?: string; name?: string; profileImageUrl?: string; email?: string };

export const WebTopNav = ({ initialLogin = false }: {
  /** 서버(layout)가 쿠키로 판단한 로그인 여부 — SSR부터 올바른 버튼(로그인/프로필)을 그린다 */
  initialLogin?: boolean;
}) => {
  const [isLogin, setIsLogin] = useState(initialLogin);
  const [locale, setLocale] = useState<Locale>('ko');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 로그인/로케일 최신화 + 프로필 조회 — 마운트 시 1회가 아니라 경로가 바뀔 때마다.
    // 상단바는 루트 레이아웃에 살아서 소프트 내비게이션에도 리마운트되지 않으므로,
    // 로그인/로그아웃 후 router.replace로 복귀하는 플로우(카카오 콜백 등)에서 쿠키를 다시 읽어야 갱신된다.
    const loggedIn = !!readCookie(accessTokenKey);
    setIsLogin(loggedIn);
    const cookieLocale = readCookie(localeKey);
    if (isLocale(cookieLocale)) setLocale(cookieLocale);
    if (loggedIn) {
      getWebTopNavProfileAction().then(setProfile).catch(() => {});
    } else {
      setProfile(null);
    }
  }, [pathname]);

  // 키오스크는 자체 전체화면 UI — 상단바 대상 아님
  if (pathname?.startsWith('/kiosk')) return null;

  const returnUrl = pathname ?? '/';
  const loginQuery = `?returnUrl=${encodeURIComponent(returnUrl)}`;

  // PC(lg)에선 페이지 이동 없이 다이얼로그로 로그인 — 보던 페이지 컨텍스트 유지.
  // 상단바 자체가 lg 미만에선 숨겨지지만, 혹시 모를 좁은 뷰포트 호출은 로그인 페이지로 폴백.
  // 웹에선 /login('시작하기' 한 단계)을 거치지 않고 바로 로그인 수단 선택(/login/intro)으로.
  const handleLogin = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setLoginDialogOpen(true);
    } else {
      router.push(KloudScreen.LoginIntro(loginQuery));
    }
  };

  const handleLogout = async () => {
    await unregisterDeviceAction();
    await clearCookies();
    router.replace(KloudScreen.LoginIntro(loginQuery));
  };

  const displayName = profile?.nickName || profile?.name;

  return (
    // sticky — 문서 흐름 안에 있어 페이지 컨텐츠를 자연스럽게 아래로 밀고, 스크롤해도 상단 고정
    <header className="hidden lg:flex sticky top-0 h-16 bg-white border-b border-[#f0f1f3] z-50 items-center">
      <div className="w-full h-full px-6 flex items-center gap-6">
        {/* 로고 — 아직 랜딩 목적지가 정해지지 않아 클릭 이동 없음. 정해지면 아래 Link로 복원.
        <Link href="/" aria-label="rawgraphy" className="shrink-0">
          <img src="/assets/logo_black.svg" alt="rawgraphy" style={{ height: 14, width: 'auto', display: 'block' }}/>
        </Link>
        */}
        <div aria-label="rawgraphy" className="shrink-0 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo_black.svg" alt="rawgraphy" style={{ height: 14, width: 'auto', display: 'block' }}/>
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          {isLogin ? (
            <ProfileDropdown
              profile={profile}
              displayName={displayName}
              onLogout={handleLogout}
              locale={locale}
            />
          ) : (
            <button
              onClick={handleLogin}
              className="text-[13px] font-semibold text-black px-4 py-2 rounded-full border border-[#dcdee0] hover:border-black transition-colors"
            >
              {getLocaleString({locale, key: 'login'})}
            </button>
          )}
        </div>
      </div>

      {/* PC 전용 로그인 다이얼로그 — 성공 시 returnUrl(현재 페이지)로 복귀 */}
      <WebLoginDialog
        open={loginDialogOpen}
        onCloseAction={() => setLoginDialogOpen(false)}
        returnUrl={returnUrl}
        locale={locale}
      />
    </header>
  );
};

// tving 웹 스타일 프로필 드롭다운 — 트리거는 아바타만, 패널은
// [프로필 헤더(아바타+이름 → 프로필 화면)] + 바로가기 메뉴 + 로그아웃. 테마는 화이트.
const ProfileDropdown = ({profile, displayName, onLogout, locale}: {
  profile: Profile | null;
  displayName?: string;
  onLogout: () => void;
  locale: Locale;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const menuItemCls = "block px-5 py-2.5 text-[13px] text-[#505356] hover:text-black hover:bg-[#f7f8f9] transition-colors";

  return (
    <div ref={ref} className="relative">
      {/* 트리거: 아바타만 */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="profile menu"
        className={`block rounded-full transition-shadow ${open ? 'ring-2 ring-black' : 'hover:ring-2 hover:ring-[#dcdee0]'}`}
      >
        {profile?.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover"/>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#dcdee0]"/>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] w-[264px] bg-white rounded-2xl border border-[#f0f1f3] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.16)] py-2 z-50"
        >
          {/* 프로필 헤더 — 클릭 시 프로필 화면으로 (설정은 프로필 페이지 사이드바에서 진입) */}
          <Link
            href={KloudScreen.Profile}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f7f8f9] transition-colors"
          >
            {profile?.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0"/>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#dcdee0] shrink-0"/>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-bold text-black truncate">
                {displayName ?? getLocaleString({locale, key: 'profile'})}
              </span>
              {profile?.email && (
                <span className="text-[12px] text-[#8A949E] truncate">{profile.email}</span>
              )}
            </div>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
              <path d="M9 6l6 6-6 6" stroke="#C4C9CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <div className="my-1.5 h-px bg-[#f0f1f3]"/>

          {/* 바로가기 — 프로필 화면의 해당 탭으로 (별도 페이지 라우팅 없음) */}
          <Link href={`${KloudScreen.Profile}?tab=tickets`} role="menuitem" onClick={() => setOpen(false)} className={menuItemCls}>
            {getLocaleString({locale, key: 'my_tickets'})}
          </Link>
          <Link href={`${KloudScreen.Profile}?tab=pass`} role="menuitem" onClick={() => setOpen(false)} className={menuItemCls}>
            {getLocaleString({locale, key: 'my_pass'})}
          </Link>
          <Link href={`${KloudScreen.Profile}?tab=payments`} role="menuitem" onClick={() => setOpen(false)} className={menuItemCls}>
            {getLocaleString({locale, key: 'payment_records'})}
          </Link>

          <div className="my-1.5 h-px bg-[#f0f1f3]"/>

          <button
            role="menuitem"
            onClick={() => { setOpen(false); onLogout(); }}
            className={`w-full text-left ${menuItemCls}`}
          >
            {getLocaleString({locale, key: 'log_out'})}
          </button>
        </div>
      )}
    </div>
  );
};
