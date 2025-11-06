// app/lib/kloudNav.ts
'use client';

import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";

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
  async push(route: string) {
    const finalRoute = withReturnUrl(route);
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
    if (isMobile()) (window as any).KloudEvent.showBottomSheet(JSON.stringify({
      route
    }));
  },

  async navigateMain({route}: { route?: string }) {
    const bottomMenuList = await getBottomMenuList();
    const bootInfo = JSON.stringify({
      bottomMenuList,
      routeInfo: {
        route,
        title: await applyTitle(route ?? ''),
      }
    })
    if (isMobile()) (window as any).KloudEvent.navigateMain(bootInfo);
  },

  async fullSheet(route: string) {
    if (isMobile()) (window as any).KloudEvent.fullSheet(
      JSON.stringify({
        route: route,
        ignoreSafeArea: applyIgnoreSafeArea(route),
        title: await applyTitle(route),
        withClose: true
      })
    );
  }
};

const applyIgnoreSafeArea = (route: string): boolean => {
  return (route.startsWith(KloudScreen.Login(''))) ||
    route.startsWith(KloudScreen.LoginEmail('')) ||
    route.startsWith(KloudScreen.SignUp('')) ||
    (route.startsWith('/lessons/') && !route.includes('/payment')) ||
    (route.startsWith('/studios') && !route.includes('passPlans') && !route.includes('/lessons')) ||
    route.startsWith('/tickets/') ||
    route.startsWith(KloudScreen.Onboard('')) ||
    route.startsWith(KloudScreen.Certification)
}

const applyTitle = async (route: string) => {
  if (route.startsWith(KloudScreen.LoginEmail(''))) {
    return ''
  } else if (route.startsWith(KloudScreen.SignUp(''))) {
    return await translate('sign_up')
  } else if (route.startsWith(KloudScreen.HasPassStudioList)) {
    return ''
  } else if (route.startsWith('/passPlans?studioId')) {
    return ''
  } else if (route == (KloudScreen.ProfileSetting)) {
    return await translate('setting')
  } else if (route == KloudScreen.MyAccount) {
    return await translate('my_account')
  } else if (route == KloudScreen.PaymentMethodSetting) {
    return await translate('payment_method_management')
  } else if (route == KloudScreen.LanguageSetting) {
    return await translate('language_setting')
  } else if (route == KloudScreen.RefundAccountSetting) {
    return await translate('refund_account')
  } else if (route == KloudScreen.BusinessInfo) {
    return await translate('business_info')
  } else if (route == KloudScreen.Policy) {
    return await translate('terms_and_policy')
  } else if (route == KloudScreen.Privacy) {
    return await translate('service_privacy_agreement')
  } else if (route == KloudScreen.Terms) {
    return await translate('service_terms_agreement')
  } else if (route == KloudScreen.ProfileEdit) {
    return await translate('edit_profile')
  } else if (route.startsWith(KloudScreen.LoginIntro(''))) {
    return ''
  } else if (route.startsWith('/tickets')) {
    return await translate('ticket')
  } else if (route.startsWith(KloudScreen.MyPass)) {
    return await translate('my_pass')
  } else if (route.startsWith(KloudScreen.MySubscription)) {
    return await translate('my_subscription')
  } else if (route.includes('/paymentRecords')) {
    return await translate('payment_records')
  } else if (route.includes('lessons') && route.includes('studios')) {
    return await translate('ongoing_lessons')
  } else if (route.includes('/payment') && (route.includes('/lessons') || route.includes('/passPlans'))) {
    return await translate('payment')
  } else if (route.includes('resetPassword')) {
    return await translate('change_password')
  }
  else return undefined
}

// 타입 보강 (선택)
declare global {
  interface Window {
    kloudNav?: typeof kloudNav;
  }
}

export type BootInfo = {
  bottomMenuList: string
  routeInfo: {
    route?: string,
    title?: string,
  }
}