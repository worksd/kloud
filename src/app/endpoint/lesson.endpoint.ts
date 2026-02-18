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
    startDate?: string; // yyyy-MM-dd HH:mm 형식
    saleDate?: string;
    duration?: number;
    type?: LessonType;
    price?: number;
    level?: string;
    artists?: GetArtistResponse[];
    studio?: GetStudioResponse;
    currentStudentCount?: number;
    room?: GetStudioRoomResponse;
    ticket?: TicketResponse;
    buttonTitle: string;
    buttonRoute: string;
    buttons: GetLessonButtonResponse[];
    paymentType?: 'Subscription' | 'Default'
    days?: string;
    description?: string;
    genre?: string;
    formattedDate?: GetFormattedDateResponse;
    isAdmin?: boolean;
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
    type?: 'default' | 'subscription';
    date?: string; // yyyy-MM-dd 형식
    startDate?: string; // yyyy-MM-dd HH:mm 형식
    startTime?: string; // HH:mm 형식
    artist?: GetArtistResponse;
}

export type GetLabelResponse = {
    isEnded: boolean;
    type?: LessonType;
    genre?: string;
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

export const CheckCapacity: Endpoint<CheckTicketCapacityParameter, SimpleResponse> = {
    method: 'get',
    path: (e) => `/lessons/${e.lessonId}/capacity-check`
}

// LessonGroup (정기수업) 관련 타입
export type GetLessonGroupParameter = {
    id: number;
}

export type GetLessonGroupLessonsParameter = {
    id: number;
    year?: number;
    month?: number;
    page?: number;
}

export type GetLessonGroupResponse = {
    id: number;
    title: string;
    thumbnailUrl?: string;
    level?: string;
    price?: number;
    unitPrice?: number;
    limit: number;
    genre?: string;
    description?: string;
    status: string;
    studio?: GetStudioResponse;
    artist?: GetArtistResponse;
    studioRoom?: GetStudioRoomResponse;
    days?: string[];
    startTime?: string;
    duration?: number;
    generateAheadDays?: number;
    webSiteUrl?: string;
    ticket?: LessonGroupTicketResponse;
    currentStudentCount: number;
    paymentCount?: number;
    lastLessonDate?: string;
    buttons?: GetLessonButtonResponse[];
}

export type LessonGroupTicketResponse = {
    id: number;
    status: string;
    remainingCount?: number;
    startDate?: string;
    endDate?: string;
}

export const GetLessonGroup: Endpoint<GetLessonGroupParameter, GetLessonGroupResponse> = {
    method: 'get',
    path: (e) => `/lesson-groups/${e.id}`,
}

export const GetLessonGroupLessons: Endpoint<GetLessonGroupLessonsParameter, LessonListResponse> = {
    method: 'get',
    path: (e) => `/lesson-groups/${e.id}/lessons`,
    queryParams: ['year', 'month', 'page'],
}

export enum LessonStatus {
    Pending = 'Pending',
    NotForSale = 'NotForSale',
    PreSale = 'PreSale',
    Recruiting = 'Recruiting',
    Ready = 'Ready',
    Cancelled = 'Cancelled',
    Completed = 'Completed',
    SaleClosed = 'SaleClosed',
}

export const LessonStatusDisplay: Record<string, string> = {
    Pending: '공개 예정',
    NotForSale: '판매 예정',
    PreSale: '선예약 중',
    Recruiting: '예약 중',
    Ready: '수업 예정',
    Cancelled: '수업 취소',
    Completed: '수업 종료',
    SaleClosed: '결제 마감',
};