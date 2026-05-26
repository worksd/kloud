'use server'
import { api } from "@/app/api.client";
import { PaymentDiscount } from "@/app/endpoint/payment.endpoint";
import { revalidateTag } from "next/cache";

export const billingKeyPaymentAction = async ({item, itemId, billingKey, paymentId, targetUserId, discounts}: {
  item: string
  itemId: number,
  billingKey: string
  paymentId: string
  targetUserId?: number
  discounts?: PaymentDiscount[]
}) => {
  const res = await api.payment.billingKey({item, itemId, billingKey, paymentId, targetUserId, discounts})
  if ('success' in res && res.success && item === 'lesson') {
    // @ts-ignore - Next.js 16 type definition issue
    revalidateTag(`lesson:${itemId}`);
  }
  return res;
}
