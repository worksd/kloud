'use client'

import { useEffect } from "react";
import { kloudNav } from "@/app/lib/kloudNav";

/**
 * server에서 잘못된 접근(쿼리 누락 등)을 감지했을 때 client에서 main(홈)으로 보내는 컴포넌트.
 * webview일 경우 native main 스택을 새로 시작, 일반 브라우저면 kloudNav fallback에 위임.
 */
export const NavigateMainRedirect = () => {
  useEffect(() => {
    kloudNav.navigateMain({});
  }, []);

  return null;
};
