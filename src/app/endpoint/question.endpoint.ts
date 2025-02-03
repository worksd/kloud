import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

export type CreateQuestionParameter = {
  lessonId: number
  studioId: number
  body: string
  title: string
}

export const CreateQuestion: Endpoint<CreateQuestionParameter, SimpleResponse> = {
  method: "post",
  path: `/questions`,
  bodyParams: ['body', 'studioId', 'lessonId', 'title']
}