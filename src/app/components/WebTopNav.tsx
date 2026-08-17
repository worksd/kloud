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

type Profile = { nickName?: string; name?: string; profileImageUrl?: string };

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
    // 로그인/로케일 최신화 (SPA 전환 중 쿠키가 바뀐 경우 대비) + 프로필 조회
    const loggedIn = !!readCookie(accessTokenKey);
    setIsLogin(loggedIn);
    const cookieLocale = readCookie(localeKey);
    if (isLocale(cookieLocale)) setLocale(cookieLocale);
    if (loggedIn) {
      getWebTopNavProfileAction().then(setProfile).catch(() => {});
    }
  }, []);

  // 키오스크는 자체 전체화면 UI — 상단바 대상 아님
  if (pathname?.startsWith('/kiosk')) return null;

  const returnUrl = pathname ?? '/';
  const loginQuery = `?returnUrl=${encodeURIComponent(returnUrl)}`;

  // PC(lg)에선 페이지 이동 없이 다이얼로그로 로그인 — 보던 페이지 컨텍스트 유지.
  // 상단바 자체가 lg 미만에선 숨겨지지만, 혹시 모를 좁은 뷰포트 호출은 로그인 페이지로 폴백.
  const handleLogin = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setLoginDialogOpen(true);
    } else {
      router.push(KloudScreen.Login(loginQuery));
    }
  };

  const handleLogout = async () => {
    await unregisterDeviceAction();
    await clearCookies();
    router.replace(KloudScreen.Login(loginQuery));
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-[#f5f6f8] transition-colors"
      >
        {profile?.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover"/>
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#dcdee0]"/>
        )}
        {displayName && (
          <span className="text-[13px] font-medium text-black max-w-[120px] truncate">
            {displayName}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] min-w-[160px] bg-white rounded-xl border border-[#f0f1f3] shadow-lg py-1.5 z-50"
        >
          <Link
            href={KloudScreen.ProfileSetting}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-[13px] text-black hover:bg-[#f7f8f9] transition-colors"
          >
            {getLocaleString({locale, key: 'setting'})}
          </Link>
          <div className="my-1 h-px bg-[#f0f1f3]"/>
          <button
            role="menuitem"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-black hover:bg-[#f7f8f9] transition-colors"
          >
            {getLocaleString({locale, key: 'log_out'})}
          </button>
        </div>
      )}
    </div>
  );
};
