'use client'

import { useEffect } from "react";
import { clearAllCookies } from "@/app/profile/clear.token.action";

export const LoginCookieCleaner = () => {
  useEffect(() => {
    clearAllCookies();
  }, []);
  return null;
};
