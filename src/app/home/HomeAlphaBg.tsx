'use client'

import React, { createContext, useContext, useState, useEffect } from "react";
import Image from "next/image";

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
      {/* Alpha masking 배경 — fixed로 헤더 뒤까지 커버, 스크롤 시 페이드아웃 */}
      {bgImage && bgOpacity > 0 && (
        <div
          className="fixed top-0 left-0 right-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-150"
          style={{ height: '390px', opacity: bgOpacity }}
        >
          <Image
            key={bgImage}
            src={bgImage}
            alt=""
            fill
            className="object-cover scale-110 blur-[30px] opacity-85"
            priority
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
