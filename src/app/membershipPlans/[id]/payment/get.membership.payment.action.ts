import { api } from "@/app/api.client";

export const getMembershipPaymentAction = async ({membershipPlanId} : {membershipPlanId: number}) => {
  return await api.payment.get({itemId: membershipPlanId, item: 'membership-plan'})
}

