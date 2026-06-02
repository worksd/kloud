import { Endpoint } from "@/app/endpoint/index";
import { LessonListResponse } from "@/app/endpoint/lesson.endpoint";

export type GetNotificationResponse = {
  id: number;
  title: string;
  body: string;
  thumbnailUrl: string;
  createdAt: string;
  diffStamp?: string;
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

// 알림 설정 — 사용자별 토픽 토글. 현재 공지사항/이벤트 2개 항목.
export type NotificationSettingsResponse = {
  announcement: boolean;
  event: boolean;
}

export type UpdateNotificationSettingsRequest = {
  announcement?: boolean;
  event?: boolean;
}

export const GetNotificationSettings: Endpoint<object, NotificationSettingsResponse> = {
  method: 'get',
  path: `/notification-setting`,
}

export const UpdateNotificationSettings: Endpoint<UpdateNotificationSettingsRequest, NotificationSettingsResponse> = {
  method: 'patch',
  path: `/notification-setting`,
  bodyParams: ['announcement', 'event'],
}