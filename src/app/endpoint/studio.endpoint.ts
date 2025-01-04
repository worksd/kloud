import { Endpoint, NoParameter } from "@/app/endpoint/index";

export type IdParameter = {
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
    lessons: LessonResponse[];
    follow?: StudioFollowResponse;
};

export type LessonResponse = {
    id: number;
    thumbnailUrl: string;
    description: string;
    title: string;
    startTime: string;
    studio: {
        id: number;
        name: string;
        profileImageUrl: string;
    };
};

export type StudioFollowResponse = {
    id: number;
}

export const GetStudio: Endpoint<IdParameter, GetStudioResponse> = {
    method: "get",
    path: (e) => `/studios/${e.id}`,
};

export type GetStudioListResponse = {
    studios: GetStudioResponse[]
}

export const ListStudios: Endpoint<NoParameter, GetStudioListResponse> = {
    method: 'get',
    path: `/studios`
}
