'use client';

import { useRef } from 'react';

// 풀블리드 히어로 — 영상(src)이 있으면 무음·자동재생·루프, 없으면 poster 이미지만 깐다.
// 웹뷰가 자동재생을 막아 멈춰 있으면 탭해서 재생한다. 재생 중 탭은 아무 동작도 하지 않는다(정지 X). 컨트롤 UI는 두지 않는다.
export const HeroVideo = ({ src, posterUrl }: { src?: string | null; posterUrl?: string | null }) => {
  const ref = useRef<HTMLVideoElement>(null);

  const playIfPaused = () => {
    const v = ref.current;
    if (!v || !v.paused) return;
    v.play().catch(() => {});
  };

  if (!src) {
    // 클립(heroVideoUrl)이 없는 상품·아직 클립이 안 만들어진 영상은 썸네일만
    return posterUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={posterUrl} alt={''} className={'absolute inset-0 w-full h-full object-cover'}/>
    ) : null;
  }

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
