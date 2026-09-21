'use server'
import { api } from "@/app/api.client";

/** 스튜디오 판매중 정규반 전체 목록 — GET /regular-classes?studioId= */
export const getStudioRegularClasses = async ({studioId, page}: { studioId: number, page?: number }) => {
  return await api.studio.listRegularClasses({studioId, page})
}
