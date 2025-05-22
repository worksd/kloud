'use client';

import { Locale } from "@/shared/StringResource";
import { changeLocale } from "@/utils/translate";
import { useRouter } from "next/navigation";

interface NavigateClickItemProps {
  method: 'push' | 'back' | 'clearAndPush' | 'closeBottomSheet' | 'showBottomSheet' | 'navigateMain',
  action?: 'changeLocale',
  locale?: Locale,
  route?: string;
  returnUrl?: string;
  bootInfo?: string;
  children: React.ReactNode;
}

export function NavigateClickWrapper({ method, route, action, locale, returnUrl, bootInfo, children }: NavigateClickItemProps) {
  const router = useRouter()
  return (
    <div
      onClick={async () => {
        if (action === 'changeLocale' && locale) {
          await changeLocale(locale)
        }

        if (window.KloudEvent) {
          if (method === 'push' && route) {
            window.KloudEvent?.push(route);
          } else if (method == 'back') {
            window.KloudEvent?.back();
          } else if (method == 'clearAndPush' && route) {
            window.KloudEvent?.clearAndPush(route);
          } else if (method == 'closeBottomSheet') {
            window.KloudEvent?.closeBottomSheet();
          } else if (method === 'showBottomSheet') {
            window.KloudEvent?.showBottomSheet(route);
          } else if (method === 'navigateMain') {
            window.KloudEvent?.navigateMain(bootInfo);
          }
        } else {
          if (method === 'push' && route) {
            const query = returnUrl ? `?returnUrl=${returnUrl}` : '';
            router.push(route + query);
          } else if (method == 'back') {
            router.back();
          }
        }
      }}
    >
      {children}
    </div>
  );
}