import { Endpoint } from "@/app/endpoint/index";

export type GetStudioParameter = {
    id: number;
};

export type GetStudioResponse = {
    id: number;
    name: string;
    address: string;
    profileImageUrl: string;
    coverImageUrl?: string;
    phone: string;
    youtubeUrl?: string;
    instagramAddress?: string;
    lessons: StudioLessonData[];
};

export type StudioLessonData = {
    id: number;
    thumbnailUrl: string;
    title: string;
    startTime: string;
    studio: {
        id: number;
        name: string;
        profileImageUrl: string;
    };
};

export const GetStudio: Endpoint<GetStudioParameter, GetStudioResponse> = {
    method: "get",
    path: (e) => `/studios/${e.id}`,
};
