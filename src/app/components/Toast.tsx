'use client';

import React, { useEffect, useState } from 'react';

// 공용 토스트 — 등장(toastIn)/퇴장(toastOut) 애니메이션 + 자동 dismiss.
//  - message: 표시 내용(문자열 또는 스타일된 노드)
//  - onDone: 퇴장 애니메이션까지 끝난 뒤 호출(호출부에서 상태를 null 처리 → 언마운트)
//  - duration: 등장 후 유지 시간(ms). 이후 퇴장 애니메이션 시작
//  - className/style: pill(안쪽 박스) 스타일. 위치는 wrapperClassName/wrapperStyle로.
export function Toast({
  message,
  onDone,
  duration = 2500,
  className = 'px-4 py-2.5 rounded-full bg-black/85 text-white text-[13px] font-medium text-center shadow-lg',
  style,
  wrapperClassName = 'fixed left-1/2 -translate-x-1/2 bottom-28 z-[100]',
  wrapperStyle,
}: {
  message: React.ReactNode;
  onDone: () => void;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setClosing(true), duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    // 바깥: 위치 + 가운데 정렬(정적 transform). 안쪽: 애니메이션 transform(translateY) — X 중앙정렬과 충돌 방지.
    <div className={`${wrapperClassName} pointer-events-none`} style={wrapperStyle}>
      <div
        className={`${className} ${closing ? 'animate-[toastOut_200ms_ease-in_forwards]' : 'animate-[toastIn_250ms_ease-out]'}`}
        onAnimationEnd={() => { if (closing) onDone(); }}
      >
        {message}
      </div>
    </div>
  );
}
