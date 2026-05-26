'use client'

import { useEffect } from "react";
import { kloudNav } from "@/app/lib/kloudNav";

/**
 * server에서 redirect 사유를 감지했을 때 client mount 즉시 main(또는 지정 route)으로 보내는 컴포넌트.
 * - route 미지정: 홈으로 (navigateMain({}))
 * - route 지정: 그 route로 (navigateMain({ route }))
 */
export const NavigateMainRedirect = ({ route }: { route?: string } = {}) => {
  useEffect(() => {
    kloudNav.navigateMain(route ? { route } : {});
  }, [route]);

  return null;
};
