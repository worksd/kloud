'use client'

import React, { useEffect, useState } from "react";

export const HomeHeader = ({ hasStudio, children }: { hasStudio: boolean, children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!hasStudio) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasStudio]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-10 transition-all duration-200 flex flex-row items-center px-6 pt-12 pb-2"
      style={{
        backgroundColor: hasStudio
          ? (scrolled ? 'rgba(255,255,255,0.3)' : 'transparent')
          : 'white',
        backdropFilter: hasStudio && scrolled ? 'blur(30px)' : 'none',
        WebkitBackdropFilter: hasStudio && scrolled ? 'blur(30px)' : 'none',
      }}
    >
      {children}
    </div>
  );
};
