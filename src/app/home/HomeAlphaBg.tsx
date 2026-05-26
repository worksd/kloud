'use client'

import React, { createContext, useContext, useState, useEffect } from "react";

const AlphaBgContext = createContext<{
  bgImage: string;
  setBgImage: (url: string) => void;
}>({ bgImage: '', setBgImage: () => {} });

export const useAlphaBg = () => useContext(AlphaBgContext);

export const HomeAlphaBgProvider = ({ initialImage, children }: { initialImage: string, children: React.ReactNode }) => {
  const [bgImage, setBgImage] = useState(initialImage);
  const [bgOpacity, setBgOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 200px 이내에서 1 → 0으로 페이드아웃
      const opacity = Math.max(0, 1 - window.scrollY / 200);
      setBgOpacity(opacity);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AlphaBgContext.Provider value={{ bgImage, setBgImage }}>
      {/* Alpha masking 배경 — fixed로 헤더 뒤까지 커버, 스크롤 시 페이드아웃.
          inline CSS background-image 로 SSR HTML 첫 paint부터 이미지 URL이 박혀,
          next/image의 hydration 지연으로 인한 빈/흰 깜빡임을 방지. */}
      {bgImage && bgOpacity > 0 && (
        <div
          className="fixed top-0 left-0 right-0 overflow-hidden pointer-events-none z-0"
          style={{ height: '390px', opacity: bgOpacity, backgroundColor: '#D5D8DB' }}
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
              willChange: 'filter, transform',
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
