'use client';

import { Locale } from "@/shared/StringResource";
import { changeLocale } from "@/utils/translate";
import { useRouter } from "next/navigation";
import { kloudNav, KloudNavOptions } from "@/app/lib/kloudNav";

interface NavigateClickItemProps {
  method: 'push' | 'back' | 'clearAndPush' | 'closeBottomSheet' | 'showBottomSheet' | 'navigateMain' | 'fullSheet',
  action?: 'changeLocale',
  locale?: Locale,
  route?: string;
  returnUrl?: string;
  bootInfo?: string;
  children: React.ReactNode;
  option?: KloudNavOptions;
}

export function NavigateClickWrapper({ method, route, action, locale, returnUrl, children }: NavigateClickItemProps) {
  const router = useRouter()
  return (
    <div
      onClick={async () => {
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
            if (returnUrl && !route.includes('returnUrl')) {
              const separator = route.includes('?') ? '&' : '?';
              router.push(route + `${separator}returnUrl=${encodeURIComponent(returnUrl)}`);
            } else {
              router.push(route);
            }
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