'use client';

import { useEffect } from 'react';

/**
 * PC(lg, ≥1024px) 웹에서만 문서 오버스크롤(경계 바운스·스크롤 체이닝)을 끈다.
 *
 * 수업 상세는 자체 스크롤 컨테이너가 아니라 문서(body) 스크롤이라 Tailwind overscroll-none을
 * 래퍼에 붙여도 효과가 없다 — html/body에 직접 걸어야 한다.
 * 모바일 웹은 pull-to-refresh 등 네이티브 제스처를 유지해야 하므로 media query로 PC에서만 적용하고,
 * 페이지를 떠나면(unmount) 원복해 다른 페이지에 영향을 남기지 않는다.
 */
export const NoOverscrollOnPc = () => {
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const apply = () => {
      const value = mql.matches ? 'none' : '';
      document.documentElement.style.overscrollBehaviorY = value;
      document.body.style.overscrollBehaviorY = value;
    };
    apply();
    mql.addEventListener('change', apply);
    return () => {
      mql.removeEventListener('change', apply);
      document.documentElement.style.overscrollBehaviorY = '';
      document.body.style.overscrollBehaviorY = '';
    };
  }, []);

  return null;
};
