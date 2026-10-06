'use server'
import { api } from "@/app/api.client";

/** 스튜디오 판매중 정규반 전체 목록 — GET /regular-classes?studioId= */
export const getStudioRegularClasses = async ({studioId, page}: { studioId: number, page?: number }) => {
  return await api.studio.listRegularClasses({studioId, page})
}

/** 정규반 상세 — 결제 페이지가 passPlans[](가격정책)를 선택지로 쓴다. GET /regular-classes/:id */
export const getRegularClassDetail = async (id: number) => {
  return await api.studio.getRegularClass({id})
}
