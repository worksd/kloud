'use server'
import { api } from "@/app/api.client";

export const requestRefund = async ({paymentId, reason}: {paymentId: string, reason: string}) => {
  const res = await api.paymentRecord.requestRefund({paymentId, reason, requester: 'CUSTOMER'});
  return res;
}

