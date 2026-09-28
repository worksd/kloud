'use server'

import { api } from '@/app/api.client';
import { StudentListOrder, StudentListResponse } from '@/app/endpoint/student.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

export type StudentsQuery = {
  page: number;
  order: StudentListOrder;
  /** 최근 3개월 내 결제한 활성 수강생만 */
  onlyActive: boolean;
  /** 이름·닉네임·전화·이메일 부분 일치. 숫자만이면 전화번호 뒷자리 일치 */
  keyword?: string;
};

export type StudentsPage = Pick<StudentListResponse, 'students' | 'totalCount'> & { totalPage: number };

const EMPTY: StudentsPage = { students: [], totalCount: 0, totalPage: 0 };

/**
 * 관리자 수강생 탭 목록 — 20명씩.
 * 검색어가 있으면 GET /students/search, 없으면 GET /students (응답 모양 동일).
 * onlyActive는 서버가 키 유무로 판정하므로 false면 아예 보내지 않는다.
 */
export const getStudentsAction = async (q: StudentsQuery): Promise<StudentsPage> => {
  const keyword = q.keyword?.trim() ?? '';
  const common = {
    page: q.page,
    order: q.order,
    onlyActive: q.onlyActive ? true : undefined,
  };
  const res = keyword
    ? await api.student.list({
        ...common,
        keyword,
        // 숫자만 입력하면 '뒤 4자리' 안내대로 끝자리 일치 — 전체 번호를 넣어도 끝자리 일치로 같이 잡힌다
        matchType: /^\d+$/.test(keyword.replace(/[\s-]/g, '')) ? 'PhoneSuffix' : undefined,
      })
    : await api.student.listAll(common);
  if (isGuinnessErrorCase(res) || !('students' in res)) return EMPTY;
  return { students: res.students, totalCount: res.totalCount, totalPage: res.totalPage ?? 0 };
};

/** 요약용 — 활성(최근 3개월 결제) 인원. 목록과 병렬로 1페이지만 받아 totalCount만 쓴다 */
export const getActiveStudentCountAction = async (): Promise<number> => {
  const res = await api.student.listAll({ page: 1, onlyActive: true });
  return !isGuinnessErrorCase(res) && 'totalCount' in res ? res.totalCount : 0;
};
