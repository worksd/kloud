import { Endpoint, NoParameter, SimpleResponse } from "@/app/endpoint/index";
import { GetStudioResponse, IdParameter } from "@/app/endpoint/studio.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { StringResourceKey } from "@/shared/StringResource";

export type TicketListResponse = {
  tickets: [TicketResponse];
};

export type TicketPaymentRecordSummary = {
  id?: number;
  paymentId?: string;
  status?: string;
  /** 결제수단 한국어 라벨 (예: '신용카드', '계좌이체', '현장 결제', '패스권') */
  method?: string;
  amount?: number;
  productName?: string;
  depositor?: string | null;
  createdAt?: string;
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
  rankType?: string;
  qrCodeUrl?: string;
  isRefundable?: boolean;
  ticketType?: 'default' | 'premium' | 'membership';
  ticketTypeLabel?: string;
  paymentRecord?: TicketPaymentRecordSummary;
  studentId?: number;
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

export type GetTicketByTokenParameter = {
  id: number;
  token: string;
}

// QR 스캔값(willUseTicketId=:id, token=쿼리)으로 티켓+lesson 조회 — 키오스크 수업 출석 체크용
export const GetTicketByToken: Endpoint<GetTicketByTokenParameter, TicketResponse> = {
  method: 'get',
  path: (e) => `/tickets/${e.id}`,
  queryParams: ['token']
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

export type PostponeTicketParameter = {
  id: number;
}

/**
 * 회차 미루기 응답 — 옮겨진 회차 정보.
 * 서버가 어떤 모양으로 내려주든 안전하게 다루려고 전부 optional로 둔다.
 * (성공 판정은 에러 코드(isGuinnessErrorCase) 부재로 한다)
 */
export type PostponeTicketResponse = {
  /** 옮겨진 뒤의 수강권 id. 서버가 새 티켓을 만들면 값이 바뀔 수 있다. */
  id?: number;
  /** 옮겨간 회차 */
  lesson?: GetLessonResponse;
  /** 남은 미루기 가능 횟수 — 내려주면 성공 안내에 덧붙인다. */
  remainingPostponeCount?: number;
}

/**
 * POST /tickets/:id/postpone — 수강생 본인이 못 오는 회차를 다음 회차로 옮긴다.
 * 아직 시작하지 않은 회차만 가능하고, 가능 횟수는 결제 1건 기준으로 가격 정책의 postponeLimit이 정한다
 * (정책에 없으면 학원 기본 설정). 제약 위반은 LESSON_POSTPONE_* 에러 코드로 내려온다.
 */
export const PostponeTicket: Endpoint<PostponeTicketParameter, PostponeTicketResponse> = {
  method: 'post',
  path: (e) => `/tickets/${e.id}/postpone`,
  pathParams: ['id'],
}

export const ToUsed: Endpoint<ToUsedParameter, TicketResponse> = {
  method: 'post',
  path: (e) => `/tickets/${e.id}/use`,
  pathParams: ['id'],
  bodyParams: ['expiredAt', 'lessonId']
}

export function convertStatusToMessage({status}: { status: string }): StringResourceKey {
  if (status === 'Paid') return 'purchase_complete'
  else if (status == 'Cancelled') return 'purchase_cancel'
  else if (status == 'Used') return 'used_complete'
  else if (status == 'Pending') return 'purchase_pending'
  else if (status == 'Expired') return 'used_complete'
  else return 'empty'
}