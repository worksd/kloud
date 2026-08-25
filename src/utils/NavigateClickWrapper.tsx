'use client';

import { Locale } from "@/shared/StringResource";
import { changeLocale } from "@/utils/translate";
import { useRouter } from "next/navigation";
import { kloudNav, KloudNavOptions } from "@/app/lib/kloudNav";
import { AnalyticsEvent, AnalyticsProps, trackEvent } from "@/app/lib/analytics";

interface NavigateClickItemProps {
  method: 'push' | 'back' | 'clearAndPush' | 'closeBottomSheet' | 'showBottomSheet' | 'navigateMain' | 'fullSheet',
  action?: 'changeLocale',
  locale?: Locale,
  route?: string;
  bootInfo?: string;
  children: React.ReactNode;
  option?: KloudNavOptions;
  /** 클릭 시 함께 보낼 분석 이벤트. 네비게이션보다 먼저 쏴서 화면 전환에 잘리지 않게 한다. */
  track?: { event: AnalyticsEvent; props?: AnalyticsProps };
}

export function NavigateClickWrapper({ method, route, action, locale, children, track }: NavigateClickItemProps) {
  const router = useRouter()
  return (
    <div
      onClick={async () => {
        if (track) trackEvent(track.event, track.props);

        if (action === 'changeLocale' && locale) {
          await changeLocale(locale)
        }

        if (window.KloudEvent) {
          if (method === 'push' && route) {
            kloudNav.push(route)
          } else if (method == 'back') {
            kloudNav.back()
          } else if (method == 'clearAndPush' && route) {
            kloudNav.clearAndPush(route)
          } else if (method == 'closeBottomSheet') {
            window.KloudEvent?.closeBottomSheet();
          } else if (method === 'showBottomSheet' && route) {
            kloudNav?.showBottomSheet(route);
          } else if (method === 'navigateMain') {
            await kloudNav.navigateMain({route});
          } else if (method == 'fullSheet' && route) {
            kloudNav.fullSheet(route)
          }
        } else {
          if (method === 'push' && route) {
            router.push(route);
          } else if (method == 'back') {
            router.back();
          } else {

          }
        }
      }}
    >
      {children}
    </div>
  );
}