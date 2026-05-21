import { Endpoint } from "@/app/endpoint/index";

/** 공지 단건 — 홈/목록/상세 공통. studio 정보는 별도 (myStudio.studio 사용). */
export type AnnouncementResponse = {
  id: number;
  title: string;
  body: string;
  imageUrl: string | null;
  /** yyyy-MM-dd HH:mm (KST) */
  createdAt: string;
};

export type AnnouncementListResponse = {
  announcements: AnnouncementResponse[];
};

export type ListAnnouncementsParameter = {
  studioId: number;
  page?: number;
};

export type GetAnnouncementParameter = {
  id: number;
};

export const ListAnnouncements: Endpoint<ListAnnouncementsParameter, AnnouncementListResponse> = {
  method: 'get',
  path: '/announcements',
  queryParams: ['studioId', 'page'],
};

export const GetAnnouncement: Endpoint<GetAnnouncementParameter, AnnouncementResponse> = {
  method: 'get',
  path: (e) => `/announcements/${e.id}`,
  pathParams: ['id'],
};
