'use server'
import { api } from "@/app/api.client";

export const getRefundPreview = async ({paymentId} : {paymentId: string}) => {
  const res = await api.paymentRecord.getRefundPreview({paymentId});
  return res;
}


