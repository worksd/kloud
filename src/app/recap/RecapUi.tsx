'use client'

import React, { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

/** 리캡 공용 UI — 인트로 다이얼로그와 스토리가 같이 쓴다 */

/**
 * 리캡 화면 상단 여백 — 인트로·스토리 모두 상태바 아래까지 깔린다(스토리는 ignoreSafeArea).
 * env(safe-area-inset-top)이 웹뷰에 따라 0으로 오는 경우가 있어 관리자 화면(ADMIN_SAFE_TOP)처럼 최소 44px 을 보장한다.
 */
export const RECAP_SAFE_TOP = 'max(env(safe-area-inset-top, 0px), 44px)';

/**
 * 원격 프로필 이미지를 Next 이미지 프록시(/_next/image)로 같은 출처로 바꾼다.
 * S3 버킷이 CORS 헤더를 안 줘서 원본 URL 로는 html-to-image 캡처(공유 카드)가 막힌다. w 는 next 기본 이미지 사이즈 중 하나.
 */
export const recapImage = (url: string, w: 256 | 384 | 640 = 384) =>
  `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;

export const RECAP_GRADIENT = 'linear-gradient(90deg, #FF3EA5 0%, #8B5CF6 45%, #22D3EE 100%)';

/** 리캡 배경 — 깊은 남보라 위에 네온 오로라가 천천히 흐른다 (3D 캔버스는 투명이라 이게 비친다) */
export const RecapBackdrop = ({ tint = ['#7C3AED', '#EC4899'] }: { tint?: [string, string] }) => (
  <div className={'absolute inset-0 overflow-hidden bg-[#06010F]'}>
    <motion.div
      className={'absolute -top-1/3 -left-1/3 w-[120%] h-[90%] rounded-full blur-[90px] opacity-50'}
      style={{ background: `radial-gradient(circle, ${tint[0]} 0%, transparent 65%)` }}
      animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className={'absolute -bottom-1/3 -right-1/3 w-[120%] h-[90%] rounded-full blur-[90px] opacity-45'}
      style={{ background: `radial-gradient(circle, ${tint[1]} 0%, transparent 65%)` }}
      animate={{ x: [0, -50, 30, 0], y: [0, -60, -20, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

/**
 * 테이프 라벨 — 스트릿 포인트 하나. 연습실 바닥 자리 표시 테이프에 쓴 것처럼
 * 끝이 손으로 뜯은 듯 들쭉날쭉하고 살짝 기울어져 붙는다. 우주 톤을 해치지 않게 크림색.
 */
export const TapeLabel = ({ children, delay = 0.1, color = '#F4F1EA', rotate = -2, className = '' }: {
  children: React.ReactNode; delay?: number; color?: string; rotate?: number; className?: string;
}) => (
  <motion.span
    className={`inline-block px-3 py-1 text-[14px] font-black text-[#111] tracking-[-0.01em] ${className}`}
    style={{
      background: color,
      clipPath: 'polygon(2% 8%, 98% 0%, 100% 40%, 97% 92%, 3% 100%, 0% 55%)',
      boxShadow: '0 2px 0 rgba(0,0,0,0.35)',
    }}
    initial={{ opacity: 0, scaleX: 0, rotate }}
    animate={{ opacity: 1, scaleX: 1, rotate }}
    transition={{ delay, duration: 0.35, ease: [0.2, 0.9, 0.3, 1.2] }}
  >
    {children}
  </motion.span>
);

/** 음악 재생 안내 */
export const MusicNotice = ({ className = '' }: { className?: string }) => (
  <p className={`flex items-center justify-center gap-1.5 text-[12px] text-white/55 ${className}`}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>
      <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
    음악이 함께 재생돼요
  </p>
);

/** 그라데이션 글자 */
export const GradientText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`bg-clip-text text-transparent ${className}`} style={{ backgroundImage: RECAP_GRADIENT }}>
    {children}
  </span>
);

/**
 * 입체 숫자 — 아래로 겹친 그림자로 두께를 만들고 네온 글로우를 얹는다.
 * 숫자는 0부터 카운트업된다.
 */
export const ExtrudedNumber = ({ value, suffix = '', className = '', duration = 1.8 }: {
  value: number; suffix?: string; className?: string; duration?: number;
}) => {
  const mv = useMotionValue(0);
  const text = useTransform(mv, v => `${Math.round(v).toLocaleString()}${suffix}`);
  useEffect(() => {
    const c = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [mv, value, duration]);
  return (
    <motion.span
      className={`inline-block font-black text-white tracking-[-0.04em] ${className}`}
      style={{ textShadow: EXTRUDE_SHADOW }}
      initial={{ rotateX: 70, opacity: 0, y: 30 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    >
      <motion.span>{text}</motion.span>
    </motion.span>
  );
};

const EXTRUDE_SHADOW = [
  ...Array.from({ length: 6 }, (_, i) => `0 ${i + 1}px 0 hsl(${300 - i * 12} 80% ${45 - i * 4}%)`),
  '0 0 24px rgba(255,62,165,0.65)',
  '0 0 60px rgba(139,92,246,0.55)',
].join(', ');

/** 글자가 한 단어씩 뒤에서 앞으로 뒤집히며 들어온다 */
export const FlipWords = ({ text, className = '', delay = 0, gradient = false }: {
  text: string; className?: string; delay?: number; gradient?: boolean;
}) => (
  <span className={`inline-block ${className}`} style={{ perspective: 600 }}>
    {text.split(' ').map((w, i) => (
      <motion.span
        key={`${w}-${i}`}
        className={'inline-block mr-[0.25em] origin-bottom'}
        initial={{ rotateX: -95, opacity: 0, y: 12 }}
        animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{ delay: delay + i * 0.09, type: 'spring', stiffness: 160, damping: 16 }}
      >
        {gradient ? <GradientText>{w}</GradientText> : w}
      </motion.span>
    ))}
  </span>
);

/** 메인 CTA — 흐르는 네온 그라데이션 + 빛이 훑고 지나가는 쉬머 */
export const NeonButton = ({ children, onClick, className = '' }: {
  children: React.ReactNode; onClick: () => void; className?: string;
}) => (
  <motion.button
    type={'button'}
    onClick={onClick}
    whileTap={{ scale: 0.96 }}
    className={`relative overflow-hidden rounded-2xl h-14 w-full text-[17px] font-bold text-white ${className}`}
    style={{
      backgroundImage: 'linear-gradient(90deg, #FF3EA5, #8B5CF6, #22D3EE, #8B5CF6, #FF3EA5)',
      backgroundSize: '300% 100%',
      boxShadow: '0 10px 40px -8px rgba(255,62,165,0.7), 0 0 0 1px rgba(255,255,255,0.15) inset',
    }}
    animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
    transition={{ backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' } }}
  >
    <motion.span
      aria-hidden
      className={'absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg]'}
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
      animate={{ x: ['0%', '400%'] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
    />
    <span className={'relative'}>{children}</span>
  </motion.button>
);

/**
 * 상단 머리줄 — 스튜디오 리캡 이름 + 8카운트 점(스트릿 포인트 하나). 지금 박만 밝게.
 * 화면 터치를 막지 않는다.
 */
export const BattleTapeHud = ({ now, label }: { now: () => number; label: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setCount(Math.floor(now()) % 8);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [now]);
  return (
    <div className={'pointer-events-none flex items-center justify-between gap-3'}>
      <span className={'text-[13px] font-bold tracking-[0.14em] text-white/80 truncate'}>{label}</span>
      <span className={'flex items-center gap-[5px] shrink-0'} aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`rounded-full transition-all duration-100 ${i === count ? 'w-[6px] h-[6px] bg-white' : 'w-1 h-1 bg-white/30'}`}/>
        ))}
      </span>
    </div>
  );
};

/** 네이티브 햅틱 — 앱 웹뷰에서만 */
export const haptic = () => {
  try {
    window.KloudEvent?.sendHapticFeedback?.();
  } catch {
  }
};

/** WebGL 미지원/저사양에서 3D 를 끄기 위한 체크 */
export const useWebGLAvailable = () => {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setOk(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
};
