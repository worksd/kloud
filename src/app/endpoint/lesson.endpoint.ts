import { Endpoint } from "@/app/endpoint/index";
import { LessonLevels, LessonTypes } from "@/entities/lesson/lesson";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export type GetLessonParameter = {
    id: number;
};

export type GetLessonResponse = {
    id: number;
    code: string;
    title: string;
    thumbnailUrl: string;
    startTime: string;
    duration: number;
    type: LessonTypes;
    price: number;
    level: LessonLevels;
    artist: {
        id: number;
        name: string;
        nickName: string;
        profileImageUrl: string;
        phone: string;
        instagramAddress: string;
    };
    studio: GetStudioResponse;
    currentStudentCount: number;
    room: {
        id: number;
        maxNumber: number;
        name: string;
    };
    ticket?: GetLessonTicketResponse;
};

export type GetLessonTicketResponse = {
    id: number;
};

export type ListLessonsResponse = {
    lessons: GetLessonResponse[]
}

export const GetLesson: Endpoint<GetLessonParameter, GetLessonResponse> = {
    method: "get",
    path: (e) => `/lessons/${e.id}`,
};

export const GetPopularLessons: Endpoint<object, ListLessonsResponse> = {
    method: "get",
    path: `/lessons/popular`,
}

export const GetLessonPayment: Endpoint<GetLessonParameter, GetLessonResponse> = {
     method: "get",
    path: (e) => `/lessons/${e.id}/payment`,
}