import { Endpoint, NoParameter } from "@/app/endpoint/index";
import { GetStudioResponse, IdParameter } from "@/app/endpoint/studio.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { StringResourceKey } from "@/shared/StringResource";

export type TicketListResponse = {
  tickets: [TicketResponse];
};

export type TicketResponse = {
  id: number;
  status: string;
  paymentId: string;
  studio?: GetStudioResponse;
  lesson?: GetLessonResponse;
  user?: GetUserResponse;
  createdAt?: string;
  rank?: string;
}

export type CreateTicketParameter = {
  paymentId: string;
  lessonId: number;
  status: string;
  depositor?: string;
  passId?: number;
}

export const ListTickets: Endpoint<NoParameter, TicketListResponse> = {
  method: 'get',
  path: `/tickets`,
};

export const GetTicket: Endpoint<IdParameter, TicketResponse> = {
  method: 'get',
  path: (e) => `/tickets/${e.id}`,
}

export const CreateTicket: Endpoint<CreateTicketParameter, TicketResponse> = {
  method: 'post',
  path: `/tickets`,
  bodyParams: ['paymentId', 'lessonId', 'status', 'depositor', 'passId']
}

export function convertStatusToMessage({status}: { status: string }): StringResourceKey {
  if (status === 'Paid') return 'purchase_complete'
  else if (status == 'Cancelled') return 'purchase_cancel'
  else if (status == 'Used') return 'used_complete'
  else if (status == 'Pending') return 'purchase_pending'
  else return 'empty'
}