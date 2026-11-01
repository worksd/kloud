'use server'

import { api } from "@/app/api.client";

export const getPaymentAction = async ({
  item,
  id,
  paymentId,
  includePrivatePricePolicies,
  targetUserId,
  date,
  startTime,
  endTime,
}: {
  /** paymentId 로 열 때(미납 결제)는 item/id 를 보내지 않는다 */
  item?: string
  id?: number
  /** 선생성된 결제번호('LP…') — 서버가 준 route 의 값 그대로 */
  paymentId?: string
  /** 결제 요청 알림톡 링크의 쿼리를 그대로 전달 */
  includePrivatePricePolicies?: boolean
  targetUserId?: number
  date?: string
  startTime?: string
  endTime?: string
}) => {
  return await api.payment.get({ item, itemId: id, paymentId, includePrivatePricePolicies, targetUserId, date, startTime, endTime })
}
