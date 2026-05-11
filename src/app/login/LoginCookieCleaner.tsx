'use client'

import { useEffect } from "react";
import { clearAllCookies } from "@/app/profile/clear.token.action";
import { syncCookiesToNative } from "@/app/lib/sync.cookies.to.native";

export const LoginCookieCleaner = () => {
  useEffect(() => {
    (async () => {
      await clearAllCookies();
      await syncCookiesToNative();
    })();
  }, []);
  return null;
};
