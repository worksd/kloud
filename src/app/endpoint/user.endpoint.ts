import { UserStatus } from "@/entities/user/user.status";
import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { UserType } from "@/entities/user/user.type";
import { GetLessonResponse, LessonListResponse } from "@/app/endpoint/lesson.endpoint";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

export type GetUserParameter = {
  id: number
}

export type GetUserResponse = {
  id: number
  email: string
  name?: string
  nickName?: string
  status: UserStatus
  profileImageUrl?: string
  deactivatedAt: string
  phone?: string
  passes?: GetPassResponse[]
  refundAccountNumber?: string
  refundAccountBank?: string
  refundAccountDepositor?: string
  emailVerified?: boolean
}

export type GetMeResponse = {
  id: number
  lessons?: GetLessonResponse[],
  announcements: GetAnnouncementResponse[],
}

export type GetAnnouncementResponse = {
  id: number
  title: string
  body: string
  studio: GetStudioResponse,
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
  nickName?: string
  type: UserType
  phone?: string
  rrn?: string
  refundAccountNumber?: string
  refundAccountBank?: string
  refundDepositor?: string
  emailVerified?: boolean
}

export const UpdateUser: Endpoint<PatchUserParameter, GetUserResponse> = {
  method: 'patch',
  path: (e) => `/users/${e.id}`,
  bodyParams: ['name', 'nickName', 'type', 'phone', 'rrn', 'refundAccountNumber', 'refundAccountBank', 'refundDepositor', 'emailVerified'],
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

export const CheckDuplicate: Endpoint<{ nickName: string}, SimpleResponse> = {
  method: 'post',
  path: '/users/duplicate-check',
  bodyParams: ['nickName']
}