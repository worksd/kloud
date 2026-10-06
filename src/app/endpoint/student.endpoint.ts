import { Endpoint } from "@/app/endpoint/index";
import { SearchMatchType } from "@/app/endpoint/user.endpoint";

/**
 * POST /students — 원장·직원이 결제 없이 자기 학원 수강생 명단에 올린다 (BE 79115f15, 가이드 2026-10-04).
 * 학원은 토큰 소속으로 정해지며 본문에 studioId는 없다.
 * - 계정이 있는 사람: targetUserId (있으면 phone·countryCode·name은 무시)
 * - 전화번호로: phone(숫자만 보며 하이픈은 서버가 지움) + countryCode(기본 '82') + name(새 계정일 때만 계정 이름으로 저장)
 * 멱등 — 이미 그 학원 수강생이면 기존 수강생을 그대로 돌려준다.
 * @deprecated studioId — 구 온보딩 자기 등록 경로. 서버는 더 이상 보지 않는다.
 */
export type CreateStudentParameter = {
  targetUserId?: number;
  phone?: string;
  countryCode?: string;
  name?: string;
  studioId?: number;
}

export type StudentResponse = {
  id: number;
  userId: number;
  studioId?: number;
}

/** 등록 응답 — 사람 정보만 채워지고 집계(passCount 등)·tags는 없다. 필요하면 id로 GET /students/:id */
export type RegisterStudentResponse = StudentResponse & {
  name?: string;
  userName?: string;
  nickName?: string;
  phone?: string;
  countryCode?: string;
  status?: string;
  /** yyyy.MM.dd — 이 학원 수강생이 된 날. 기존 수강생이면 처음 등록된 날 */
  registeredAt?: string;
}

export const CreateStudent: Endpoint<CreateStudentParameter, RegisterStudentResponse> = {
  method: 'post',
  path: '/students',
  bodyParams: ['targetUserId', 'phone', 'countryCode', 'name', 'studioId'],
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
  /** 해당 tag 패스플랜의 유효 패스권 보유자만 (구 방식) */
  passPlanTag?: string;
  /** 가격정책 id 콤마 구분('120,121'). 그중 하나로 유효한 패스를 가진 수강생만 */
  passPlanIds?: string;
  /** passPlanIds(passPlanTag)와 함께 사용. 'yyyy.MM.dd HH:mm' 기준으로 유효 패스 판정 (미지정=현재) */
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
  /** page 쿼리를 준 경우에만 내려옴. 쿼리 값을 그대로 돌려줘 문자열("1")로 온다 */
  page?: number | string;
  totalPage?: number;
}

export const FindStudentList: Endpoint<FindStudentListParameter, StudentListResponse> = {
  method: 'get',
  path: '/students/search',
  queryParams: ['keyword', 'page', 'tags', 'onlyActive', 'order', 'passPlanTag', 'passPlanIds', 'lessonDate', 'matchType'],
}

// GET /students — 검색어 없는 목록. 응답 모양은 /students/search와 같다 (students 가이드 2026-09-28).
// onlyActive는 값이 아니라 키 유무로 판정되므로(false도 참) 끌 때는 undefined로 빼야 한다.
export type FindStudentsParameter = Omit<FindStudentListParameter, 'keyword' | 'matchType'>;

export const FindStudents: Endpoint<FindStudentsParameter, StudentListResponse> = {
  method: 'get',
  path: '/students',
  queryParams: ['page', 'tags', 'onlyActive', 'order', 'passPlanTag', 'passPlanIds', 'lessonDate'],
}
