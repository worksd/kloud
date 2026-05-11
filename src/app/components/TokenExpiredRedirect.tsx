'use client'

import { useEffect } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { syncCookiesToNative } from "@/app/lib/sync.cookies.to.native";

export const TokenExpiredRedirect = () => {
  useEffect(() => {
    (async () => {
      // 서버측 handleApiError가 이미 쿠키를 비웠음. native 저장소도 그 상태로 동기화.
      await syncCookiesToNative();
      kloudNav.clearAndPush(KloudScreen.Login(''));
    })();
  }, []);

  return null;
};
