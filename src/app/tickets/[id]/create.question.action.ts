'use server'
import { api } from "@/app/api.client";
import { CreateQuestionParameter } from "@/app/endpoint/question.endpoint";

export const createQuestionAction = async (req: CreateQuestionParameter) => {
  return await api.question.create(req)
}