import { UserStatus } from "@/entities/user/user.status";
import { Endpoint, NoParameter } from "@/app/endpoint/index";
import { number } from "zod";
import { GetNotificationResponse } from "@/app/endpoint/notifications.endpoint";

export type GetUserParameter = {
  id: number
}

export type GetUserResponse = {
  id: number
  email: string
  name: string
  status: UserStatus
}

export const GetUser: Endpoint<GetUserParameter, GetUserResponse> = {
  method: 'get',
  path: (e) => `/users/${e.id}`,
  pathParams: ['id']
}

export type GetMeResponse = {
  id: number
  email: string
  name: string
  notifications: GetNotificationResponse[];

}

export const GetMe: Endpoint<NoParameter, GetMeResponse> = {
  method: 'get',
  path: `users/me`
}