'use server'

import { api } from "@/app/api.client";

// 정기결제(구독) 생성 — POST /subscription. canSubscribe=true 상품을 billing으로 결제할 때 이 경로를 탄다.
export const createSubscriptionAction = async ({ item, itemId, billingKey }: {
  item: string;
  itemId: number;
  billingKey: string;
}) => {
  return await api.subscription.create({ item, itemId, billingKey });
};
