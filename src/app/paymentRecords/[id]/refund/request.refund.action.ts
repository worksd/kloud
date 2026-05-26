'use server'
import { api } from "@/app/api.client";
import { revalidateTag } from "next/cache";

export const requestRefund = async ({paymentId, reason}: {paymentId: string, reason: string}) => {
  const res = await api.paymentRecord.requestRefund({paymentId, reason, requester: 'CUSTOMER'});
  // 환불 → ticket 취소되며 lesson 자리 상태 변경. paymentId만으론 lesson 못 잡으니 family 태그.
  // @ts-ignore - Next.js 16 type definition issue
  if ('paymentId' in res) revalidateTag('lesson');
  return res;
}

