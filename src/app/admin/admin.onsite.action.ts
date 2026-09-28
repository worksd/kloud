'use server'

import { api } from '@/app/api.client';
import { GetPassPlanResponse } from '@/app/endpoint/pass.endpoint';
import { CreateManualPaymentRecordRequest } from '@/app/endpoint/payment.record.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { getLocale } from '@/utils/translate';
import { getAdminLessonsByDate } from '@/app/admin/admin.today.lessons';
import type { AdminSheetLesson } from '@/app/admin/AdminShortcuts';

/** 현장결제 패스권 선택용 — 학원 판매중 패스권. 실패는 빈 배열 */
export const getStudioPassPlansAction = async (studioId: number): Promise<GetPassPlanResponse[]> => {
  try {
    const res = await api.pass.listPlans({ studioId, status: 'active' });
    if (isGuinnessErrorCase(res) || !('passPlans' in res)) return [];
    return res.passPlans.filter((p) => p.status !== 'Cancelled');
  } catch {
    return [];
  }
};

/** 현장결제 수강권 선택용 — 고른 날짜의 수업. date는 'yyyy-MM-dd'(date input 값). 실패는 빈 배열 */
export const getOnsiteLessonsAction = async (studioId: number, date: string): Promise<AdminSheetLesson[]> => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  try {
    return await getAdminLessonsByDate(studioId, date.replace(/-/g, '.'), await getLocale());
  } catch {
    return [];
  }
};

/**
 * 관리자 홈 현장결제 — POST /paymentRecords/manual.
 * methodType은 admin(현장결제, Completed) 고정 — 금액이 0이면 서버가 free로 바꿔 저장한다.
 * 대상은 targetUserId(회원) 또는 phone+name(비회원 → 서버가 계정 생성).
 * 파트너 토큰이라 studioId는 보내지 않는다.
 */
export const createOnsitePaymentAction = async (body: CreateManualPaymentRecordRequest) => {
  return await api.paymentRecord.createManual(body);
};
