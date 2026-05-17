'use client';

import { hideDialogIdListKey } from "@/shared/cookies.key";

/**
 * hideDialogIdList 쿠키를 client에서 직접 set.
 *
 * server action으로 처리하면 Next.js가 RSC를 invalidate해서 페이지 전체가 re-render(=서버 fetch 재호출)되는 부작용이 있음.
 * hideDialogIdList는 httpOnly가 아니라 document.cookie로 직접 set 가능 → 서버 호출 없이 즉시 쿠키 반영.
 *
 * format: 'id1/id2/id3/' 형태 (마지막 슬래시 포함), 만료 7일.
 */
export const setHideDialogCookie = (id: string, clicked: boolean) => {
  const all = document.cookie.split('; ').reduce<Record<string, string>>((acc, c) => {
    const idx = c.indexOf('=');
    if (idx > 0) acc[c.slice(0, idx)] = decodeURIComponent(c.slice(idx + 1));
    return acc;
  }, {});

  const current = all[hideDialogIdListKey] ?? '';
  const idArray = current.split('/').filter(Boolean);

  if (clicked) {
    if (!idArray.includes(id)) idArray.push(id);
  } else {
    const i = idArray.indexOf(id);
    if (i > -1) idArray.splice(i, 1);
  }

  let newList = idArray.join('/');
  if (newList) newList += '/';

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  document.cookie = `${hideDialogIdListKey}=${encodeURIComponent(newList)}; expires=${expires.toUTCString()}; path=/`;
};
