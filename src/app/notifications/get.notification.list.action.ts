'use server'
import { api } from "@/app/api.client";

export const getNotificationListAction = async () => {
  return await api.notification.get({})
}