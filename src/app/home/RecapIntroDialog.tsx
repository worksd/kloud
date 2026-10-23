'use client'

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { hideRecapIntro, shouldShowRecapIntro } from "@/app/recap/recap.storage";
import { FlipWords, haptic, MusicNotice, NeonButton, RECAP_SAFE_TOP, RecapBackdrop, TapeLabel, useWebGLAvailable } from "@/app/recap/RecapUi";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";

// three 번들은 다이얼로그가 뜰 때만 받는다
const RecapCanvas = dynamic(() => import("@/app/recap/three/RecapScenes"), { ssr: false });

/**
 * 홈 진입 시 연말 리캡 인트로 — 풀스크린 오버레이 + 3D 네온 코어.
 * 노출 규칙은 recap.storage 참고.
 *
 * 지금은 어디에도 마운트하지 않는다 — 리캡 진입은 마이페이지 배너로만 (2026-10-23).
 * 다시 켤 때는 홈 page.tsx 에 붙이고, EventScreen 이 이게 뜨는 진입에서 이벤트 다이얼로그를 건너뛰게 해야 한다(네이티브 다이얼로그가 겹침).
 */
export const RecapIntroDialog = ({ year, nickName, studio }: { year: number; nickName: string; studio: { id: number; name: string } }) => {
  const [open, setOpen] = useState(false);
  const webgl = useWebGLAvailable();

  useEffect(() => {
    if (!shouldShowRecapIntro(year)) return;
    const t = setTimeout(() => {
      setOpen(true);
      haptic();
    }, 350);
    return () => clearTimeout(t);
  }, [year]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = (forever: boolean) => {
    hideRecapIntro(year, forever);
    setOpen(false);
  };

  const start = () => {
    haptic();
    close(true);
    kloudNav.push(KloudScreen.Recap(studio.id));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={'fixed inset-0 z-[200] overflow-hidden text-white'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          role={'dialog'}
          aria-modal={'true'}
        >
          <RecapBackdrop/>

          {/* 3D 무대 — 화면 위쪽 2/3 */}
          <motion.div
            className={'absolute inset-x-0 bottom-[36%]'}
            style={{ top: RECAP_SAFE_TOP }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            
            {webgl && <RecapCanvas scene={'intro'} year={year} studioName={studio.name}/>}
          </motion.div>

          <button
            type={'button'}
            aria-label={'닫기'}
            onClick={() => close(false)}
            className={'absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition-transform'}
            style={{ top: `calc(${RECAP_SAFE_TOP} + 8px)` }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          {/* 카피 + 버튼 — 3D 로 기울어진 채 날아와 자리 잡는다 */}
          <div className={'absolute inset-x-0 bottom-0 px-6'} style={{ perspective: 1000, paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
            <motion.div
              initial={{ rotateX: 35, y: 120, opacity: 0 }}
              animate={{ rotateX: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 90, damping: 16 }}
            >
              <TapeLabel delay={0.7}>
                <span className={'inline-block max-w-[70vw] truncate align-bottom'}>● REC · {studio.name} {year}</span>
              </TapeLabel>

              <h1 className={'mt-4 text-[30px] leading-[1.25] font-extrabold tracking-[-0.03em]'}>
                <FlipWords text={`${nickName}님,`} delay={0.8}/>
                <br/>
                <FlipWords text={'올 한 해 정말 고생했어요'} delay={1.0} gradient/>
              </h1>
              <motion.p
                className={'mt-3 text-[16px] text-white/70 leading-[1.5]'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                {year}년, {studio.name}에서 춘 모든 순간을 돌아볼까요?
              </motion.p>

              <motion.div
                className={'mt-8'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.75, type: 'spring', stiffness: 140, damping: 14 }}
              >
                <NeonButton onClick={start}>▶ 내 {year} 돌아보기</NeonButton>
                <MusicNotice className={'mt-3'}/>
                <div className={'mt-2 flex items-center justify-center gap-4 text-[14px] text-white/50'}>
                  <button type={'button'} onClick={() => close(false)} className={'py-2 active:text-white/80'}>나중에 볼게요</button>
                  <span className={'w-px h-3 bg-white/20'}/>
                  <button type={'button'} onClick={() => close(true)} className={'py-2 active:text-white/80'}>다시 보지 않기</button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
