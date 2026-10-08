'use server';

import { api } from "@/app/api.client";

// 키오스크 정규반 탭.
//  - 목록: GET /regular-classes?studioId=  (판매중 정규반 전체). 비어있으면 탭 자체를 숨긴다.
//  - 상세: GET /regular-classes/:id        (passPlans[] = 수강 방식/가격정책 → item=pass-plan 으로 결제)
export const getKioskRegularClassesAction = async (studioId: number) => {
  return await api.studio.listRegularClasses({ studioId });
};

export const getKioskRegularClassDetailAction = async (id: number) => {
  return await api.studio.getRegularClass({ id });
};
