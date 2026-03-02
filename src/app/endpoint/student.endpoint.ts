import { Endpoint } from "@/app/endpoint/index";

export type CreateStudentParameter = {
  studioId: number;
}

export type StudentResponse = {
  id: number;
  userId: number;
  studioId: number;
}

export const CreateStudent: Endpoint<CreateStudentParameter, StudentResponse> = {
  method: 'post',
  path: '/students',
  bodyParams: ['studioId'],
}
