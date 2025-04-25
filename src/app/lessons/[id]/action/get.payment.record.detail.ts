'use server'
import { api } from "@/app/api.client";

export const getPaymentRecordDetail = async ({paymentId} : {paymentId: string}) => {
  const res = await api.paymentRecord.get({paymentId});
  return res;
}