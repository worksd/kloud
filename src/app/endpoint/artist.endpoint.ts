import { Endpoint } from '@/app/endpoint/index';
import { GetBandResponse, ValidLessonResponse } from '@/app/endpoint/lesson.endpoint';

export type GetArtistParameter = {
  id: number;
}

export type GetArtistResponse = {
  id: number;
  name: string;
  nickName: string;
  profileImageUrl: string;
  phone?: string;
  instagramAddress?: string;
  youtubeAddress?: string;
  tiktokAddress?: string;
  genres?: string[];
  description?: string;
  badges?: ArtistBadgeResponse[];
  summary?: ArtistSummaryResponse;
  band?: GetBandResponse;
};

export type ArtistBadgeResponse = {
  label: string;
  type: string;
}

export type ArtistSummaryResponse = {
  title: string;
  elements: { key: string; label: string }[];
}

export const getArtist: Endpoint<GetArtistParameter, GetArtistResponse> = {
  method: "get",
  path: (e) => `/artists/${e.id}`,
};

export type GetArtistLessonsParameter = {
  id: number;
  /** 1부터, 기본 1. 페이지당 20개 */
  page?: number;
}

/** 카드는 /lessons/valid와 동일한 ValidLessonResponse — artists는 항상 조회 대상 강사 1명. */
export type ArtistLessonListResponse = {
  lessons: ValidLessonResponse[];
  /** ceil(전체 건수 / 20) */
  totalPage: number;
}

/**
 * 강사가 배정된 수업 목록 — 전체 스튜디오, 최근 시작순(startDate DESC). 로그인 필요.
 * 취소·개인수업(Private)·공개 전 제외 (소비자 노출 규칙). 지난 수업 포함.
 */
export const GetArtistLessons: Endpoint<GetArtistLessonsParameter, ArtistLessonListResponse> = {
  method: 'get',
  path: (e) => `/artists/${e.id}/lessons`,
  queryParams: ['page'],
};
