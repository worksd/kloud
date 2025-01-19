import { Endpoint, NoParameter } from "@/app/endpoint/index";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export type IdParameter = {
    id: number;
};

export type GetStudioResponse = {
    id: number;
    name: string;
    address?: string;
    roadAddress?: string;
    profileImageUrl: string;
    coverImageUrl?: string;
    phone?: string;
    youtubeUrl?: string;
    businessRegistrationNumber?: string;
    eCommerceRegNumber?: string;
    educationOfficeRegNumber?: string;
    representative?: string;
    instagramAddress?: string;
    lessons?: GetLessonResponse[];
    follow?: StudioFollowResponse;
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
