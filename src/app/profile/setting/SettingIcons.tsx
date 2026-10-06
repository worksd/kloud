// 설정 메뉴 아이콘 — 프로필 '내 활동'(ActivityIcons)과 같은 테마: 플랫 두 톤(밝은 면 + 짙은 포인트), 선 없음, 24×24.
import React from "react";

type IconProps = { className?: string; size?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });

/**
 * 아이콘마다 그림이 24 박스를 채우는 정도가 달라(QR·쿠폰은 꽉 차고 건물은 여백이 남음) 같은 size 인데도
 * 시각 크기가 달라 보인다. 그림 중심(cx,cy)을 24 박스 중앙으로 옮기고 배율 k 로 광학 박스를 18×18 로 통일한다.
 */
const Frame = ({ size = 24, className, k, cx = 12, cy = 12, children }: IconProps & {
  k: number; cx?: number; cy?: number; children: React.ReactNode;
}) => (
  <svg {...base(size)} className={className}>
    <g transform={`translate(12 12) scale(${k}) translate(${-cx} ${-cy})`}>{children}</g>
  </svg>
);

/** 학원 설정 — 인디고 건물. 짙은 지붕 밴드 + 밝은 창 */
export const StudioSettingFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={1} cx={12} cy={13.5}>
    <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v14H3V8Z" fill="#DCE1F7"/>
    <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2.5H3V8Z" fill="#4B58D8"/>
    <rect x="6" y="13" width="3.6" height="3.6" rx="0.9" fill="#7D89F2"/>
    <rect x="14.4" y="13" width="3.6" height="3.6" rx="0.9" fill="#7D89F2"/>
    <rect x="10" y="18" width="4" height="4" rx="1" fill="#4B58D8"/>
  </Frame>
);

/** 내 계정 — 파란 원 안의 사람 */
export const AccountFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.9}>
    <circle cx="12" cy="12" r="10" fill="#D8E9FB"/>
    <circle cx="12" cy="9.6" r="3.4" fill="#2E86DE"/>
    <path d="M4.9 19.2A8.1 8.1 0 0 1 12 15a8.1 8.1 0 0 1 7.1 4.2A9.97 9.97 0 0 1 12 22a9.97 9.97 0 0 1-7.1-2.8Z" fill="#2E86DE"/>
  </Frame>
);

/** 언어 설정 — 민트 지구. 짙은 경선·위선 */
export const LanguageFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.9}>
    <circle cx="12" cy="12" r="10" fill="#D9F3E8"/>
    <path d="M12 2c2.2 2.4 3.4 5.9 3.4 10S14.2 19.6 12 22c-2.2-2.4-3.4-5.9-3.4-10S9.8 4.4 12 2Z" fill="#2FB673"/>
    <rect x="2.6" y="10.8" width="18.8" height="2.4" rx="1.2" fill="#2FB673"/>
    <path d="M12 2c2.2 2.4 3.4 5.9 3.4 10S14.2 19.6 12 22" fill="#1E8A55"/>
  </Frame>
);

/** 알림 설정 — 노란 종 + 짙은 종추 */
export const NotificationFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.9} cx={12} cy={11}>
    <path d="M12 2.5c3.6 0 6.2 2.7 6.2 6.2 0 4 .8 5.7 1.7 6.8.5.6.1 1.5-.7 1.5H4.8c-.8 0-1.2-.9-.7-1.5.9-1.1 1.7-2.8 1.7-6.8 0-3.5 2.6-6.2 6.2-6.2Z" fill="#FFC64A"/>
    <rect x="10.8" y="1" width="2.4" height="2.6" rx="1.2" fill="#E09B12"/>
    <path d="M9.4 18.4h5.2a2.6 2.6 0 0 1-5.2 0Z" fill="#E09B12"/>
  </Frame>
);

/** 쿠폰 등록 — 바이올렛 쿠폰. 양옆 노치 + 흰 퍼센트 */
export const CouponFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.9}>
    <path d="M2 7.5A2.5 2.5 0 0 1 4.5 5h15A2.5 2.5 0 0 1 22 7.5v1.7a2.9 2.9 0 0 0 0 5.6v1.7A2.5 2.5 0 0 1 19.5 19h-15A2.5 2.5 0 0 1 2 16.5v-1.7a2.9 2.9 0 0 0 0-5.6V7.5Z" fill="#8B5CF6"/>
    <circle cx="9.6" cy="10.2" r="1.5" fill="#FFFFFF"/>
    <circle cx="14.4" cy="13.8" r="1.5" fill="#FFFFFF"/>
    <rect x="11.2" y="5.6" width="1.7" height="12.8" rx="0.85" transform="rotate(32 12 12)" fill="#FFFFFF"/>
  </Frame>
);

/** 앱 버전 — 회청색 휴대폰 + 흰 체크 */
export const VersionFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.857}>
    <rect x="5" y="1.5" width="14" height="21" rx="3" fill="#CFD6DE"/>
    <rect x="5" y="1.5" width="14" height="21" rx="3" fill="#6B7A8A" fillOpacity="0.25"/>
    <circle cx="12" cy="12" r="5.4" fill="#6B7A8A"/>
    <path d="M9.9 12.1l1.6 1.6 2.8-3" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </Frame>
);

/** 사업자 정보 — 연회색 서류 + 짙은 도장 */
export const BusinessInfoFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.9}>
    <path d="M4 4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" fill="#E4E7EB"/>
    <path d="M14.5 2 20 7.5h-4a1.5 1.5 0 0 1-1.5-1.5V2Z" fill="#B0B8C1"/>
    <rect x="7" y="9" width="7.5" height="2.1" rx="1.05" fill="#B0B8C1"/>
    <rect x="7" y="12.6" width="5" height="2.1" rx="1.05" fill="#B0B8C1"/>
    <circle cx="15.6" cy="16.8" r="4" fill="#2F3A55"/>
    <rect x="13.4" y="15.9" width="4.4" height="1.8" rx="0.9" fill="#FFFFFF"/>
  </Frame>
);

/** 약관·정책 — 청록 방패 + 흰 체크 */
export const PolicyFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.89} cx={12} cy={11.9}>
    <path d="M12 1.8l8 3v7.4c0 4.7-3.2 8.3-8 10-4.8-1.7-8-5.3-8-10V4.8l8-3Z" fill="#7DD3C8"/>
    <path d="M12 1.8l8 3v7.4c0 4.7-3.2 8.3-8 10V1.8Z" fill="#2AA894"/>
    <path d="M8.6 12.2l2.5 2.5 4.6-4.9" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
  </Frame>
);

/** 문의하기 — 코랄 말풍선 + 흰 점 세 개 */
export const InquiryFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.947}>
    <path d="M2.5 6.5A3.5 3.5 0 0 1 6 3h12a3.5 3.5 0 0 1 3.5 3.5v7A3.5 3.5 0 0 1 18 17h-5.4L7.5 21v-4H6a3.5 3.5 0 0 1-3.5-3.5v-7Z" fill="#FF6C77"/>
    <circle cx="8.2" cy="10" r="1.3" fill="#FFFFFF"/>
    <circle cx="12" cy="10" r="1.3" fill="#FFFFFF"/>
    <circle cx="15.8" cy="10" r="1.3" fill="#FFFFFF"/>
  </Frame>
);

/** 로그아웃 — 회색 문 + 붉은 화살표 */
export const LogoutFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.9} cx={12.75} cy={12}>
    <path d="M4 5a3 3 0 0 1 3-3h5a1 1 0 0 1 0 2H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5a1 1 0 0 1 0 2H7a3 3 0 0 1-3-3V5Z" fill="#B0B8C1"/>
    <rect x="11" y="11" width="9.5" height="2.2" rx="1.1" fill="#E5484D"/>
    <path d="M17.4 7.7l4 4.4-4 4.4V7.7Z" fill="#E5484D"/>
  </Frame>
);

/** QR 스캐너 — 짙은 QR 모듈 */
export const QrScannerFlatIcon = ({ className, size = 24 }: IconProps) => (
  <Frame size={size} className={className} k={0.9}>
    <rect x="2" y="2" width="9" height="9" rx="2.4" fill="#2F3A55"/>
    <rect x="5.2" y="5.2" width="2.6" height="2.6" rx="0.7" fill="#FFFFFF"/>
    <rect x="13" y="2" width="9" height="9" rx="2.4" fill="#5A6A85"/>
    <rect x="16.2" y="5.2" width="2.6" height="2.6" rx="0.7" fill="#FFFFFF"/>
    <rect x="2" y="13" width="9" height="9" rx="2.4" fill="#5A6A85"/>
    <rect x="5.2" y="16.2" width="2.6" height="2.6" rx="0.7" fill="#FFFFFF"/>
    <rect x="13" y="13" width="4" height="4" rx="1.1" fill="#2F3A55"/>
    <rect x="18" y="18" width="4" height="4" rx="1.1" fill="#2F3A55"/>
    <rect x="13" y="18" width="4" height="4" rx="1.1" fill="#8A97AB"/>
    <rect x="18" y="13" width="4" height="4" rx="1.1" fill="#8A97AB"/>
  </Frame>
);
