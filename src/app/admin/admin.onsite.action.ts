'use server'

import { api } from '@/app/api.client';
import { GetPassPlanResponse } from '@/app/endpoint/pass.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

/** 현장결제 상품 선택용 — 학원 판매중 패스권. 실패는 빈 배열 */
export const getStudioPassPlansAction = async (studioId: number): Promise<GetPassPlanResponse[]> => {
  try {
    const res = await api.pass.listPlans({ studioId, status: 'active' });
    if (isGuinnessErrorCase(res) || !('passPlans' in res)) return [];
    return res.passPlans.filter((p) => p.status !== 'Cancelled');
  } catch {
    return [];
  }
};
