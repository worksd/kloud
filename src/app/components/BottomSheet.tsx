'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// 공용 바텀시트 — 열릴 때 slideUp, 닫힐 때 slideDown(+배경 fadeOut) 후 onClose 호출.
// 핸들/타이틀 영역을 아래로 드래그하면 시트가 손가락을 따라오고, 충분히 내리면 닫힌다(아니면 스냅백).
// 사용법: 부모는 조건부 렌더로 마운트하고, onClose에서 상태를 비워 언마운트한다.
//   const ref = useRef<BottomSheetHandle>(null);
//   {open && <BottomSheet ref={ref} onClose={() => setOpen(false)} title="...">...</BottomSheet>}
// 프로그램적으로 닫을 땐 ref.current?.close() — 애니메이션을 태운 뒤 onClose가 불린다.
// 백드롭 탭도 같은 경로. body 스크롤 잠금은 시트가 알아서 건다.

export type BottomSheetHandle = { close: () => void };

const CLOSE_MS = 200;
/** 이만큼(px) 이상 내리면 닫힘 */
const DISMISS_DISTANCE = 90;
/** 놓는 순간 속도(px/ms)가 이보다 크면 거리와 무관하게 닫힘 (플릭) */
const DISMISS_VELOCITY = 0.5;

export const BottomSheet = forwardRef<BottomSheetHandle, {
  /** 닫힘 애니메이션이 끝난 뒤 호출 — 여기서 부모가 언마운트한다 */
  onClose: () => void;
  /** 핸들 아래 굵은 타이틀. 커스텀 헤더를 쓰려면 생략하고 children으로 */
  title?: string;
  children: React.ReactNode;
  /** true면 백드롭 탭/드래그/close() 무시 — 제출 처리 중 잠금용 */
  locked?: boolean;
  /** 시트 최대 높이(vh). 내용이 넘치면 내부에서 스크롤할 것 (children에 overflow-y-auto) */
  maxHeightVh?: number;
  zIndex?: number;
}>(function BottomSheet({ onClose, title, children, locked = false, maxHeightVh = 72, zIndex = 60 }, ref) {
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // 드래그 상태 — 리렌더 없이 transform 직접 조작 (매 프레임 setState 방지)
  const drag = useRef<{ startY: number; lastY: number; lastT: number; delta: number; active: boolean }>({
    startY: 0, lastY: 0, lastT: 0, delta: 0, active: false,
  });

  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const closingRef = useRef(false);

  const close = () => {
    if (lockedRef.current || closingRef.current) return;
    closingRef.current = true;
    // 드래그로 이미 내려간 위치에서 이어서 내려가도록 inline transform 제거 후 keyframe에 맡긴다
    const el = sheetRef.current;
    if (el && drag.current.delta > 0) {
      el.style.transition = `transform ${CLOSE_MS}ms ease-in`;
      el.style.transform = 'translateY(100%)';
      backdropRef.current?.parentElement?.classList.add('pointer-events-none');
      if (backdropRef.current) {
        backdropRef.current.style.transition = `opacity ${CLOSE_MS}ms ease-out`;
        backdropRef.current.style.opacity = '0';
      }
      setTimeout(onClose, CLOSE_MS);
      return;
    }
    setClosing(true);
    setTimeout(onClose, CLOSE_MS);
  };
  useImperativeHandle(ref, () => ({ close }));

  // 열려있는 동안 body 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── 핸들 드래그 ──
  const onDragStart = (e: React.PointerEvent) => {
    if (lockedRef.current || closingRef.current) return;
    drag.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, delta: 0, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const el = sheetRef.current;
    if (el) el.style.transition = 'none';
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const delta = Math.max(0, e.clientY - drag.current.startY); // 위로는 안 끌림
    drag.current.delta = delta;
    drag.current.lastY = e.clientY;
    drag.current.lastT = e.timeStamp;
    const el = sheetRef.current;
    if (el) el.style.transform = `translateY(${delta}px)`;
    // 내려간 만큼 배경도 옅게
    if (backdropRef.current && el) {
      const h = el.offsetHeight || 1;
      backdropRef.current.style.opacity = String(Math.max(0.25, 1 - delta / h));
    }
  };

  const onDragEnd = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const { delta, lastT } = drag.current;
    const dt = Math.max(1, e.timeStamp - lastT + 1);
    const velocity = (e.clientY - drag.current.lastY) / dt + delta / Math.max(1, e.timeStamp - lastT + 300); // 대략적 플릭 판정 보조
    const el = sheetRef.current;
    if (delta > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
      close();
      return;
    }
    // 스냅백
    drag.current.delta = 0;
    if (el) {
      el.style.transition = 'transform 180ms ease-out';
      el.style.transform = 'translateY(0)';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'opacity 180ms ease-out';
      backdropRef.current.style.opacity = '1';
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center ${
        closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
      style={{ zIndex }}
      onClick={close}
    >
      <div ref={backdropRef} className={'absolute inset-0 bg-black/40'}/>
      <div
        ref={sheetRef}
        className={`relative w-full max-w-[640px] bg-white rounded-t-[24px] pt-2 flex flex-col ${
          closing ? 'animate-[slideDown_200ms_ease-in_forwards]' : 'animate-[slideUp_200ms_ease-out]'
        }`}
        style={{ maxHeight: `${maxHeightVh}vh`, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 존 — 핸들 + 타이틀. 콘텐츠 스크롤과 충돌하지 않도록 여기서만 드래그를 받는다 */}
        <div
          className={'shrink-0 cursor-grab active:cursor-grabbing select-none'}
          style={{ touchAction: 'none' }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div className={'mx-auto my-2 w-10 h-1 rounded-full bg-[#E5E7EB]'}/>
          {title && <p className={'px-6 pt-2 pb-3 text-[18px] font-bold text-black'}>{title}</p>}
        </div>
        {children}
      </div>
    </div>
  );
});
