'use server'

import { api } from "@/app/api.client";

// 정기결제(구독) 생성 — POST /subscription. canSubscribe=true 상품을 billing으로 결제할 때 이 경로를 탄다.
// 상품은 paymentId(결제번호)로 정해진다. item·itemId 는 서버가 받지 않는다(2026-10-07 — 없으면 PAYMENT_ID_REQUIRED 로 거절되던 버그 수정).
// firstLessonId: 시작 회차 지정(선택) — 서버가 읽지 않으면 무시된다
export const createSubscriptionAction = async ({ billingKey, paymentId, firstLessonId }: {
  billingKey: string;
  paymentId: string;
  firstLessonId?: number;
}) => {
  return await api.subscription.create({ billingKey, paymentId, firstLessonId });
};
