import { ListNotificationResponse } from "@/app/endpoint/notification.endpoint";

export async function getNewNotifications(): Promise<ListNotificationResponse> {
  return {
    notifications: []
  };
}