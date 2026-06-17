import { Endpoint } from "@/app/endpoint/index";

// 바우처(쿠폰) — v1은 패스플랜 바우처만 지원. redeem 시 무결제 패스권 발급.
export type VoucherStatus = 'Active' | 'Used' | 'Expired' | 'Cancelled';

export type VoucherResponse = {
  id: number;
  code: string;
  name: string;
  passPlan: {
    id: number;
    name: string;
  } | null;
  expiresAt: string;          // YYYY-MM-DD
  createdAt: string;          // yyyy.MM.dd HH:mm (KST)
  status: VoucherStatus;
  usedAt: string | null;      // yyyy.MM.dd HH:mm | null
  usedByUser: {
    id: number;
    name?: string;
    nickName?: string;
    profileImageUrl?: string;
  } | null;
}

// POST /vouchers/:code/redemptions — 사용
// 본인이 등록(자기 자신을 위한 redeem) 시엔 userId를 동봉.
export type RedeemVoucherRequest = {
  code: string;
  userId?: number;
  name?: string;
  phone?: string;
}

export const RedeemVoucher: Endpoint<RedeemVoucherRequest, VoucherResponse> = {
  method: 'post',
  path: (e) => `/vouchers/${e.code}/redemptions`,
  bodyParams: ['userId', 'name', 'phone'],
}
