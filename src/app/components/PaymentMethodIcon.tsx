// 결제수단 아이콘 — 카드사/은행 로고(BankOrCardIcon)가 있으면 그걸, 없으면 결제 방식별 플랫 두 톤 아이콘.
// methodType 우선, 없으면 라벨 키워드로 판별. 스타일은 프로필 '내 활동' 아이콘(ActivityIcons)과 동일.
import React from "react";
import { BANK_ICONS, pickBankKey } from "@/app/components/Bank";
import { PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { PassFlatIcon, ScheduledPaymentFlatIcon } from "@/app/profile/ActivityIcons";

type IconProps = { size?: number; className?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });

/** 계좌이체 — 은행 건물. 슬레이트 블루 지붕 + 밝은 기둥 */
export const BankTransferFlatIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 2.5 21 7.5H3L12 2.5Z" fill="#5B6B8A"/>
    <rect x="3" y="7.5" width="18" height="2" rx="1" fill="#5B6B8A"/>
    <rect x="5" y="10.5" width="2.6" height="7" rx="1" fill="#C9D3E3"/>
    <rect x="10.7" y="10.5" width="2.6" height="7" rx="1" fill="#C9D3E3"/>
    <rect x="16.4" y="10.5" width="2.6" height="7" rx="1" fill="#C9D3E3"/>
    <rect x="3" y="18.5" width="18" height="3" rx="1.2" fill="#5B6B8A"/>
  </svg>
);

/** 무료 — 선물 상자. 코랄 상자 + 짙은 리본 */
export const FreeFlatIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="9" width="18" height="12" rx="2.5" fill="#FF8A80"/>
    <rect x="2" y="6" width="20" height="4.5" rx="1.5" fill="#FF6C77"/>
    <rect x="10.6" y="6" width="2.8" height="15" fill="#B5473F"/>
    <path d="M12 6c-1.2-2.4-3.2-3.4-4.6-2.6C6.3 4 6.6 5.6 8 6h4Zm0 0c1.2-2.4 3.2-3.4 4.6-2.6C17.7 4 17.4 5.6 16 6h-4Z" fill="#B5473F"/>
  </svg>
);

/** 관리자 등록 / 현장·현금 — 지폐 두 장. 민트 */
export const CashFlatIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="4" y="4.5" width="18" height="11" rx="2" fill="#63B58F"/>
    <rect x="2" y="8.5" width="18" height="11" rx="2" fill="#2FB673"/>
    <circle cx="11" cy="14" r="2.8" fill="#D9F3E8"/>
    <rect x="4.2" y="10.6" width="1.8" height="1.8" rx="0.5" fill="#D9F3E8"/>
    <rect x="16" y="15.6" width="1.8" height="1.8" rx="0.5" fill="#D9F3E8"/>
  </svg>
);

/** 쿠폰·바우처 — 앰버 쿠폰. 노치 + 점선 */
export const CouponFlatIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M2 7.5A2.5 2.5 0 0 1 4.5 5h15A2.5 2.5 0 0 1 22 7.5v1.7a2.8 2.8 0 0 0 0 5.6v1.7a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16.5v-1.7a2.8 2.8 0 0 0 0-5.6V7.5Z" fill="#F5B63F"/>
    <path d="M15.5 7v10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.1 2.5"/>
    <rect x="5.5" y="9.5" width="6" height="2" rx="1" fill="#D9931B"/>
    <rect x="5.5" y="12.8" width="4" height="2" rx="1" fill="#D9931B"/>
  </svg>
);

/** 간편결제(네이버·카카오·토스페이 등 로고 없을 때) — 스마트폰 + 체크. 스카이 */
export const EasyPayFlatIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="6" y="2" width="12" height="20" rx="3" fill="#4FB3E8"/>
    <rect x="7.5" y="4.5" width="9" height="13" rx="1.5" fill="#DDF1FB"/>
    <path d="M9.7 11l1.7 1.7 3-3.2" fill="none" stroke="#1F86BF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="10.5" y="19" width="3" height="1.4" rx="0.7" fill="#DDF1FB"/>
  </svg>
);

/** 일반 카드(로고 미매칭) — 회색 카드 */
export const GenericCardFlatIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="1" y="4" width="22" height="16" rx="3" fill="#C5CCD4"/>
    <path d="M1 7a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v2.5H1V7Z" fill="#8B98A8"/>
    <rect x="4" y="12.5" width="6" height="4" rx="1.2" fill="#FFFFFF"/>
    <rect x="12.5" y="13.2" width="7.5" height="2.4" rx="1.2" fill="#FFFFFF" fillOpacity="0.7"/>
  </svg>
);

// 라벨 키워드 → 방식 (methodType이 없을 때 폴백)
const guessMethodType = (label: string): PaymentMethodType | undefined => {
  const l = label.toLowerCase().replace(/\s+/g, '');
  if (/계좌|무통장|이체|transfer/.test(l)) return 'account_transfer';
  if (/무료|free/.test(l)) return 'free';
  if (/패스|pass/.test(l)) return 'pass';
  if (/관리자|현장|현금|수동|admin|cash/.test(l)) return 'admin';
  if (/정기|구독|billing|subscription/.test(l)) return 'billing';
  if (/쿠폰|바우처|voucher|coupon/.test(l)) return 'voucher';
  if (/네이버|naver/.test(l)) return 'naver_pay';
  if (/카카오페이|kakaopay/.test(l)) return 'kakao_pay';
  if (/토스페이|tosspay/.test(l)) return 'toss_pay';
  if (/간편|easy/.test(l)) return 'easy_pay';
  if (/해외|foreign|visa|master|amex|jcb|unionpay/.test(l)) return 'foreign_card';
  if (/카드|card|credit/.test(l)) return 'credit';
  return undefined;
};

export const PaymentMethodIcon = ({ methodType, label, size = 20, className }: {
  methodType?: PaymentMethodType | null;
  label?: string | null;
  size?: number;
  className?: string;
}) => {
  const name = label ?? '';
  // 1) 카드사/은행 로고
  const bankKey = pickBankKey(name);
  if (bankKey) {
    const Logo = BANK_ICONS[bankKey];
    return <Logo style={{ width: size, height: 'auto', flexShrink: 0 }} className={className}/>;
  }
  // 2) 결제 방식별 플랫 아이콘
  const type = methodType ?? guessMethodType(name);
  switch (type) {
    case 'account_transfer': return <BankTransferFlatIcon size={size} className={className}/>;
    case 'free': return <FreeFlatIcon size={size} className={className}/>;
    case 'pass': return <PassFlatIcon size={size} className={className}/>;
    case 'admin': return <CashFlatIcon size={size} className={className}/>;
    case 'billing': return <ScheduledPaymentFlatIcon size={size} className={className}/>;
    case 'voucher': return <CouponFlatIcon size={size} className={className}/>;
    case 'easy_pay':
    case 'naver_pay':
    case 'kakao_pay':
    case 'toss_pay': return <EasyPayFlatIcon size={size} className={className}/>;
    case 'credit':
    case 'foreign_card': return <GenericCardFlatIcon size={size} className={className}/>;
    default:
      return name ? <GenericCardFlatIcon size={size} className={className}/> : null;
  }
};
