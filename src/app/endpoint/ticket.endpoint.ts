import { Endpoint, NoParameter } from "@/app/endpoint/index";
import { GetStudioResponse, IdParameter } from "@/app/endpoint/studio.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export type TicketListResponse = {
  tickets: [TicketResponse];
};

export type TicketResponse = {
  id: number;
  studio?: GetStudioResponse;
  lesson?: GetLessonResponse;
}

export type CreateTicketParameter = {
  paymentId: string;
  lessonId: number;
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
  bodyParams: ['paymentId', 'lessonId']
}
