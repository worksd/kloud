import { Endpoint } from "@/app/endpoint/index";
import { LessonListResponse } from "@/app/endpoint/lesson.endpoint";

export type GetNotificationResponse = {
  id: number;
  title: string;
  body: string;
  thumbnailUrl: string;
  createdAt: string;
  bold: string;
  dataId: string;
  type: NotificationType;
  isRead: boolean;
}

export enum NotificationType {
  Welcome = 'Welcome', // userId
  StudioAnnouncement = 'StudioAnnouncement', // studioId
  LessonAnnouncement = 'LessonAnnouncement', // lessonId
  AppAnnouncement = 'AppAnnouncement', // null
  LessonUpcoming = 'LessonUpcoming', // ticketId
  TicketPaymentCompleted = 'TicketPaymentCompleted', // ticketId
  BankTransferCompleted = 'BankTransferCompleted',
  TicketCanceled = 'TicketCanceled',
}

export type ListNotificationResponse = {
  notifications: GetNotificationResponse[];
}

export const GetNotifications: Endpoint<object, ListNotificationResponse> = {
  method: "get",
  path: `/notifications`,
}