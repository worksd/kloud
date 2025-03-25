'use server'
import { PassStatus } from "@/app/endpoint/pass.endpoint";
import { api } from "@/app/api.client";

export const createPassAction = async ({passPlanId, paymentId, status, depositor}: {
  passPlanId: number,
  paymentId: string,
  status: PassStatus,
  depositor?: string
}) => {
  return await api.pass.create({
    passPlanId,
    paymentId,
    status,
    depositor
  })
}