'use client';

import React, { useEffect, useState } from 'react';
import { GetNotificationResponse } from '@/app/endpoint/notification.endpoint';
import Image from 'next/image';
import { EmptyNotifications } from "@/app/notifications/EmptyNotification";
import { formatTimeAgo } from "@/app/notifications/format.time.ago";
import { useLocale } from "@/hooks/useLocale";

export default function NotificationForm({
                                           notifications,
                                         }: {
  notifications: GetNotificationResponse[];
}) {
  const { locale } = useLocale()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (notifications.length > 0) {
    return (
      <div className="flex flex-col w-screen h-screen">
        <div className="flex flex-col overflow-y-auto pb-14 no-scrollbar">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`flex flex-row p-4 gap-3 cursor-pointer active:scale-[0.98] active:bg-gray-100 transition-all duration-150 
          ${index === notifications.length - 1 ? '' : 'border-b border-gray-100'}`}
              onClick={() => {
                window.KloudEvent?.push(notification.route);
              }}
            >
              {/* 썸네일 */}
              {notification.thumbnailUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={notification.thumbnailUrl} alt="알림" fill className="object-cover"/>
                </div>
              )}

              {/* 컨텐츠 */}
              <div className="flex flex-col flex-1">
                <span className="text-base font-bold text-black mb-1">{notification.title}</span>
                <p className="text-sm text-gray-600 mb-1">{notification.body}</p>
                {mounted && <span className="text-xs text-gray-400">{formatTimeAgo(notification.createdAt, locale)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return <EmptyNotifications/>;
}

