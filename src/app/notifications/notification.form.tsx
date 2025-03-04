import React from 'react';
import { GetNotificationResponse } from '@/app/endpoint/notification.endpoint';
import { EmptyNotifications } from "@/app/notifications/empty.notification";
import { NotificationItem } from "@/app/notifications/notification.item";

export default function NotificationForm({
                                           notifications,
                                         }: {
  notifications: GetNotificationResponse[];
}) {
  if (notifications.length > 0) {
    return (
      <div className="flex flex-col w-screen h-screen">
        <div className="flex flex-col overflow-y-auto pb-14 no-scrollbar">
          {notifications.map((notification, index) => (
            <NotificationItem notification={notification} index={index} key={index} length={notifications.length}/>
          ))}
        </div>
      </div>
    );
  }
  return <EmptyNotifications/>;
}

