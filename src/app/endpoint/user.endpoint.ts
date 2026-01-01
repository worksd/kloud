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
  type?: UserType
  status: UserStatus
  loginType: 'Email' |'Kakao' | 'Google' | 'Apple' | 'Phone'
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
  email: string
  status: UserStatus
  type: UserType
  profileImageUrl?: string
  name?: string
  nickName?: string
  phone?: string
  studio?: GetStudioResponse
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

export const GetMe: Endpoint<object, GetMeResponse> = {
  method: 'get',
  path: `/users/me`,
}

export type PatchUserParameter = {
  id: number
  name?: string
  nickName?: string
  type: UserType
  phone?: string
  birth?: string
  gender?: string
  refundAccountNumber?: string
  refundAccountBank?: string
  refundDepositor?: string
  emailVerified?: boolean,
  country?: string,
  password?: string,
  countryCode?: string,
  code?: string,
}

export type CreateParentConnectionParameter = {
  studentUserId: number,
  parentPhone: string,
  parentName?: string,
}

export const UpdateUser: Endpoint<PatchUserParameter, GetUserResponse> = {
  method: 'patch',
  path: (e) => `/users/${e.id}`,
  bodyParams: ['name', 'nickName', 'type', 'phone', 'birth', 'gender', 'refundAccountNumber', 'refundAccountBank', 'refundDepositor', 'emailVerified', 'country', 'password', 'countryCode', 'code'],
  pathParams: ['id']
}

export const DeleteUser: Endpoint<SignOutParameter, SimpleResponse> = {
  method: 'delete',
  path: `/users`,
  bodyParams: ['reason']
}

export const CheckDuplicate: Endpoint<{ nickName?: string, phone?: string}, SimpleResponse> = {
  method: 'post',
  path: '/users/duplicate-check',
  bodyParams: ['nickName', 'phone']
}

export const CreateParentConnection: Endpoint<CreateParentConnectionParameter, SimpleResponse> = {
  method: "post",
  path: (e) => `/users/${e.studentUserId}/connect-parent`,
  bodyParams: ['studentUserId', 'parentName', 'parentPhone']
}