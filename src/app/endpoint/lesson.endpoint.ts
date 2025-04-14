import { Endpoint } from "@/app/endpoint/index";
import { LessonLevels, LessonTypes } from "@/entities/lesson/lesson";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";

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
    startTime?: string;
    saleDate?: string;
    duration?: number;
    type?: LessonTypes;
    price?: number;
    level?: LessonLevels;
    artist?: GetArtistResponse;
    studio?: GetStudioResponse;
    currentStudentCount?: number;
    room?: GetStudioRoomResponse;
    ticket?: TicketResponse;
    extraArtists?: GetArtistResponse[];
    dday?: string;
};

export type GetStudioRoomResponse = {
    id: number;
    maxNumber: number;
    name: string;
};
export type LessonListResponse = {
    lessons: GetLessonResponse[]
}

export type GetArtistResponse = {
    id: number;
    name: string;
    nickName: string;
    profileImageUrl: string;
    phone: string;
    instagramAddress: string;
}

export type GetStudioLessonParameter = {
    studioId: number;
    page: number;
    type: string;
}

export type GetBandResponse = {
    title: string;
    type: BandType;
    lessons: GetLessonResponse[];
}

export type GetBandListResponse = {
    bands: GetBandResponse[]
}

export type BandType = 'Default' | 'Recommendation'

export const GetLesson: Endpoint<GetLessonParameter, GetLessonResponse> = {
    method: "get",
    path: (e) => `/lessons/${e.id}`,
};

export const GetPopularLessons: Endpoint<object, LessonListResponse> = {
    method: "get",
    path: `/lessons/popular`,
}

export const ListStudioLessons: Endpoint<GetStudioLessonParameter, LessonListResponse> = {
    method: 'get',
    path: `/lessons`,
    queryParams: ['studioId', 'page', 'type']
}

export const ListOngoingLessons: Endpoint<GetStudioLessonParameter, LessonListResponse> = {
    method: 'get',
    path: `/lessons/ongoing`,
    queryParams: ['studioId']
}

export const ListStageBands: Endpoint<object, GetBandListResponse> = {
    method: 'get',
    path: `/lessons/stage`,
}

export enum LessonStatus {
    Pending = '공개 예정', // 수업을 공개하기 전 상태
    NotForSale = '판매 예정', // 공개 이후 판매하기 전 상태
    Recruiting = '예약 중', // 예약을 진행 중인 상태
    Ready = '수업 예정', // 모집이 마감된 상태
    Cancelled = '수업 취소', // 수업이 취소된 상태
    Completed = '수업 종료', // 수업이 완료된 상태
}