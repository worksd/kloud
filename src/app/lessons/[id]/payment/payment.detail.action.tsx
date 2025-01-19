'use server'

import { api } from "@/app/api.client";

export const getPaymentDetail = async ({id} : {id: number}) => {
  return await api.lesson.getPayment({id: id})
}