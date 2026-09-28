'use client';

import { useEffect } from 'react';

/**
 * 관리자 화면이 떠 있는 동안 뷰포트 가로 스크롤을 막는다.
 *
 * 루트 div에 overflow-x-hidden을 주면 그 div가 스크롤 컨테이너가 되어 안쪽 sticky 헤더가
 * 창 스크롤에 붙지 않는다. 대신 <html>에 overflow-x: hidden을 걸면 값이 뷰포트로 전파돼
 * 가로 스크롤만 막히고 sticky는 그대로 동작한다. (body에 같이 걸면 body가 스크롤 컨테이너가
 * 되어 다시 sticky가 깨지므로 html에만 건다.)
 */
export function AdminNoHorizontalScroll() {
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.overflowX;
    el.style.overflowX = 'hidden';
    return () => { el.style.overflowX = prev; };
  }, []);
  return null;
}
