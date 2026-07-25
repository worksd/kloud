import React from 'react';

// 키오스크 홈(무인/admin) 액션 카드 공통 아이콘. 라이트 카드는 stroke color, 결제(다크 카드)는 흰 카드+어두운 점.

// 수업 출석 체크 — QR 스캔
export const KioskLessonAttendanceIcon = ({ size = 40, color = '#4E5968' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="6" y="6" width="12" height="12" rx="2.5" stroke={color} strokeWidth="2.4" />
    <rect x="22" y="6" width="12" height="12" rx="2.5" stroke={color} strokeWidth="2.4" />
    <rect x="6" y="22" width="12" height="12" rx="2.5" stroke={color} strokeWidth="2.4" />
    <rect x="24" y="24" width="4.5" height="4.5" rx="1" fill={color} />
    <rect x="30.5" y="30.5" width="3.5" height="3.5" rx="1" fill={color} />
  </svg>
);

// 스튜디오 출석 — 수강생 방문(사람)
export const KioskStudioAttendanceIcon = ({ size = 40, color = '#4E5968' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="14" r="6.5" stroke={color} strokeWidth="2.4" />
    <path d="M8 33c1-6.5 6-11 12-11s11 4.5 12 11" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

// 연습실 예약 — 달력 + 체크
export const KioskRoomBookingIcon = ({ size = 40, color = '#4E5968' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="7" y="9" width="26" height="24" rx="3.5" stroke={color} strokeWidth="2.4" />
    <path d="M7 16h26M14 6.5v5M26 6.5v5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M15.5 24.5l3 3 6-6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 수업 결제 — 카드(다크 카드용: 흰 카드 + 어두운 점)
export const KioskPaymentIcon = ({ width = 40, height = 52, fill = 'white', dot = '#1E2124' }: { width?: number; height?: number; fill?: string; dot?: string }) => (
  <svg width={width} height={height} viewBox="0 0 54 70" fill="none">
    <rect x="2" y="2" width="50" height="66" rx="8" fill={fill} />
    <circle cx="42" cy="14" r="3.5" fill={dot} />
  </svg>
);
