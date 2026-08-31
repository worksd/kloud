import { Endpoint } from "@/app/endpoint/index";
import { SearchMatchType } from "@/app/endpoint/user.endpoint";

export type CreateStudentParameter = {
  studioId: number;
}

export type StudentResponse = {
  id: number;
  userId: number;
  studioId: number;
}

export const CreateStudent: Endpoint<CreateStudentParameter, StudentResponse> = {
  method: 'post',
  path: '/students',
  bodyParams: ['studioId'],
}

export type GetStudentByUserParameter = {
  userId: number;
}

export const GetStudentByUser: Endpoint<GetStudentByUserParameter, StudentResponse> = {
  method: 'get',
  path: (e) => `/students/by-user/${e.userId}`,
}

export type GetStudentPassesParameter = {
  id: number;
  page?: number;
  order?: string;
}

export type NewPassRuleResponse = {
  id: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  remainingCount?: number | null;
  usageCount?: number;
  targetType?: string;
  targetValue?: string | null;
  targetLabel?: string | null;
  benefitType?: string;
  benefitValue?: number | null;
  excludes?: { type: string; value?: string | null; label?: string | null }[];
}

export type NewPassFeatureResponse = {
  id: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  featureKey?: string;
  featureValue?: string | null;
  duration?: number;
}

export type NewPassResponse = {
  id: number;
  name?: string;
  price?: number;
  unitPrice?: number;
  status?: string;
  statusLabel?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  paymentId?: string;
  imageUrl?: string;
  passRules?: NewPassRuleResponse[];
  passFeatures?: NewPassFeatureResponse[];
  usable?: boolean;
  reason?: string;
}

export type NewPassListResponse = {
  passes: NewPassResponse[];
  totalCount: number;
  page: number;
  totalPage: number;
}

export const GetStudentPasses: Endpoint<GetStudentPassesParameter, NewPassListResponse> = {
  method: 'get',
  path: (e) => `/students/${e.id}/passes`,
  queryParams: ['page', 'order'],
}

// GET /students/search?keyword= — 학원 내 수강생 검색 (검색 API 개편, BE 50613bf8 2026-08-31).
// user search(/users/search)와 다르다: 파트너 토큰의 소속 스튜디오 수강생만 대상.
// 이름 · 닉네임 · 전화번호 부분 일치(OR). 목록 필터(page·tags·onlyActive·order·passPlanTag·lessonDate)는 그대로 얹을 수 있고
// keyword를 비우면 전체 목록. matchType('PhoneSuffix')은 이 라우트로 함께 이전됨 — 키오스크 뒷 4자리 조회가 사용.
export type StudentListOrder = 'CreatedAtDesc' | 'AlphabeticalAsc';

export type FindStudentListParameter = {
  keyword?: string;
  /** 1부터. 생략하면 응답에 page/totalPage가 빠지고 totalCount만 옴. 페이지당 20건 */
  page?: number;
  /** 태그 필터 — 콤마 구분 ('a,b') */
  tags?: string;
  /** 활성 수강생만 (최근 3개월 내 결제) */
  onlyActive?: boolean;
  order?: StudentListOrder;
  /** 해당 tag 패스플랜의 유효 패스권 보유자만 */
  passPlanTag?: string;
  /** passPlanTag와 함께 사용. 'yyyy.MM.dd HH:mm' 기준으로 유효 패스 판정 (미지정=현재) */
  lessonDate?: string;
  /** 'PhoneSuffix'면 숫자 검색어를 전화번호 뒷자리 일치로만 찾는다. 생략하면 'Keyword'(부분 일치). */
  matchType?: SearchMatchType;
}

export type StudentTagResponse = {
  id: number;
  name?: string;
  color?: string;
}

export type StudentListItemResponse = {
  /**
   * student ID. 출결·결제 API의 targetUserId로 쓰면 안 된다 — 그건 userId다.
   * (패스권 조회 GET /students/:id/passes 처럼 student 단위 API에서만 사용)
   */
  id: number;
  userId: number;
  /** 학원 지정 이름 → user.name 순으로 폴백된 값 */
  name?: string;
  nickName?: string;
  email?: string;
  profileImageUrl?: string;
  phone?: string;
  countryCode?: string;
  gender?: string;
  birth?: string;
  createdAt?: string;
  /** 학원 등록일 */
  registeredAt?: string;
  tags?: StudentTagResponse[];
  parentPhone?: string;
  parentCountryCode?: string;
  parentName?: string;
}

export type StudentListResponse = {
  students: StudentListItemResponse[];
  totalCount: number;
  /** page 쿼리를 준 경우에만 내려옴 */
  page?: number;
  totalPage?: number;
}

export const FindStudentList: Endpoint<FindStudentListParameter, StudentListResponse> = {
  method: 'get',
  path: '/students/search',
  queryParams: ['keyword', 'page', 'tags', 'onlyActive', 'order', 'passPlanTag', 'lessonDate', 'matchType'],
}
