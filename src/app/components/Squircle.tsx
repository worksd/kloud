import React from 'react';

/**
 * 스퀘어클(squircle) 썸네일 프레임 — iOS 앱 아이콘처럼 모서리가 연속적으로 이어지는 둥근 사각형.
 *
 * border-radius로는 코너가 원호로 뚝 끊겨서 그 느낌이 안 난다. SVG 경로를 mask로 씌워 모양을 낸다.
 * mask를 못 쓰는 환경에서는 rounded 클래스가 그대로 보여 일반 둥근 사각형으로 degrade된다.
 */
const SQUIRCLE_PATH =
  "M 0,50 C 0,10 10,0 50,0 C 90,0 100,10 100,50 C 100,90 90,100 50,100 C 10,100 0,90 0,50 Z";

const MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='${SQUIRCLE_PATH.replace(/ /g, '%20')}' fill='%23000'/%3E%3C/svg%3E")`;

export function Squircle({ size, className = '', children }: {
  /** 정사각형 한 변 (px) */
  size: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[28%] ${className}`}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: MASK,
        maskImage: MASK,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    >
      {children}
    </div>
  );
}
