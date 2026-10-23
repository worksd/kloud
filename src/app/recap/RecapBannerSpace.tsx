'use client'

import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * 마이페이지 리캡 배너의 움직이는 우주 배경 — 리캡 스토리의 우주 톤을 가볍게(three 없이 CSS·framer-motion 만).
 * 흐르는 오로라 · 반짝이며 흘러가는 별가루 · 천천히 도는 은하 + 맥박 치는 중심 · 가끔 지나가는 별똥별.
 * 배너 안을 꽉 채우는 장식 레이어라 터치를 막지 않는다.
 */
export const RecapBannerSpace = () => {
  // 별 위치는 렌더마다 바뀌지 않게 고정 (SSR·하이드레이션 어긋남 방지를 위해 결정적 난수)
  const stars = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const r = (k: number) => {
      const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return { x: r(1) * 100, y: r(2) * 100, s: r(3) < 0.2 ? 2 : 1, d: 1.5 + r(4) * 2.5, delay: r(5) * 3 };
  }), []);

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 오로라 */}
      <motion.div
        className="absolute -left-1/4 -top-1/2 w-[90%] h-[160%] rounded-full blur-[40px]"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 65%)' }}
        animate={{ x: [0, 40, -10, 0], y: [0, 15, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-1/4 -bottom-1/2 w-[80%] h-[160%] rounded-full blur-[40px]"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.55) 0%, transparent 65%)' }}
        animate={{ x: [0, -30, 15, 0], y: [0, -12, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 별가루 — 전체가 천천히 왼쪽으로 흐르고, 별마다 다른 박자로 반짝인다 */}
      <motion.div
        className="absolute inset-y-0 left-0 w-[200%]"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 50].map(offset => stars.map((st, i) => (
          <motion.span
            key={`${offset}-${i}`}
            className="absolute rounded-full bg-white"
            style={{ left: `${offset + st.x / 2}%`, top: `${st.y}%`, width: st.s, height: st.s }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: st.d, delay: st.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        )))}
      </motion.div>

      {/* 은하 — 기울어진 나선 원반이 돌고, 중심이 맥박 친다 */}
      <div className="absolute -right-10 top-1/2 w-44 h-44" style={{ transform: 'translateY(-50%) rotateX(62deg) rotateZ(-18deg)' }}>
        <motion.div
          className="absolute inset-0 rounded-full blur-[6px] opacity-85"
          style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,62,165,0.9) 40deg, transparent 110deg, rgba(139,92,246,0.9) 160deg, transparent 230deg, rgba(34,211,238,0.85) 280deg, transparent 350deg)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-6 rounded-full blur-[10px]"
          style={{ background: 'conic-gradient(from 90deg, transparent, rgba(255,255,255,0.35), transparent 40%, rgba(139,92,246,0.5), transparent 75%)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <motion.div
        className="absolute right-[52px] top-1/2 -mt-2.5 w-5 h-5 rounded-full bg-white blur-[3px]"
        style={{ boxShadow: '0 0 24px 10px rgba(255,180,230,0.7), 0 0 60px 24px rgba(139,92,246,0.55)' }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 60 / 92 * 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 별똥별 — 5초에 한 번 대각선으로 스친다 */}
      <motion.div
        className="absolute top-2 left-[30%] h-px w-24 -rotate-[25deg] origin-right"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95))' }}
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{ x: [0, 160], y: [0, 70], opacity: [0, 1, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 4.2, ease: 'easeOut' }}
      />
    </div>
  );
};
