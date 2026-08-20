'use server'

import { api } from "@/app/api.client";
import { ArtistLessonListResponse } from "@/app/endpoint/artist.endpoint";

// 강사가 배정된 수업 목록 — GET /artists/:id/lessons (최근 시작순, 20개/page).
// 실패는 빈 목록으로 조용히 (프로필 이력 뷰라 에러 화면까지는 불필요).
export const getArtistLessonsAction = async ({ artistId, page }: {
  artistId: number;
  page?: number;
}): Promise<ArtistLessonListResponse> => {
  try {
    const res = await api.artist.getLessons({ id: artistId, page });
    if ('lessons' in res) return res;
    return { lessons: [], totalPage: 0 };
  } catch {
    return { lessons: [], totalPage: 0 };
  }
};
