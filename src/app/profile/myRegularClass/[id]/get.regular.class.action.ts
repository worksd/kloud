import { api } from "@/app/api.client";

// 정규반 상세 — GET /regular-classes/:id. 내 정규반 상세의 반 정보(이름 등)는 이걸로 그린다 (pass 응답의 passPlan.regularClass 가 비어 올 수 있어서)
export const getRegularClassAction = async ({ id }: { id: number }) => {
  return await api.studio.getRegularClass({ id });
};
