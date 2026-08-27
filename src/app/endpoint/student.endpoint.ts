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

// GET /students?query= — 학원 내 수강생 목록 검색.
// user search(/users/search)와 다르다: 파트너 토큰의 소속 스튜디오 수강생만 대상.
//
// 검색 대상은 서버가 query 형태를 보고 분기한다:
//  - 전부 숫자 ('01012345678', '0107')        → phone LIKE 만
//  - 문자 포함 ('김서연', 'a@b.com')          → name · 학원지정이름 · nickName · phone · email OR LIKE
// 모두 부분 일치(%query%)이고 문자 검색은 대소문자 무시. %, _, \ 는 리터럴로 이스케이프됨.
export type StudentListOrder = 'CreatedAtDesc' | 'AlphabeticalAsc';

export type FindStudentListParameter = {
  query?: string;
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
  path: '/students',
  queryParams: ['query', 'page', 'tags', 'onlyActive', 'order', 'passPlanTag', 'lessonDate', 'matchType'],
}
