'use client';

// 웹 접근 (앱 웹뷰 외부) 시 layout 레벨에서 글로벌하게 띄우는 top bar.
// - appVersion search param 으로 웹/앱 판별 (앱 웹뷰는 ?appVersion=1.2.3 형태로 들어옴)
// - 데스크탑(lg+): 좌측 rawgraphy 로고 + 중앙 nav 메뉴 + 우측 검색/프로필/로그인
// - 모바일 웹(narrow): 기존 MobileWebViewTopBar (스토어 다운로드 + 로그인)
//
// 클라이언트에서 mount 후 분기 — 앱 웹뷰에서는 아무것도 렌더하지 않음.

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KloudScreen } from '@/shared/kloud.screen';
import { accessTokenKey, localeKey } from '@/shared/cookies.key';
import { clearCookies } from '@/app/profile/clear.token.action';
import { unregisterDeviceAction } from '@/app/home/action/unregister.device.action';
import { getStoreLink } from '@/app/components/MobileWebViewTopBar';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { getUserAction } from '@/app/onboarding/action/get.user.action';

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: '수업', href: '/lessons' },
  { label: '패스권', href: '/passPlans' },
  { label: '연습실', href: '/studioRooms' },
  { label: '행사', href: '/events' },
];

const detectOS = (): string => {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  return '';
};

const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined;
};

const isLocale = (v: string | undefined): v is Locale =>
  v === 'ko' || v === 'en' || v === 'jp' || v === 'zh';

type Profile = { nickName?: string; name?: string; profileImageUrl?: string };

export const WebTopNav = () => {
  const [mounted, setMounted] = useState(false);
  const [isApp, setIsApp] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [os, setOs] = useState('');
  const [locale, setLocale] = useState<Locale>('ko');
  const [profile, setProfile] = useState<Profile | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appVersion = params.get('appVersion') ?? '';
    const loggedIn = !!readCookie(accessTokenKey);
    setIsApp(appVersion !== '');
    setIsLogin(loggedIn);
    setOs(detectOS());
    const cookieLocale = readCookie(localeKey);
    if (isLocale(cookieLocale)) setLocale(cookieLocale);
    setMounted(true);

    // 로그인 상태면 현재 유저 프로필 가져옴 (top bar 표시용)
    if (loggedIn) {
      (async () => {
        try {
          const u = await getUserAction();
          if (u && 'id' in u) setProfile({ nickName: u.nickName, name: u.name, profileImageUrl: u.profileImageUrl });
        } catch { /* noop */ }
      })();
    }
  }, []);

  if (!mounted || isApp) return null;

  const returnUrl = pathname ?? '/';
  const loginQuery = `?returnUrl=${encodeURIComponent(returnUrl)}`;

  const handleLogin = () => router.push(KloudScreen.Login(loginQuery));
  const handleLogout = async () => {
    await unregisterDeviceAction();
    await clearCookies();
    router.replace(KloudScreen.Login(loginQuery));
  };
  const handleSearch = () => router.push('/search');

  const displayName = profile?.nickName || profile?.name;

  return (
    <>
      {/* PC — 로고 + 메뉴 + 검색/프로필/로그인 */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#f0f1f3] z-50">
        <div className="mx-auto h-full w-full max-w-6xl px-8 flex items-center gap-10">
          <Link href="/lessons" aria-label="rawgraphy" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo_black.svg" alt="rawgraphy" style={{ height: 14, width: 'auto', display: 'block' }}/>
          </Link>
          <nav className="flex items-center gap-7">
            {NAV_ITEMS.map(item => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'text-[15px] font-medium transition-colors',
                    active ? 'text-black' : 'text-[#86898C] hover:text-black',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* 검색 아이콘 — /search 로 이동 */}
            <button
              onClick={handleSearch}
              aria-label="검색"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f5f6f8] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#1a1a1a" strokeWidth="1.8"/>
                <path d="M20 20L16.5 16.5" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>

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
      </header>

      {/* 모바일 웹 — 기존 다운로드 + 로그인 바 */}
      <MobileWebChrome
        os={os}
        isLogin={isLogin}
        returnUrl={returnUrl}
        onLogin={handleLogin}
        onLogout={handleLogout}
        locale={locale}
      />
    </>
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

const MobileWebChrome = ({os, isLogin, returnUrl, onLogin, onLogout, locale}: {
  os: string;
  isLogin: boolean;
  returnUrl: string;
  onLogin: () => void;
  onLogout: () => void;
  locale: Locale;
}) => {
  const [store, setStore] = useState<{ url: string; label: string } | null>(null);
  useEffect(() => {
    setStore(getStoreLink({os}));
  }, [os]);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex justify-between items-center px-4 z-50">
      {store ? (
        <a href={store.url} target="_blank" rel="noopener noreferrer">
          <button className="flex items-center gap-2 text-[12px] bg-black hover:bg-gray-800 text-white font-semibold px-5 py-3 rounded-2xl shadow-md transition-all duration-300">
            <span>{store.label}에서 다운로드</span>
          </button>
        </a>
      ) : <span/>}
      {returnUrl && (
        <button
          onClick={isLogin ? onLogout : onLogin}
          className="flex items-center gap-2 text-[12px] bg-white hover:bg-gray-100 text-black font-semibold px-5 py-3 rounded-2xl shadow-md transition-all duration-300 border border-gray-200"
        >
          <span>{getLocaleString({locale, key: isLogin ? 'log_out' : 'login'})}</span>
        </button>
      )}
    </div>
  );
};
