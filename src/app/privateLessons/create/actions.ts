'use server'

import { api } from "@/app/api.client";
import { StudioRoomResponse } from "@/app/endpoint/studio.room.endpoint";
import { CreatePrivateLessonRequest } from "@/app/endpoint/lesson.endpoint";

// 선택한 학원의 룸 목록 — 정원 상한(maxNumber) 표시용. 실패는 빈 목록으로 조용히.
export const getStudioRoomsAction = async ({ studioId }: { studioId: number }): Promise<StudioRoomResponse[]> => {
  try {
    const res = await api.studioRoom.list({ studioId });
    if ('studioRooms' in res) return res.studioRooms ?? [];
    return [];
  } catch {
    return [];
  }
};

// 개인수업 개설 — POST /lessons 강사 경로. 서버가 Private/Basic/본인 강사로 강제.
export const createPrivateLessonAction = async (req: CreatePrivateLessonRequest) => {
  return await api.lesson.createPrivate(req);
};

export type RoomDayScheduleItem = {
  id: number;
  title: string;
  thumbnailUrl?: string;
  /** 'HH:mm' */
  startTime: string;
  /** 'HH:mm' — 응답에 duration이 없으면 null (소비자 목록 DTO에는 duration이 안 내려온다) */
  endTime: string | null;
};

// 선택한 강의실의 하루 일정 — GET /lessons?studioId&startDate&endDate 를 room으로 필터해 보여준다.
// ⚠️ date 파라미터는 비관리자 경로에서 무시된다(파트너 전용) — 같은 날짜를 startDate/endDate로 보낸다.
// ⚠️ 개인수업(Private)은 고객 목록에서 제외되는 API라 다른 강사의 개인수업은 안 보인다 (BE 한계).
export const getRoomDayLessonsAction = async ({ studioId, roomId, date }: {
  studioId: number;
  roomId: number;
  /** 'yyyy.MM.dd' */
  date: string;
}): Promise<RoomDayScheduleItem[]> => {
  try {
    const res = await api.lesson.listByDate({ studioId, startDate: date, endDate: date });
    if (!('lessons' in res)) return [];
    return (res.lessons ?? [])
      .filter((l) => l.room?.id === roomId && l.startDate)
      .map((l) => {
        // startDate 'yyyy-MM-dd HH:mm' — TZ 변환 없이 리터럴 파싱
        const time = l.startDate!.slice(11, 16);
        let endTime: string | null = null;
        if (l.duration) {
          const [h, m] = time.split(':').map(Number);
          const total = h * 60 + m + l.duration;
          endTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
        }
        return { id: l.id, title: l.title ?? '', thumbnailUrl: l.thumbnailUrl, startTime: time, endTime };
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  } catch {
    return [];
  }
};
