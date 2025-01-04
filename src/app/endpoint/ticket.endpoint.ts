import { Endpoint, NoParameter } from "@/app/endpoint/index";
import { IdParameter } from "@/app/endpoint/studio.endpoint";

export type TicketListResponse = {
  tickets: [TicketResponse];
};

export type TicketResponse = {
  id: number;
}

export const ListTickets: Endpoint<NoParameter, TicketListResponse> = {
  method: 'get',
  path: `/tickets`,
};

export const GetTicket: Endpoint<IdParameter, TicketResponse> = {
  method: 'get',
  path: (e) => `/tickets/${e.id}`,
}
