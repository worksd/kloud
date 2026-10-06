// 프로필 '내 활동' 아이콘 — 플랫 두 톤(밝은 면 + 짙은 포인트), 선 없음, 24×24. 참고: Downloads/ic_ticket.svg·ic_receipt.svg 스타일
import React from "react";

type IconProps = { className?: string; size?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });

/** 수강 내역 — 코랄 티켓. 양옆 노치 + 왼쪽 스텁을 점선으로 절취 */
export const TicketFlatIcon = ({ className, size = 24 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M1 7a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v2.2a2.8 2.8 0 0 0 0 5.6V17a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-2.2a2.8 2.8 0 0 0 0-5.6V7Z" fill="#FF6C77"/>
    <path d="M8.5 7v10" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 2.6"/>
    <path d="M14.4 9.2c.3-.5 1-.5 1.2 0l.6 1.1c.1.2.3.3.5.4l1.2.2c.6.1.8.8.4 1.2l-.9.9c-.1.2-.2.4-.2.6l.1 1.3c.1.6-.5 1-1 .8l-1.1-.5a1 1 0 0 0-.7 0l-1.1.5c-.5.2-1.1-.2-1-.8l.1-1.3c0-.2-.1-.4-.2-.6l-.9-.9c-.4-.4-.2-1.1.4-1.2l1.2-.2c.2 0 .4-.2.5-.4l.6-1.1Z" fill="#AE2731"/>
  </svg>
);

/** 패스권 — 네이비 블랙카드. 위 밴드는 더 짙게, 골드 IC칩 + 반투명 라인 (멤버십 느낌) */
export const PassFlatIcon = ({ className, size = 24 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="1" y="4" width="22" height="16" rx="3" fill="#2F3A55"/>
    <path d="M1 7a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v2.5H1V7Z" fill="#1C2438"/>
    <rect x="4" y="12.5" width="6" height="4" rx="1.2" fill="#F2C86B"/>
    <rect x="12.5" y="13.2" width="7.5" height="2.4" rx="1.2" fill="#FFFFFF" fillOpacity="0.55"/>
  </svg>
);

/** 결제내역 — 민트 영수증. 상단 헤더 바 + 라인 3개 */
export const ReceiptFlatIcon = ({ className, size = 24 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 4h18v15a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V4Z" fill="#D9F3E8"/>
    <rect x="2" y="2" width="20" height="4" rx="1" fill="#2FB673"/>
    <rect x="6" y="9" width="12" height="2.5" rx="1" fill="#63B58F"/>
    <rect x="6" y="13" width="12" height="2.5" rx="1" fill="#63B58F"/>
    <rect x="6" y="17" width="7" height="2.5" rx="1" fill="#63B58F"/>
  </svg>
);

/** 예약 결제 — 인디고 달력 + 오른쪽 아래 시계 */
export const ScheduledPaymentFlatIcon = ({ className, size = 24 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="2" y="4" width="20" height="17" rx="3" fill="#ECEEFF"/>
    <path d="M2 7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3H2V7Z" fill="#7D89F2"/>
    <rect x="6" y="2" width="2.4" height="4" rx="1.2" fill="#4B58D8"/>
    <rect x="15.6" y="2" width="2.4" height="4" rx="1.2" fill="#4B58D8"/>
    <rect x="5.5" y="12.5" width="3" height="3" rx="0.8" fill="#C3C9F8"/>
    <rect x="10.5" y="12.5" width="3" height="3" rx="0.8" fill="#C3C9F8"/>
    <circle cx="17" cy="17" r="4.5" fill="#4B58D8"/>
    <path d="M17 14.8V17l1.5 1.1" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** 대관 예약 — 오렌지 문. 짙은 문틀 + 흰 손잡이 */
export const RoomBookingFlatIcon = ({ className, size = 24 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v17H4V5Z" fill="#E0862E"/>
    <path d="M7 6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16H7V6Z" fill="#FFB347"/>
    <rect x="3" y="20.5" width="18" height="2" rx="1" fill="#C96E1E"/>
    <circle cx="14.3" cy="13" r="1.3" fill="#FFFFFF"/>
  </svg>
);

/** 프로필 편집 — 메모지(연회색) 위에 코랄 펜이 대각선으로 걸친 형태 */
export const PencilFlatIcon = ({ className, size = 24 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="15" height="18" rx="3" fill="#E4E7EB"/>
    <rect x="6.5" y="7.5" width="8" height="2" rx="1" fill="#B0B8C1"/>
    <rect x="6.5" y="11.5" width="5" height="2" rx="1" fill="#B0B8C1"/>
    <g transform="translate(0.6 -1.4) rotate(45 16 15)">
      <path d="M13.9 6.6a2.1 2.1 0 0 1 2.1-2.1a2.1 2.1 0 0 1 2.1 2.1v13.3h-4.2V6.6Z" fill="#FF6C77"/>
      <rect x="13.9" y="8.2" width="4.2" height="1.3" fill="#FFFFFF" fillOpacity="0.55"/>
      <path d="M13.9 19.9h4.2L16 23l-2.1-3.1Z" fill="#AE2731"/>
    </g>
  </svg>
);

/** 설정 — 톱니 기어. 짙은 톱니 + 밝은 원판 + 흰 중심 */
export const GearFlatIcon = ({ className, size = 24 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <g fill="#6B7A8A">
      <rect x="9.7" y="1.5" width="4.6" height="21" rx="1.6"/>
      <rect x="9.7" y="1.5" width="4.6" height="21" rx="1.6" transform="rotate(45 12 12)"/>
      <rect x="9.7" y="1.5" width="4.6" height="21" rx="1.6" transform="rotate(90 12 12)"/>
      <rect x="9.7" y="1.5" width="4.6" height="21" rx="1.6" transform="rotate(135 12 12)"/>
    </g>
    <circle cx="12" cy="12" r="7.2" fill="#9DA8B3"/>
    <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
  </svg>
);

/** 오른쪽 화살표 */
export const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
