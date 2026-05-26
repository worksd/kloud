'use server'
import { api } from "@/app/api.client";

export const requestRefund = async ({paymentId, reason}: {paymentId: string, reason: string}) => {
  return await api.paymentRecord.requestRefund({paymentId, reason, requester: 'CUSTOMER'});
}

