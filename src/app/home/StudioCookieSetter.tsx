'use client'

import { useEffect } from "react";
import { studioKey } from "@/shared/cookies.key";

/**
 * 첫 진입 시 client에서 studio cookie를 직접 set.
 *
 * 이전에는 saveStudioIdAction(server action)을 호출했는데, Next.js가 server action 호출마다
 * RSC를 invalidate해서 home page가 매번 재실행되는 무한 루프가 발생.
 *   useEffect → server action → cookies().set() → RSC invalidate
 *     → home server 재실행 → /home API 또 호출 → StudioCookieSetter 다시 mount → 반복
 *
 * studio cookie는 httpOnly가 아니라 document.cookie로 직접 write 가능.
 * 서버 호출 없이 즉시 반영되어 다음 요청부터 server가 정상적으로 읽음.
 */
export const StudioCookieSetter = ({ studioId }: { studioId: number }) => {
  useEffect(() => {
    const maxAge = 15552000; // 180일 (기존 saveStudioIdAction과 동일)
    document.cookie = `${studioKey}=${encodeURIComponent(String(studioId))}; max-age=${maxAge}; path=/; samesite=lax`;
  }, [studioId]);

  return null;
};
