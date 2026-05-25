'use client'

import { useEffect } from "react";
import { kloudNav } from "@/app/lib/kloudNav";

/**
 * mount 직후 지정 route로 push → 현재 페이지 back.
 * (BE redirectUrl 같은 케이스에서 결제 페이지 같은 중간 페이지를 우회시킬 때)
 */
export const PushAndBackRedirect = ({ route }: { route: string }) => {
  useEffect(() => {
    kloudNav.push(route);
    kloudNav.back();
  }, [route]);

  return null;
};
