'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, MotionValue, useMotionValue, useTransform } from "framer-motion";
import { toPng } from "html-to-image";
import { RecapResponse } from "@/app/recap/recap.types";
import { buildSlides } from "@/app/recap/RecapSlides";
import { RecapShareCard } from "@/app/recap/RecapShareCard";
import {
  BattleTapeHud, FlipWords, haptic, MusicNotice, NeonButton, RECAP_SAFE_TOP, RecapBackdrop, TapeLabel, useWebGLAvailable,
} from "@/app/recap/RecapUi";
import { kloudNav } from "@/app/lib/kloudNav";
import { beat } from "@/app/recap/recap.beat";

const RecapCanvas = dynamic(() => import("@/app/recap/three/RecapScenes"), { ssr: false });

const LONG_PRESS_MS = 180;
const beatNow = () => beat.now();

/**
 * 리캡 스토리 — 인스타 스토리 방식 + 'BATTLE TAPE' 연출.
 * 처음엔 PRESS PLAY 화면 — 탭하는 순간 붐뱁 비트가 시작되고(모바일 자동재생 정책상 탭이 필요) 스토리가 흐른다.
 * 슬라이드 하나 = 8카운트. 상단 진행 바, 자동 넘김, 왼쪽 1/3 탭 = 이전 / 나머지 탭 = 다음, 길게 누르면 일시정지(비트도 멈춤).
 * 3D 캔버스는 하나만 두고 슬라이드에 맞춰 컷만 바꾼다 (WebGL 컨텍스트를 매번 만들지 않게).
 * 마지막 요약 슬라이드는 자동 넘김 없이 공유 카드를 보여준다.
 */
export const RecapStory = ({ recap }: { recap: RecapResponse }) => {
  const slides = useMemo(() => buildSlides(recap), [recap]);
  const total = slides.length + 1; // + 요약
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => () => beat.stop(), []);

  const start = () => {
    haptic();
    beat.start();
    setStarted(true);
  };
  const toggleMute = () => {
    beat.setMuted(!muted);
    setMuted(!muted);
  };
  const pausedRef = useRef(false);
  const elapsed = useRef(0);
  const progress = useMotionValue(0);
  const webgl = useWebGLAvailable();

  const isSummary = index === slides.length;
  const slide = slides[index];

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    if (clamped === index) {
      // 첫 장에서 이전 → 처음부터 다시 재생
      elapsed.current = 0;
      return;
    }
    haptic();
    elapsed.current = 0;
    progress.set(0);
    setDirection(clamped > index ? 1 : -1);
    setIndex(clamped);
  }, [index, total, progress]);

  // 진행 타이머 — 일시정지 중엔 시간이 흐르지 않는다
  useEffect(() => {
    if (!started || isSummary || !slide) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!pausedRef.current && !document.hidden) elapsed.current += now - last;
      last = now;
      const p = elapsed.current / slide.duration;
      progress.set(Math.min(1, p));
      if (p >= 1) {
        go(index + 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, index, isSummary, slide, go, progress]);

  const setPause = (v: boolean) => {
    pausedRef.current = v;
    setPaused(v);
    if (v) beat.pause();
    else beat.resume();
  };

  // 탭/길게 누르기
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const longPressed = useRef(false);
  const onPointerDown = () => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setPause(true);
    }, LONG_PRESS_MS);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    clearTimeout(pressTimer.current);
    if (longPressed.current) {
      setPause(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    go((e.clientX - rect.left) < rect.width / 3 ? index - 1 : index + 1);
  };
  const onPointerCancel = () => {
    clearTimeout(pressTimer.current);
    setPause(false);
  };

  const scene = !started ? 'intro' : isSummary ? 'summary' : slide.key;
  const tint = !started || isSummary ? recap.dancerType.colors : slide.tint;

  return (
    <div className={'fixed inset-0 bg-[#06010F] text-white overflow-hidden select-none'}>
      <div className={'relative mx-auto h-full max-w-[480px] overflow-hidden'}>
        <RecapBackdrop tint={tint}/>

        <div className={'absolute inset-0'}>
          {webgl && (
            <RecapCanvas
              scene={scene}
              lessons={recap.totalLessons}
              genres={recap.topGenres.map(g => g.count)}
              monthly={recap.monthlyLessons}
              streakWeeks={recap.longestStreakWeeks}
              typeColors={recap.dancerType.colors}
            />
          )}
        </div>

        {/* 전환 플래시 — 파티클이 터지는 순간에 맞춰 화면 가운데서 빛이 번졌다 사라진다 */}
        {started && (
          <motion.div
            key={`flash-${index}`}
            aria-hidden
            className={'absolute inset-0 pointer-events-none mix-blend-screen'}
            style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.55) 0%, ${tint[1]}55 30%, transparent 65%)` }}
            initial={{ opacity: 1, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        )}

        {/* 슬라이드 카피 — 큐브처럼 옆면으로 돌아 넘어간다 */}
        {started && (
          <div className={'absolute inset-0'} style={{ perspective: 1200 }}>
            <AnimatePresence mode={'popLayout'} custom={direction} initial={false}>
              <motion.div
                key={index}
                custom={direction}
                className={'absolute inset-0'}
                variants={{
                  enter: (d: number) => ({ rotateY: d * 70, x: `${d * 40}%`, opacity: 0 }),
                  center: { rotateY: 0, x: '0%', opacity: 1 },
                  exit: (d: number) => ({ rotateY: d * -70, x: `${d * -40}%`, opacity: 0 }),
                }}
                initial={'enter'}
                animate={'center'}
                exit={'exit'}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{ transformOrigin: direction > 0 ? 'left center' : 'right center' }}
              >
                {isSummary ? (
                  <Summary recap={recap} onReplay={() => go(0)}/>
                ) : (
                  slide.render()
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* PRESS PLAY — 탭해야 비트가 시작된다 */}
        {!started && (
          <motion.button
            type={'button'}
            onClick={start}
            className={'absolute inset-0 z-30 flex flex-col items-center justify-end px-7 text-left'}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 40px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={'w-full'}>
              <TapeLabel>{recap.studio.name} · {recap.year} RECAP</TapeLabel>
              <h1 className={'mt-4 text-[34px] leading-[1.15] font-black'}>
                <FlipWords text={`${recap.nickName}님의 1년을`} delay={0.2}/>
                <br/>
                <FlipWords text={'틀어볼게요'} delay={0.4} gradient/>
              </h1>
            </div>
            <div className={'mt-8 w-full'}>
              <div className={'h-14 w-full rounded-2xl text-white flex items-center justify-center gap-2.5 text-[17px] font-bold'}
                   style={{
                     backgroundImage: 'linear-gradient(90deg, #FF3EA5, #8B5CF6, #22D3EE)',
                     boxShadow: '0 10px 40px -8px rgba(255,62,165,0.7), 0 0 0 1px rgba(255,255,255,0.15) inset',
                   }}>
                <svg width="16" height="16" viewBox="0 0 20 20"><path d="M5 3l12 7-12 7z" fill="#fff"/></svg>
                재생하기
              </div>
              <MusicNotice className={'mt-3'}/>
            </div>
          </motion.button>
        )}

        {/* 탭 영역 — 요약에서는 버튼을 눌러야 하므로 끈다 */}
        {started && !isSummary && (
          <div
            className={'absolute inset-0 z-10'}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onPointerLeave={onPointerCancel}
            onContextMenu={e => e.preventDefault()}
          />
        )}

        {/* 상단 진행 바 + 닫기 */}
        <motion.div
          className={'absolute inset-x-0 top-0 z-20 px-3'}
          style={{ paddingTop: `calc(${RECAP_SAFE_TOP} + 8px)` }}
          animate={{ opacity: paused ? 0 : 1 }}
        >
          <div className={'flex gap-1'}>
            {Array.from({ length: total }, (_, i) => (
              <ProgressBar key={i} state={i < index ? 'done' : i > index ? 'todo' : 'active'} progress={progress}/>
            ))}
          </div>
          <div className={'mt-2.5 flex items-center gap-2'}>
            <div className={'flex-1 min-w-0'}>
              <BattleTapeHud now={beatNow} label={`${recap.studio.name} RECAP ${recap.year}`}/>
            </div>
            <button
              type={'button'}
              aria-label={muted ? '소리 켜기' : '소리 끄기'}
              onClick={toggleMute}
              className={'w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="#fff"/>
                {muted
                  ? <path d="M16 9l5 6M21 9l-5 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  : <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>}
              </svg>
            </button>
            <button
              type={'button'}
              aria-label={'닫기'}
              onClick={() => kloudNav.back()}
              className={'w-9 h-9 -mr-1 rounded-full flex items-center justify-center active:bg-white/10'}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4L14 14M14 4L4 14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ProgressBar = ({ state, progress }: { state: 'done' | 'todo' | 'active'; progress: MotionValue<number> }) => {
  const width = useTransform(progress, p => `${p * 100}%`);
  return (
    <div className={'flex-1 h-[3px] rounded-full bg-white/25 overflow-hidden'}>
      {state === 'done' && <div className={'h-full w-full bg-white'}/>}
      {state === 'active' && <motion.div className={'h-full bg-white'} style={{ width }}/>}
    </div>
  );
};

/* ───────────────────────── 요약 + 공유 ───────────────────────── */

const Summary = ({ recap, onReplay }: { recap: RecapResponse; onReplay: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
  };

  /**
   * 공유 순서: 네이티브 브릿지(shareImage) → Web Share API(파일) → 이미지 다운로드.
   * shareImage/saveImage 브릿지는 앱에 아직 없다 — 앱팀 구현 전까지는 아래 폴백으로 간다.
   */
  const share = async (mode: 'share' | 'save') => {
    if (busy) return;
    setBusy(true);
    haptic();
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const bridge = window.KloudEvent?.[mode === 'share' ? 'shareImage' : 'saveImage'];
      if (bridge) {
        bridge(JSON.stringify({ image: dataUrl, fileName: `kloud-recap-${recap.year}.png` }));
        return;
      }
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `kloud-recap-${recap.year}.png`, { type: 'image/png' });
      if (mode === 'share' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${recap.studio.name} RECAP ${recap.year}` });
        return;
      }
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = file.name;
      a.click();
    } catch {
      // 공유 시트 취소(AbortError) 포함 — 조용히 무시
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={'absolute inset-0 flex flex-col items-center px-6'}
      style={{
        paddingTop: `calc(${RECAP_SAFE_TOP} + 72px)`,
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
      }}
    >
      <h2 className={'text-[22px] font-extrabold text-center'}>
        <FlipWords text={`${recap.nickName}님의 ${recap.year},`} delay={0.2}/>
        <FlipWords text={'정말 멋졌어요'} delay={0.4} gradient/>
      </h2>
      <motion.div
        className={'mt-5'}
        style={{ width: 'min(76vw, 360px, calc((100dvh - 330px) * 0.5625))', transformPerspective: 1000 }}
        initial={{ rotateY: -30, rotateX: 20, scale: 0.7, opacity: 0 }}
        animate={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 80, damping: 14 }}
      >
        <motion.div
          animate={{ rotateY: [-4, 4, -4], rotateX: [2, -2, 2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformPerspective: 1000 }}
        >
          <RecapShareCard ref={cardRef} recap={recap}/>
        </motion.div>
      </motion.div>

      <div className={'mt-auto w-full pt-5'}>
        <NeonButton onClick={() => share('share')}>{busy ? '이미지 만드는 중…' : '공유하기'}</NeonButton>
        <div className={'mt-3 grid grid-cols-2 gap-3'}>
          <button
            type={'button'}
            onClick={() => share('save')}
            className={'h-12 rounded-2xl bg-white/10 border border-white/15 text-[15px] font-semibold active:bg-white/20'}
          >
            이미지 저장
          </button>
          <button
            type={'button'}
            onClick={onReplay}
            className={'h-12 rounded-2xl bg-white/10 border border-white/15 text-[15px] font-semibold active:bg-white/20'}
          >
            처음부터 다시
          </button>
        </div>
      </div>
    </div>
  );
};
