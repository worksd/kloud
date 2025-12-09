'use client';

import { useEffect, useRef } from 'react';

export function ScrollContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 0) {
        container.scrollTop = 0;
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ overscrollBehaviorY: 'none' }}
    >
      {children}
    </div>
  );
}

