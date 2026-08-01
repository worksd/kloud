'use server'
import { api } from "@/app/api.client";

export const getPassPlanListAction = async ({studioId, status}: {studioId: number; status?: string}) => {
  return await api.pass.listPlans({studioId, status})
}

/**
 * 키오스크 관리자모드 — 비공개(Private) 포함 패스권 플랜 전체 조회.
 *
 * 반드시 /kiosk 경로에서 호출할 것. BE가 x-guinness-client == 'KIOSK'일 때만 전체를 내려주는데,
 * 이 헤더는 proxy.ts가 요청 pathname으로 붙인다. 다른 경로에서 부르면 헤더가 'Web'이 되어
 * 에러 없이 공개 패스권만 돌아온다.
 */
export const getAllPassPlanListForKioskAction = async ({studioId, status, page}: {studioId: number; status?: string; page?: number}) => {
  return await api.pass.listAllPlansForKiosk({studioId, withAll: true, status, page})
}
