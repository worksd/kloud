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
  /** navigateMain 에 사용 */
  bootInfo?: unknown;
  /** Next.js useRouter() 결과를 넘기면 SPA 네비게이션 */
  router?: { push: (href: string) => unknown; back: () => unknown };
}

/** 내부 유틸 */
const isMobile = () => typeof window !== 'undefined' && !!(window as any).KloudEvent;

/** 공용 네비게이션 객체 */
export const kloudNav = {
  async push(route: string) {
    if (isMobile()) {
      (window as any).KloudEvent.push(
        JSON.stringify({
          route,
          ignoreSafeArea: applyIgnoreSafeArea(route),
          title: await applyTitle(route)
        })
      );
      return;
    }
    // 웹(네이티브 아님) 폴백 — 브라우저 네비게이션
    if (typeof window !== 'undefined') window.location.href = route;
  },

  back() {
    if (isMobile()) {
      (window as any).KloudEvent.back();
      return;
    }
    if (typeof window !== 'undefined') window.history.back();
  },

  clearAndPush(route: string) {
    if (isMobile()) {
      (window as any).KloudEvent.clearAndPush(JSON.stringify({
        route,
        ignoreSafeArea: applyIgnoreSafeArea(route),
      }));
      return;
    }
    if (typeof window !== 'undefined') window.location.href = route;
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

  async navigateMain({route, admin = false}: { route?: string, admin?: boolean }) {
    // 웹(네이티브 아님) 폴백 — '메인 재부팅' 개념이 없으므로 목적지(없으면 홈)로 브라우저 이동.
    // replace: 우회 목적(결제 에러 redirectUrl 등)이라 back으로 중간 페이지에 되돌아가지 않게.
    // 이 폴백이 없으면 웹에서 navigateMain을 타는 모든 흐름(PushAndBackRedirect 등)이 빈 화면 dead-end가 된다.
    if (!isMobile()) {
      if (typeof window !== 'undefined') window.location.replace(route && route.length > 0 ? route : '/');
      return;
    }
    // 관리자면 관리자 탭 구성으로 메인을 띄운다 (홈=관리자 홈, 매출·수강생·설정)
    const bottomMenuList = await getBottomMenuList(admin);
    // route 필드는 값이 비어도 반드시 실어 보낸다 — 통째로 빼면 네이티브가 메인 자체를 못 띄우고
    // 화면 전체가 흰 화면이 된다(확인됨). 관리자 첫 탭 흰 화면 이슈는 네이티브 쪽 처리 필요.
    const bootInfo = JSON.stringify({
      bottomMenuList,
      route: JSON.stringify({
        route,
        title: await applyTitle(route ?? ''),
        ignoreSafeArea: applyIgnoreSafeArea(route ?? ''),
      })
    });
    (window as any).KloudEvent.navigateMain(bootInfo);
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
    (route.startsWith('/studios') && !route.includes('passPlans') && !route.includes('/lessons') && !route.includes('/regularClasses')) ||
    route.startsWith('/tickets/') ||
    route.startsWith(KloudScreen.Onboard) ||
    route.startsWith(KloudScreen.Certification) ||
    route.startsWith('/qrs') ||
    route.startsWith('/community/') ||
    route.startsWith(KloudScreen.Kiosk) ||
    route.startsWith('/studioRooms/') ||
    // 관리자 화면은 전부 풀스크린 — 각 화면이 safe-area 패딩으로 상태바 영역을 직접 잡는다
    route.startsWith(KloudScreen.AdminHome) ||
    route.includes('/profile/myPass/') ||
    // 결제 완료 환영 화면 — 썸네일이 상태바까지 풀블리드로 깔린다
    route.startsWith('/payment-complete') ||
    // 공지사항 목록(/announcements 또는 /announcements?...)만 ignoreSafeArea.
    // 상세(/announcements/:id)는 일반 헤더 사용하도록 매칭에서 제외.
    (route === '/announcements' || route.startsWith('/announcements?'))
}

const applyTitle = async (route: string) => {
  if (route.startsWith(KloudScreen.LoginEmail(''))) {
    return ''
  } else if (route.startsWith(KloudScreen.SignUp(''))) {
    return await translate('sign_up')
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
  } else if (route == KloudScreen.NotificationSetting) {
    return await translate('notification_setting')
  } else if (route == KloudScreen.CouponRegister) {
    return await translate('coupon_register')
  } else if (route == KloudScreen.RefundAccountSetting) {
    return await translate('refund_account')
  } else if (route == KloudScreen.InstagramConnect) {
    return await translate('instagram_connect_title')
  } else if (route == KloudScreen.SnsConnect) {
    return await translate('sns_account_connect')
  } else if (route == KloudScreen.BusinessInfo) {
    return await translate('business_info')
  } else if (route == KloudScreen.Policy) {
    return await translate('terms_and_policy')
  } else if (route == KloudScreen.Privacy) {
    return await translate('service_privacy_agreement')
  } else if (route == KloudScreen.Terms) {
    return await translate('service_terms_agreement')
  } else if (route == KloudScreen.MarketingAgreement) {
    return await translate('marketing_agreement_optional')
  } else if (route == KloudScreen.ProfileEdit) {
    return await translate('edit_profile')
  } else if (route == KloudScreen.StudioSetting) {
    return await translate('studio_setting')
  } else if (route === KloudScreen.RoomBookings) {
    return await translate('room_bookings')
  } else if (route.startsWith('/roomBookings/')) {
    return await translate('room_booking_detail_title')
  } else if (route.startsWith(KloudScreen.LoginIntro(''))) {
    return ''
  } else if (route.startsWith(KloudScreen.MySubscription)) {
    return await translate('scheduled_payments')
  } else if (route.startsWith('/paymentRecords')) {
    if (route.includes('/refund')) {
      return await translate('do_refund')
    } else if (route.startsWith('/paymentRecords/')) {
      return '';
    }
  } else if (route.includes('lessons') && route.includes('studios')) {
    return await translate('ongoing_lessons')
  } else if (route.includes('/regularClasses') && route.includes('/studios/')) {
    return await translate('studio_regular_classes')
  } else if (route.includes('resetPassword')) {
    return await translate('change_password')
  } else if (route.includes('refund')) {
    return '';
  } else if (route.startsWith('/tickets/')) {
    return '';
  } else if (route === '/studioRooms' || route.startsWith('/studioRooms?')) {
    return await translate('room_schedule_title')
  } else if (route.startsWith('/studioRooms/')) {
    return ''
  } else if (
    route.startsWith('/payment?') ||
    (route.includes('/lessons/') && route.includes('/payment')) ||
    (route.includes('/bundle/') && route.includes('/payment'))
  ) {
    return route.includes('item=practice-room') ? await translate('reserve') : await translate('payment')
  } else if (route.includes('/profile/myPass/')) {
    return '';
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