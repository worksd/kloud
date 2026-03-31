'use client'

import { useEffect } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";

export const TokenExpiredRedirect = () => {
  useEffect(() => {
    kloudNav.clearAndPush(KloudScreen.Login(''));
  }, []);

  return null;
};
