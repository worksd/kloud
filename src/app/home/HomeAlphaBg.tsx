'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const AlphaBgContext = createContext<{
  bgImage: string;
  setBgImage: (url: string) => void;
}>({ bgImage: '', setBgImage: () => {} });

export const useAlphaBg = () => useContext(AlphaBgContext);

export const HomeAlphaBgProvider = ({ initialImage, children }: { initialImage: string, children: React.ReactNode }) => {
  const [bgImage, setBgImage] = useState(initialImage);
  const bgRef = useRef<HTMLDivElement | null>(null);

  // 스크롤 페이드아웃은 React 상태가 아니라 DOM style을 직접 바꾼다.
  // setState로 하면 스크롤 이벤트마다 리렌더 + blur 레이어 재합성이 일어나고,
  // opacity 0에서 언마운트/재마운트까지 하면 그 순간 화면 전체(시간표 썸네일 포함)가 깜빡인다.
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    const handleScroll = () => {
      // 스크롤 200px 이내에서 1 → 0으로 페이드아웃
      const opacity = Math.max(0, 1 - window.scrollY / 200);
      el.style.opacity = String(opacity);
      // 완전히 사라지면 레이어를 언마운트하지 않고 visibility로만 숨겨 재합성을 막는다.
      el.style.visibility = opacity > 0 ? 'visible' : 'hidden';
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bgImage]);

  return (
    <AlphaBgContext.Provider value={{ bgImage, setBgImage }}>
      {/* Alpha masking 배경 — fixed로 헤더 뒤까지 커버, 스크롤 시 페이드아웃.
          inline CSS background-image 로 SSR HTML 첫 paint부터 이미지 URL이 박혀,
          next/image의 hydration 지연으로 인한 빈/흰 깜빡임을 방지. */}
      {bgImage && (
        <div
          ref={bgRef}
          className="fixed top-0 left-0 right-0 overflow-hidden pointer-events-none z-0"
          style={{ height: '390px', opacity: 1, backgroundColor: '#D5D8DB' }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#D5D8DB',
              filter: 'blur(30px)',
              transform: 'scale(1.1) translateZ(0)',
              opacity: 0.85,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 100%)',
            }}
          />
        </div>
      )}
      {children}
    </AlphaBgContext.Provider>
  );
};
