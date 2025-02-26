import { Endpoint } from "@/app/endpoint/index";
import { LessonListResponse } from "@/app/endpoint/lesson.endpoint";

export type GetNotificationResponse = {
  id: number;
  title: string;
  body: string;
  thumbnailUrl: string;
  createdAt: string;
  bold: string;
  route: string;
  isRead: boolean;
}

export type ListNotificationResponse = {
  notifications: GetNotificationResponse[];
}

export const GetNotifications: Endpoint<object, ListNotificationResponse> = {
  method: "get",
  path: `/notifications`,
}