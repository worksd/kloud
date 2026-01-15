'use server'

import { api } from "@/app/api.client";
import { CreateManualPaymentRecordRequest } from "@/app/endpoint/payment.record.endpoint";

export const createManualPaymentRecordAction = async (request: CreateManualPaymentRecordRequest) => {
  return await api.paymentRecord.createManual(request)
}
