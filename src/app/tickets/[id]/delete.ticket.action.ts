'use server'
import { api } from "@/app/api.client";
import { revalidateTag } from "next/cache";

export const deleteTicketAction = async ({ticketId}: {ticketId: number}) => {
  const res = await api.ticket.delete({ticketId, reason: '수강생 요청에 의한 취소', requester: 'CUSTOMER'})
  // 어떤 lesson의 캐시인지 ticketId만으로는 모름 → family 태그로 invalidate.
  // @ts-ignore - Next.js 16 type definition issue
  if (!res || 'id' in res) revalidateTag('lesson');
  return res;
}

