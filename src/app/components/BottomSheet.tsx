'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

// 공용 바텀시트 — 열릴 때 slideUp, 닫힐 때 slideDown(+배경 fadeOut) 후 onClose 호출.
// 사용법: 부모는 조건부 렌더로 마운트하고, onClose에서 상태를 비워 언마운트한다.
//   const ref = useRef<BottomSheetHandle>(null);
//   {open && <BottomSheet ref={ref} onClose={() => setOpen(false)} title="...">...</BottomSheet>}
// 프로그램적으로 닫을 땐 ref.current?.close() — 애니메이션을 태운 뒤 onClose가 불린다.
// 백드롭 탭도 같은 경로. body 스크롤 잠금은 시트가 알아서 건다.

export type BottomSheetHandle = { close: () => void };

const CLOSE_MS = 200;

export const BottomSheet = forwardRef<BottomSheetHandle, {
  /** 닫힘 애니메이션이 끝난 뒤 호출 — 여기서 부모가 언마운트한다 */
  onClose: () => void;
  /** 핸들 아래 굵은 타이틀. 커스텀 헤더를 쓰려면 생략하고 children으로 */
  title?: string;
  children: React.ReactNode;
  /** true면 백드롭 탭/close() 무시 — 제출 처리 중 잠금용 */
  locked?: boolean;
  /** 시트 최대 높이(vh). 내용이 넘치면 내부에서 스크롤할 것 (children에 overflow-y-auto) */
  maxHeightVh?: number;
  zIndex?: number;
}>(function BottomSheet({ onClose, title, children, locked = false, maxHeightVh = 72, zIndex = 60 }, ref) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (locked || closing) return;
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

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center ${
        closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
      style={{ zIndex }}
      onClick={close}
    >
      <div className={'absolute inset-0 bg-black/40'}/>
      <div
        className={`relative w-full max-w-[640px] bg-white rounded-t-[24px] pt-2 flex flex-col ${
          closing ? 'animate-[slideDown_200ms_ease-in_forwards]' : 'animate-[slideUp_200ms_ease-out]'
        }`}
        style={{ maxHeight: `${maxHeightVh}vh`, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={'mx-auto my-2 w-10 h-1 rounded-full bg-[#E5E7EB] shrink-0'}/>
        {title && <p className={'px-6 pt-2 pb-3 text-[18px] font-bold text-black shrink-0'}>{title}</p>}
        {children}
      </div>
    </div>
  );
});
