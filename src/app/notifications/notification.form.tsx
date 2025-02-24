'use client';
import React, { useEffect } from "react";
import { GetNotificationResponse } from "@/app/endpoint/notification.endpoint";
import Image from "next/image";

export default function NotificationForm({notifications}: { notifications: GetNotificationResponse[] }) {

  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (notifications && notifications.length > 0) {
    return (
      <div className="flex flex-col w-screen h-screen">
        <div className="flex flex-col overflow-y-auto">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="flex flex-row p-4 border-b border-gray-100 gap-3 cursor-pointer active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
              onClick={() => {
                  window.KloudEvent?.push(notification.route);
              }}
            >
              {/* 썸네일 */}
              {notification.thumbnailUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={notification.thumbnailUrl}
                    alt={'알림'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* 컨텐츠 */}
              <div className="flex flex-col flex-1">
          <span className="text-base font-bold text-black mb-1">
            {notification.title}
          </span>
                <p className="text-sm text-gray-600 mb-1">
                  {notification.body}
                </p>
                {mounted && (
                  <span className="text-xs text-gray-400">
              {formatTimeAgo(notification.createdAt)}
            </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return EmptyNotifications()
  }
}

function formatTimeAgo(dateInput: string | Date, now: Date = new Date()): string {
  let date: Date;

  if (typeof dateInput === "string") {
    // 문자열을 Date 객체로 변환
    date = new Date(dateInput.replace(/\./g, '-')); // "2025.02.24 10:45" -> "2025-02-24 10:45"
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) {
    return '잘못된 날짜';
  }

  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return '방금 전';
  }
}

function EmptyNotifications() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center rounded-lg pb-36">
      <h2 className="text-black font-semibold text-[24px]">새로운 소식이 없어요</h2>
      <p className="text-gray-500 text-[16px]">알림이 오면 여기서 확인할 수 있어요</p>
    </div>
  );
}
