import { Endpoint, NoParameter } from "@/app/endpoint/index";
import { GetStudioResponse, IdParameter } from "@/app/endpoint/studio.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { UserResponse } from "@/app/endpoint/auth.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";

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
}

export type CreateTicketParameter = {
  paymentId: string;
  lessonId: number;
  status: string;
  depositor?: string;
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
  bodyParams: ['paymentId', 'lessonId', 'status', 'depositor']
}

export function convertStatusToMessage({status} : {status: string}) {
  if (status === 'Paid') return '구매완료'
    else if (status == 'Cancelled') return '구매취소'
    else if (status == 'Pending') return '결제대기'
  else return ''
}