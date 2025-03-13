'use client';

import { Locale } from "@/shared/StringResource";
import { changeLocale } from "@/utils/translate";

interface NavigateClickItemProps {
  method: 'push' | 'back' | 'clearAndPush' | 'closeBottomSheet' | 'showBottomSheet',
  action?: 'changeLocale',
  locale?: Locale,
  route?: string;
  children: React.ReactNode;
}

export function NavigateClickWrapper({ method, route, action, locale, children }: NavigateClickItemProps) {
  return (
    <div
      onClick={async () => {
        if (action === 'changeLocale' && locale) {
          await changeLocale(locale)
        }

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
        }

      }}
    >
      {children}
    </div>
  );
}