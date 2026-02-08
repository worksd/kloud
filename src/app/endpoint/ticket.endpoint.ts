import { Endpoint, NoParameter, SimpleResponse } from "@/app/endpoint/index";
import { GetStudioResponse, IdParameter } from "@/app/endpoint/studio.endpoint";
import { GetLessonResponse, GetLessonGroupResponse } from "@/app/endpoint/lesson.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { GetArtistResponse } from "@/app/endpoint/artist.endpoint";
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
  qrCodeUrl?: string;
  isRefundable?: boolean;
  ticketType?: 'default' | 'premium' | 'membership';
  ticketTypeLabel?: string;
}

export type GetInviteTicketParameter = {
  inviteCode: string;
}

export type CreateTicketParameter = {
  paymentId: string;
  lessonId: number;
  status: string;
  depositor?: string;
  passId?: number;
}

export type CheckDupliateTicketParameter = {
  userId: number;
  lessonId: number;
}

export type GetTicketParameter = {
  id: number;
  isParent: boolean;
}

export type RevertUsagePassesParameter = {
  ticketId: number;
  reason: string;
  requester: string;
}

export type ToUsedParameter = {
  id: number;
  expiredAt?: string;
  lessonId?: number;
}

export type ListTicketsParameter = {
  page?: number;
}

export const ListTickets: Endpoint<ListTicketsParameter, TicketListResponse> = {
  method: 'get',
  path: `/tickets`,
  queryParams: ['page'],
};

export const GetTicket: Endpoint<GetTicketParameter, TicketResponse> = {
  method: 'get',
  path: (e) => `/tickets/${e.id}`,
  queryParams: ['isParent']
}

export const GetInviteTicket: Endpoint<GetInviteTicketParameter, TicketResponse> = {
  method: 'get',
  path: (e) => `/tickets/${e.inviteCode}/one-time`,
  pathParams: ['inviteCode']
}

export const CreateTicket: Endpoint<CreateTicketParameter, TicketResponse> = {
  method: 'post',
  path: `/tickets`,
  bodyParams: ['paymentId', 'lessonId', 'status', 'depositor', 'passId']
}

export const CheckDuplicateTicket: Endpoint<CheckDupliateTicketParameter, TicketResponse> = {
  method: 'get',
  path: '/tickets/duplicate-check',
  queryParams: ['userId', 'lessonId']
}

export const DeleteTicket: Endpoint<RevertUsagePassesParameter, SimpleResponse> = {
  method: 'delete',
  path: (e) => `/tickets/${e.ticketId}`,
  pathParams: ['ticketId'],
  bodyParams: ['reason', 'requester']
}

export const ToUsed: Endpoint<ToUsedParameter, TicketResponse> = {
  method: 'post',
  path: (e) => `/tickets/${e.id}/use`,
  pathParams: ['id'],
  bodyParams: ['expiredAt', 'lessonId']
}

// Lesson Group Ticket types
export type LessonGroupTicketLessonResponse = {
  id: number;
  status: string;
  lessonId: number;
  lessonTitle: string;
  startDate: string;
}

export type LessonGroupTicketResponse = {
  id: number;
  status: string;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  remainingCount?: number;
  lessonGroup?: {
    id: number;
    title: string;
    thumbnailUrl?: string;
    studioId?: number;
    level?: string;
    price?: number;
    genre?: string;
    description?: string;
    status?: string;
    days?: string[];
    startTime?: string;
    duration?: number;
    paymentCount?: number;
    artist?: GetArtistResponse;
    currentStudentCount?: number;
  };
  tickets?: LessonGroupTicketLessonResponse[];
}

export type LessonGroupTicketListResponse = {
  lessonGroupTickets: LessonGroupTicketResponse[];
}

export type GetLessonGroupTicketParameter = {
  id: number;
}

// Lesson Group Ticket endpoints
export const ListLessonGroupTickets: Endpoint<ListTicketsParameter, LessonGroupTicketListResponse> = {
  method: 'get',
  path: `/lesson-group-tickets`,
  queryParams: ['page'],
};

export const GetLessonGroupTicket: Endpoint<GetLessonGroupTicketParameter, LessonGroupTicketResponse> = {
  method: 'get',
  path: (e) => `/lesson-group-tickets/${e.id}`,
}

export const DeleteLessonGroupTicket: Endpoint<RevertUsagePassesParameter, SimpleResponse> = {
  method: 'delete',
  path: (e) => `/lesson-group-tickets/${e.ticketId}`,
  pathParams: ['ticketId'],
  bodyParams: ['reason', 'requester']
}

export function convertStatusToMessage({status}: { status: string }): StringResourceKey {
  if (status === 'Paid') return 'purchase_complete'
  else if (status == 'Cancelled') return 'purchase_cancel'
  else if (status == 'Used') return 'used_complete'
  else if (status == 'Pending') return 'purchase_pending'
  else if (status == 'Expired') return 'used_complete'
  else return 'empty'
}