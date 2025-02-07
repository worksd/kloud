import { UserStatus } from "@/entities/user/user.status";
import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { UserType } from "@/entities/user/user.type";
import { GetLessonResponse, LessonListResponse } from "@/app/endpoint/lesson.endpoint";

export type GetUserParameter = {
  id: number
}

export type GetUserResponse = {
  id: number
  email: string
  name?: string
  status: UserStatus
  profileImageUrl?: string
  deactivatedAt: string
}

export type GetMeResponse = {
  id: number
  lessons?: GetLessonResponse[],
}

export type SignOutParameter = {
  reason: string
}

export const GetUser: Endpoint<GetUserParameter, GetUserResponse> = {
  method: 'get',
  path: (e) => `/users/${e.id}`,
  pathParams: ['id']
}

export type PatchUserParameter = {
  id: number
  name?: string
  type: UserType
}

export const UpdateUser: Endpoint<PatchUserParameter, GetUserResponse> = {
  method: 'patch',
  path: (e) => `/users/${e.id}`,
  bodyParams: ['name', 'type'],
  pathParams: ['id']
}

export const Me: Endpoint<object, GetMeResponse> = {
  method: 'get',
  path: '/users/me',
}

export const DeleteUser: Endpoint<SignOutParameter, SimpleResponse> = {
  method: 'delete',
  path: `/users`,
  bodyParams: ['reason']
}