'use server'

import { api } from "@/app/api.client";

// 정기결제(구독) 생성 — POST /subscription. canSubscribe=true 상품을 billing으로 결제할 때 이 경로를 탄다.
// firstLessonId: 정기수업 시작 회차 지정 — 결제 화면에 띄운 회차부터 잡는다 (lesson-group만 유효)
export const createSubscriptionAction = async ({ item, itemId, billingKey, firstLessonId }: {
  item: string;
  itemId: number;
  billingKey: string;
  firstLessonId?: number;
}) => {
  return await api.subscription.create({ item, itemId, billingKey, firstLessonId });
};
