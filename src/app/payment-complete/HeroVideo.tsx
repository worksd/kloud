'use client';

import { useRef } from 'react';

// 풀블리드 히어로 영상 — 무음·자동재생·루프. 웹뷰가 자동재생을 막아 멈춰 있으면 탭해서 재생한다.
// 재생 중 탭은 아무 동작도 하지 않는다(정지 X). 컨트롤 UI는 두지 않는다 (탭 영역 = 영상 전체).
export const HeroVideo = ({ src, posterUrl }: { src: string; posterUrl?: string | null }) => {
  const ref = useRef<HTMLVideoElement>(null);

  const playIfPaused = () => {
    const v = ref.current;
    if (!v || !v.paused) return;
    v.play().catch(() => {});
  };

  return (
    <video
      ref={ref}
      src={src}
      poster={posterUrl ?? undefined}
      autoPlay
      muted
      loop
      playsInline
      preload={'auto'}
      onClick={playIfPaused}
      className={'absolute inset-0 w-full h-full object-cover cursor-pointer'}
    />
  );
};
