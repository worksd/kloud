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
    status?: string;
    limit?: number;
    title?: string;
    thumbnailUrl?: string;
    startTime?: string;
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
}

export type GetBandResponse = {
    title: string;
    type: BandType;
    lessons: GetLessonResponse[];
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
    queryParams: ['studioId', 'page']
}