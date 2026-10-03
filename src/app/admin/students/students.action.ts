'use server'

import { api } from '@/app/api.client';
import { RegisterStudentResponse, StudentListOrder, StudentListResponse } from '@/app/endpoint/student.endpoint';
import { GuinnessErrorCase, isGuinnessErrorCase } from '@/app/guinnessErrorCase';

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

/**
 * 수강생 추가 — POST /students { phone, countryCode, name }.
 * 번호로 계정을 찾거나 만들어 토큰 소속 학원의 수강생으로 올린다. 이미 수강생이면 기존 수강생이 그대로 온다(멱등).
 * name은 새 계정을 만들 때만 계정 이름으로 쓰이고, 기존 계정의 이름은 바꾸지 않는다.
 *
 * 실패는 항상 {code, message}로 돌려준다 — 고정 문구로 덮지 않고 실제 사유가 화면까지 가도록:
 * - BE 비즈니스 에러({code, message})는 그대로
 * - class-validator 400({statusCode, message: string[], error})은 메시지를 합쳐서
 * - 성공 모양(id)이 아닌 응답은 본문을 붙여서
 * - fetch/JSON 파싱 예외는 예외 메시지를 붙여서 (서버 액션이 throw하면 프로덕션에서 사유가 가려지므로 여기서 잡는다)
 */
export const registerStudentAction = async (
  { phone, countryCode = '82', name }: { phone: string; countryCode?: string; name?: string },
): Promise<RegisterStudentResponse | GuinnessErrorCase> => {
  try {
    const res: unknown = await api.student.create({ phone, countryCode, name });
    if (isGuinnessErrorCase(res)) return res;
    if (res && typeof res === 'object' && 'id' in res) return res as RegisterStudentResponse;
    // NestJS class-validator / HttpException 기본 모양
    if (res && typeof res === 'object' && 'message' in res) {
      const r = res as { statusCode?: number; message: string | string[]; error?: string; code?: string };
      const message = Array.isArray(r.message) ? r.message.join('\n') : String(r.message);
      return { code: r.code ?? r.error ?? `HTTP_${r.statusCode ?? 'ERROR'}`, message };
    }
    return {
      code: 'UNEXPECTED_RESPONSE',
      message: `서버 응답 형식이 예상과 다릅니다: ${JSON.stringify(res)?.slice(0, 300) ?? String(res)}`,
    };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { code: 'REQUEST_FAILED', message: `요청을 보내지 못했어요: ${reason}` };
  }
};
