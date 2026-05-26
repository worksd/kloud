'use server'

import { api } from "@/app/api.client";
import { CreateManualPaymentRecordRequest } from "@/app/endpoint/payment.record.endpoint";
import { revalidateTag } from "next/cache";

export const createManualPaymentRecordAction = async (request: CreateManualPaymentRecordRequest) => {
  const res = await api.paymentRecord.createManual(request)
  if ('paymentId' in res && request.item === 'lesson') {
    // @ts-ignore - Next.js 16 type definition issue
    revalidateTag(`lesson:${request.itemId}`);
  }
  return res;
}
