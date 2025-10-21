// app/lib/kloudNav.ts
'use client';

import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";

type NavMethod =
  | 'push'
  | 'back'
  | 'clearAndPush'
  | 'closeBottomSheet'
  | 'showBottomSheet'
  | 'navigateMain';

export interface KloudNavOptions {
  /** 기본 true: 네이티브에서 safe area 무시 */
  ignoreSafeArea?: boolean;
  title?: string;
  /** push 시 붙일 returnUrl */
  returnUrl?: string;
  /** navigateMain 에 사용 */
  bootInfo?: unknown;
  /** Next.js useRouter() 결과를 넘기면 SPA 네비게이션 */
  router?: { push: (href: string) => unknown; back: () => unknown };
}

/** 내부 유틸 */
const isMobile = () => typeof window !== 'undefined' && !!(window as any).KloudEvent;

const withReturnUrl = (route: string, returnUrl?: string) =>
  returnUrl ? `${route}?returnUrl=${encodeURIComponent(returnUrl)}` : route;

/** 공용 네비게이션 객체 */
export const kloudNav = {
  async push(route: string, opts: KloudNavOptions = {}) {
    const {returnUrl, router} = opts;
    const finalRoute = withReturnUrl(route, returnUrl);

    if (isMobile()) {
      (window as any).KloudEvent.push(
        JSON.stringify({
          route: finalRoute,
          ignoreSafeArea: applyIgnoreSafeArea(route),
          title: await applyTitle(route)
        })
      );
      return;
    }

    if (router) {
      router.push(finalRoute);
    } else if (typeof window !== 'undefined') {
      window.location.assign(finalRoute);
    }
  },

  back() {
    if (isMobile()) {
      (window as any).KloudEvent.back();
      return;
    }
  },

  clearAndPush(route: string) {
    if (isMobile()) (window as any).KloudEvent.clearAndPush(JSON.stringify({
      route,
      ignoreSafeArea: applyIgnoreSafeArea(route),
    }));
  },

  rootNext(route: string) {
    if (isMobile()) (window as any).KloudEvent.rootNext(JSON.stringify({
      route,
      ignoreSafeArea: applyIgnoreSafeArea(route),
    }));
  },
  closeBottomSheet() {
    if (isMobile()) (window as any).KloudEvent.closeBottomSheet();
  },

  showBottomSheet(route: string) {
    if (isMobile()) (window as any).KloudEvent.showBottomSheet(route);
  },

  navigateMain(bootInfo?: unknown) {
    if (isMobile()) (window as any).KloudEvent.navigateMain(bootInfo);
  },
};


const applyIgnoreSafeArea = (route: string): boolean => {
  return (route.startsWith(KloudScreen.Login(''))) ||
    route.startsWith(KloudScreen.LoginEmail('')) ||
    route.startsWith(KloudScreen.SignUp('')) ||
    route.startsWith('/lessons') ||
    (route.startsWith('/studios') && !route.includes('passPlans')) ||
    route.startsWith('/tickets/') ||
    route.startsWith(KloudScreen.Onboard(''))
}

const applyTitle = async (route: string) => {
  if (route.startsWith(KloudScreen.LoginEmail(''))) {
    return ''
  } else if (route.startsWith(KloudScreen.SignUp(''))) {
    return await translate('sign_up')
  } else if (route.startsWith(KloudScreen.HasPassStudioList)) {
    return ''
  } else if (route.startsWith('/passPlans')) {
    return ''
  } else if (route.startsWith(KloudScreen.ProfileSetting)) {
    return await translate('setting')
  } else if (route.startsWith(KloudScreen.LoginIntro(''))) {
    return ''
  }
  else return undefined
}

// 타입 보강 (선택)
declare global {
  interface Window {
    kloudNav?: typeof kloudNav;
  }
}