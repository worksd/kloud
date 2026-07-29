'use client';

import React, { useEffect, useState } from 'react';

type DeferredImageProps = {
  src: string;
  alt?: string;
  /** <img>에 적용할 클래스 (크기/object-fit 등). 영역 크기는 부모가 미리 잡아둘 것. */
  className?: string;
  /** 페이드 인 시간(ms) */
  fadeMs?: number;
};

// 지연 렌더 이미지 — 서버 HTML/초기 페인트에는 이미지를 넣지 않고, 마운트(하이드레이션) 이후에만 src를 붙여 로드한다.
// → 텍스트/레이아웃이 먼저 그려지고 이미지는 나중에 뜬다(깜빡임 허용). 진입 시 이미지 다운로드가 첫 페인트를 막지 않음.
// 부모가 고정 크기(예: relative + h-[50vh])를 잡아두면 레이아웃 시프트도 없다.
export function DeferredImage({ src, alt = '', className = '', fadeMs = 300 }: DeferredImageProps) {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDuration: `${fadeMs}ms` }}
    />
  );
}
