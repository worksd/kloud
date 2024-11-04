import { UserStatus } from "@/entities/user/user.status";
import { Endpoint } from "@/app/endpoint/index";

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