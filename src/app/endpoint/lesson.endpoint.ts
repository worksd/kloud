import { Endpoint } from "@/app/endpoint/index";
import { LessonLevels, LessonTypes } from "@/entities/lesson/lesson";

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
    level: LessonLevels;
    artist: {
        id: number;
        name: string;
        nickName: string;
        profileImageUrl: string;
        phone: string;
        instagramAddress: string;
    };
    studio: {
        id: number;
        name: string;
        address: string;
        profileImageUrl: string;
        coverImageUrl: string;
        phone: string;
        youtubeUrl: string;
        instagramAddress: string;
        lessons: [
            {
                id: number;
                thumbnailUrl: string;
                title: string;
                startTime: string;
                studio: {
                    id: number;
                    name: string;
                    profileImageUrl: string;
                };
            }
        ];
    };
    currentStudentCount: number;
    room: {
        id: number;
        maxNumber: number;
        name: string;
    };
    ticket: {
        id: number;
    };
};

export const GetLesson: Endpoint<GetLessonParameter, GetLessonResponse> = {
    method: "get",
    path: (e) => `/lessons/${e.id}`,
};
