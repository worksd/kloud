import { Endpoint, NoParameter } from "@/app/endpoint/index";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";

export type IdParameter = {
    id: number;
};

export type GetStudioListParameter = {
    hasPass: boolean;
}

export type GetStudioResponse = {
    id: number;
    name: string;
    address?: string;
    roadAddress?: string;
    profileImageUrl: string;
    coverImageUrl?: string;
    phone?: string;
    youtubeUrl?: string;
    businessName?: string;
    bank?: string;
    accountNumber?: string;
    businessRegistrationNumber?: string;
    eCommerceRegNumber?: string;
    educationOfficeRegNumber?: string;
    representative?: string;
    depositor?: string;
    instagramAddress?: string;
    lessons?: GetLessonResponse[];
    follow?: StudioFollowResponse;
    announcements?: GetAnnouncementResponse[];
    passPlans?: GetPassPlanResponse[];
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

export const ListStudios: Endpoint<GetStudioListParameter, GetStudioListResponse> = {
    method: 'get',
    path: `/studios`,
    queryParams: ['hasPass']
}
