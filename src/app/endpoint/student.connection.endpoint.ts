import {Endpoint, SimpleResponse} from "@/app/endpoint/index";

export type CreateParentConnectionParameter = {
    studentUserId: number,
    parentPhone: string,
    parentName?: string,
}

export const CreateParentConnection: Endpoint<CreateParentConnectionParameter, SimpleResponse> = {
    method: "post",
    path: `/studentParentUserConnection`,
    bodyParams: ['studentUserId', 'parentName', 'parentPhone']
}