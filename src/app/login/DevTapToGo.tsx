'use client'
import { KloudScreen } from "@/shared/kloud.screen";
import { useRef } from "react";
import Logo from "../../../public/assets/logo_black.svg"


export function DevTapLogo() {
  const countRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const reset = () => {
    countRef.current = 0;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = () => {
    countRef.current += 1;

    // 1초 안에 연속탭
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => reset(), 1000);

    if (countRef.current >= 5) {
      reset();
      try {
        window.KloudEvent?.showBottomSheet(KloudScreen.DeveloperAuthentication);
      } catch (e) {
        console.error('[DevTapLogo] showBottomSheet error:', e);
      }
    }
  };

  return <Logo onClick={handleClick} className="cursor-pointer select-none" />;
}