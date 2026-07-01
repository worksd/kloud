"use client";

import { useEffect } from "react";
import { authToken } from "@/app/splash/auth.token.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { getStoreLink } from "@/app/components/MobileWebViewTopBar";
import { kloudNav } from "@/app/lib/kloudNav";
import { resolveRedirectTarget } from "@/app/redirect/resolve";

const extractPath = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  // 이미 경로 형태면(쿼리스트링 포함) 그대로 사용 — 예: /redirect?type=UseVoucher
  if (raw.startsWith('/')) return raw;
  // https://staging.rawgraphy.com/lessons/1638 or staging.rawgraphy.com/lessons/1638
  const withScheme = raw.includes('://') ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    // pathname만 쓰면 쿼리(?type=...)가 사라지므로 search·hash까지 보존
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return `/${raw}`;
  }
};

// 앱 웹뷰는 서버 리다이렉트(/redirect의 307)를 따라가지 못하므로,
// /redirect 딥링크는 splash에서 최종 화면 경로로 직접 해석해 navigateMain에 넘긴다.
const resolveAppRoute = (raw?: string): string | undefined => {
  const path = extractPath(raw);
  if (!path) return undefined;
  const [pathname, query] = path.split('?');
  if (pathname === '/redirect') {
    const params = new URLSearchParams(query ?? '');
    return resolveRedirectTarget(params.get('type'), params.get('code'));
  }
  return path;
};

export const SplashScreen = ({os, link}: { os: string, link?: string }) => {
  useEffect(() => {
    setTimeout(async () => {
      if (process.env.NEXT_PUBLIC_MAINTENANCE == 'true') {
        kloudNav.clearAndPush(KloudScreen.Maintenance)
        return;
      }
      const res = await authToken()
      if (res.code == 'APP_UPGRADE_REQUIRED') {
        const dialog = await createDialog({id: 'AppUpgrade', message: res.errorTitle})
        window.KloudEvent.showDialog(JSON.stringify(dialog))
        return;
      }
      const status = res.status
      if (status == UserStatus.New) {
        kloudNav.clearAndPush(KloudScreen.Onboard(''))
      }
      else if (status == UserStatus.Ready) {
        await kloudNav.navigateMain({ route: resolveAppRoute(link) })
      }
      else if (status == UserStatus.Deactivate) {
        kloudNav.clearAndPush(KloudScreen.LoginDeactivate)
      } else {
        kloudNav.clearAndPush(KloudScreen.Login(''))
      }
    }, 10)
  }, []);

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {
      if (dialogInfo.id == 'AppUpgrade') {
        const url = getStoreLink({os})?.url
        if (url) {
          window.KloudEvent.openExternalBrowser(url)
        }
      }
    }
  }, []);

  return (
    <div className="bg-black">
    </div>
  );
};