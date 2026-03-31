import React from "react";
import { NoMyStudioPage } from "@/app/home/NoMyStudioPage";
import { getHomeAction } from "@/app/home/get.home.action";
import { ScheduleTabView } from "@/app/schedule/ScheduleTabView";

export default async function SchedulePage() {
  const res = await getHomeAction();

  if (!('studios' in res)) return null;

  if (!res.myStudio) {
    return (
      <div className="bg-white min-h-screen">
        <NoMyStudioPage studios={res.recommendedStudios} />
      </div>
    );
  }

  // Mock 수업 데이터 — API 준비되면 교체
  const today = new Date();
  const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(d.getDate() + n); return r; };

  const mockLessons = [
    { id: 1001, title: '트릭스 힙합 클래스 초보반', thumbnailUrl: '', startTime: '17:00', endTime: '18:00', room: 'A홀', date: toDateStr(addDays(today, 0)) },
    { id: 1002, title: '주말 아침 하드 트레이닝', thumbnailUrl: '', startTime: '09:00', endTime: '10:30', room: 'B홀', date: toDateStr(addDays(today, 0)) },
    { id: 1003, title: '이혁재 고급 House', thumbnailUrl: '', startTime: '19:00', endTime: '20:30', room: 'A홀', date: toDateStr(addDays(today, 0)) },
    { id: 1004, title: '김태현 Breaking 기초', thumbnailUrl: '', startTime: '14:00', endTime: '15:30', room: 'B홀', date: toDateStr(addDays(today, 1)) },
    { id: 1005, title: '트릭스 힙합 클래스 중급반', thumbnailUrl: '', startTime: '18:00', endTime: '19:30', room: 'A홀', date: toDateStr(addDays(today, 1)) },
    { id: 1006, title: '팝핀 워크샵', thumbnailUrl: '', startTime: '10:00', endTime: '12:00', room: 'A홀', date: toDateStr(addDays(today, 2)) },
    { id: 1007, title: '주말 아침 하드 트레이닝', thumbnailUrl: '', startTime: '09:00', endTime: '10:30', room: 'B홀', date: toDateStr(addDays(today, 3)) },
    { id: 1008, title: '트릭스 힙합 클래스 고급반', thumbnailUrl: '', startTime: '19:00', endTime: '20:30', room: 'A홀', date: toDateStr(addDays(today, 3)) },
    { id: 1009, title: '이혁재 고급 House', thumbnailUrl: '', startTime: '20:00', endTime: '21:30', room: 'A홀', date: toDateStr(addDays(today, 4)) },
    { id: 1010, title: '키즈 댄스 클래스', thumbnailUrl: '', startTime: '15:00', endTime: '16:00', room: 'B홀', date: toDateStr(addDays(today, 5)) },
    { id: 1011, title: '김태현 Breaking 중급', thumbnailUrl: '', startTime: '17:00', endTime: '18:30', room: 'A홀', date: toDateStr(addDays(today, 5)) },
    { id: 1012, title: '주말 프리스타일 잼', thumbnailUrl: '', startTime: '14:00', endTime: '16:00', room: 'A홀', date: toDateStr(addDays(today, 6)) },
  ];

  const lessons = mockLessons;

  return (
    <ScheduleTabView
      lessons={lessons}
      studioName={res.myStudio.studio.name}
      studioImageUrl={res.myStudio.studio.profileImageUrl}
    />
  );
}
