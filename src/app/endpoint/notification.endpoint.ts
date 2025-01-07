export type GetNotificationResponse = {
  id: number;
  title: string;
  brand: string;
  description: string;
}

export type ListNotificationResponse = {
  notifications: GetNotificationResponse[];
}