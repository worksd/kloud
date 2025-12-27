import { Endpoint, SimpleResponse } from '@/app/endpoint/index';
import { LessonType } from '@/entities/lesson/lesson';
import { GetStudioResponse } from '@/app/endpoint/studio.endpoint';
import { TicketResponse } from '@/app/endpoint/ticket.endpoint';
import { GetArtistResponse } from '@/app/endpoint/artist.endpoint';

export type GetLessonParameter = {
    id: number;
};

export type GetLessonResponse = {
    id: number;
    code?: string;
    status?: LessonStatus;
    limit?: number;
    title?: string;
    thumbnailUrl?: string;
    date?: string;
    saleDate?: string;
    duration?: number;
    type?: LessonType;
    price?: number;
    level?: string;
    artist?: GetArtistResponse;
    studio?: GetStudioResponse;
    currentStudentCount?: number;
    room?: GetStudioRoomResponse;
    ticket?: TicketResponse;
    extraArtists?: GetArtistResponse[];
    dday?: string;
    buttonTitle: string;
    buttonRoute: string;
    buttons: GetLessonButtonResponse[];
    paymentType?: 'Subscription' | 'Default'
    days?: string;
    description?: string;
    genre?: string;
    formattedDate?: GetFormattedDateResponse;
};

export type GetFormattedDateResponse = {
  type: 'oneTime' | 'subscription';
  date?: string;
  weekday?: string;
  startTime: string;
  endTime: string;
  daysOfWeek?: string;
}

export type GetLessonButtonResponse = {
    title: string;
    route?: string;
    activateAt: string;
}

export type GetStudioRoomResponse = {
    id: number;
    maxNumber: number;
    name: string;
};
export type LessonListResponse = {
    lessons: GetBandLessonResponse[]
}

export type GetStudioLessonParameter = {
    studioId: number;
    page: number;
    all: boolean;
}

export type GetStudioLessonsByDateParameter = {
    studioId: number;
    date: string;
    isAdmin: boolean;
}

export type GetBandResponse = {
    title: string;
    type: BandType;
    lessons: GetBandLessonResponse[];
}

export type GetLessonListResponse = {
  lessons: GetLessonResponse[];
}

export type GetBandLessonResponse = {
    id: number;
    title: string;
    status: LessonStatus;
    description: string;
    studioImageUrl: string;
    studioName: string;
    thumbnailUrl: string;
    label: GetLabelResponse;
}

export type GetLabelResponse = {
    isEnded: boolean;
    type?: LessonType;
    genre?: string;
}

export type GetBandListResponse = {
    bands: GetBandResponse[]
}

export type CheckTicketCapacityParameter = {
    lessonId: number;
}

export type JumbotronResponse = {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    studioImageUrl: string;
}

export type BandType = 'Default' | 'Recommendation'

export const GetLesson: Endpoint<GetLessonParameter, GetLessonResponse> = {
    method: "get",
    path: (e) => `/lessons/${e.id}`,
};

export const GetJumbotronLessons: Endpoint<object, LessonListResponse> = {
    method: "get",
    path: `/lessons/jumbotrons`,
}

export const ListStudioLessons: Endpoint<GetStudioLessonParameter, LessonListResponse> = {
    method: 'get',
    path: `/lessons`,
    queryParams: ['studioId', 'page', 'all']
}

export const ListOngoingLessons: Endpoint<GetStudioLessonParameter, LessonListResponse> = {
    method: 'get',
    path: `/lessons/ongoing`,
    queryParams: ['studioId', 'all']
}

export const ListStudioLessonsByDate: Endpoint<GetStudioLessonsByDateParameter, GetLessonListResponse> = {
    method: 'get',
    path: `/lessons`,
    queryParams: ['studioId', 'date', 'isAdmin']
}

export const ListStageBands: Endpoint<object, GetBandListResponse> = {
    method: 'get',
    path: `/lessons/stage`,
}

export const CheckCapacity: Endpoint<CheckTicketCapacityParameter, SimpleResponse> = {
    method: 'get',
    path: (e) => `/lessons/${e.lessonId}/capacity-check`
}

export enum LessonStatus {
    Pending = '공개 예정', // 수업을 공개하기 전 상태
    NotForSale = '판매 예정', // 공개 이후 판매하기 전 상태
    PreSale = '선예약 중', // 선예약 패스권 이용자만 예약 가능한 상태
    Recruiting = '예약 중', // 예약을 진행 중인 상태
    Ready = '수업 예정', // 모집이 마감된 상태
    Cancelled = '수업 취소', // 수업이 취소된 상태
    Completed = '수업 종료', // 수업이 완료된 상태
}