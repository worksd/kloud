'use server';

import { api } from "@/app/api.client";

/**
 * 관리자(파트너)가 결제 취소 — DELETE /paymentRecords/:paymentId/cancel, requester='ADMIN'.
 * 키오스크 카드결제 건은 즉시 취소되지 않고 CancelPending(환불 대기)으로 남을 수 있다 — 응답 status를 그대로 반영할 것.
 */
export async function cancelPaymentAction(paymentId: string) {
  return await api.paymentRecord.requestRefund({
    paymentId,
    reason: '관리자 취소',
    requester: 'ADMIN',
  });
}
