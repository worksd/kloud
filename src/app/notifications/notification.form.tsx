'use client';
import React, { useState } from "react";

interface NotificationItem {
  id: string;
  type: 'NOTIFICATION' | 'NOTICE';
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function NotificationForm() {
  const [activeTab, setActiveTab] = useState<'알림' | '공지'>('알림');

  // 임시 데이터
  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'NOTIFICATION',
      title: '원밀리언 댄스 스튜디오',
      content: '강의 시작 1시간 전이에요! 트릭스 힙합 클래스 초보반 강의가 1시간 뒤에 시작해요!',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
      isRead: false
    },
    {
      id: '2',
      type: 'NOTICE',
      title: '원밀리언 댄스 스튜디오',
      content: '쿠폰에 유효기간이 남아있는 분들은 월-금 14:00-23:00까지 언제든지 연습실 사용이 가능합니다. (토요일은 상황에 따라...',
      createdAt: new Date(Date.now() - 25200000).toISOString(), // 7시간 전
      isRead: false
    },
    // ... 더 많은 알림 데이터
  ];

  return (
    <div className="flex flex-col w-screen h-screen">
      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-4 text-center ${
            activeTab === '알림' ? 'text-black border-b-2 border-black font-medium' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('알림')}
        >
          알림
        </button>
        <button
          className={`flex-1 py-4 text-center ${
            activeTab === '공지' ? 'border-b-2 text-black border-black font-medium' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('공지')}
        >
          공지
        </button>
      </div>

      {/* 알림/공지 리스트 */}
      <div className="flex flex-col overflow-y-auto">
        {notifications
          .filter(item =>
            activeTab === '알림' ? item.type === 'NOTIFICATION' : item.type === 'NOTICE'
          )
          .map(notification => (
            <div
              key={notification.id}
              className="flex flex-col p-4 border-b border-gray-100"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <span className="text-base font-bold">{notification.title}</span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 ml-2 bg-red-500 rounded-full" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(new Date(notification.createdAt))}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
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

