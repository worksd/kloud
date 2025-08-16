'use server'
import { api } from "@/app/api.client";

export const getHomeAction = async () => {
  return api.home.getHome({})
}