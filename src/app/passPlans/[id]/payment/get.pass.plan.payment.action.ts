import { api } from "@/app/api.client";

export const getPassPlanPaymentAction = async ({passPlanId} : {passPlanId: number}) => {
  return await api.payment.get({itemId: passPlanId, item: 'pass-plan'})
}