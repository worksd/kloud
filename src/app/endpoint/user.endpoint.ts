import { UserStatus } from "@/entities/user/user.status";
import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { UserType } from "@/entities/user/user.type";
import { GetLessonResponse, LessonListResponse } from "@/app/endpoint/lesson.endpoint";
import { GetStudioResponse, StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { GetPassResponse, PassStatus } from "@/app/endpoint/pass.endpoint";

export type GetUserParameter = {
  id: number
}

export type UpcomingLessonResponse = {
  id: number
  status?: string
  statusLabel?: string
  genre?: string
  type?: string
  startDate?: string
  dday?: string
  title?: string
  thumbnailUrl?: string
  artists?: { id: number; name: string; nickName?: string; profileImageUrl?: string }[]
  studio?: { id: number; name: string; profileImageUrl?: string }
  /** 사용자의 해당 수업 수강권 — 있으면 카드 클릭 시 수강권 상세로 이동 */
  ticket?: { id: number }
}

export type GetUserResponse = {
  id: number
  email: string
  name?: string
  nickName?: string
  type?: UserType
  status: UserStatus
  loginType: 'Email' |'Kakao' | 'Google' | 'Apple' | 'Phone'
  profileImageUrl?: string
  deactivatedAt: string
  phone?: string
  birth?: string
  passes?: GetPassResponse[]
  refundAccountNumber?: string
  refundAccountBank?: string
  refundAccountDepositor?: string
  emailVerified?: boolean
  upcomingLesson?: UpcomingLessonResponse
  ticketCount?: number
  paymentRecordCount?: number
  passCount?: number
  bookingCount?: number   // 대관 예약 수 (GET /users/me)
  gender?: 'male' | 'female'
  parentPhone?: string
  parentCountryCode?: string
  parentName?: string
}

export type MyBookingResponse = {
  id: number;
  studioRoomId: number;
  type: string;
  startDate: string;
  endDate: string;
  price: number;
  studioRoom?: {
    id: number;
    name: string;
    imageUrls?: string[];
  };
  studio?: {
    id: number;
    name: string;
    profileImageUrl?: string | null;
  };
}

export type MyPassResponse = {
  id: number;
  startDate: any;
  endDate: any;
  status: string;
  passPlan?: {
    id: number;
    name: string;
    price: number;
    unitPrice: number;
    imageUrl?: string;
    isRecommended: boolean;
    expireDateStamp?: string;
  };
}

/**
 * GET /users/me 의 myRegularClasses[] — 정규반 가격정책으로 산 상품(pass) 1장이 한 줄.
 * 같은 반이라도 미납 유예분 + 다음 주기 선발급분이 함께 있으면 두 줄. 일반 패스권(myPasses)과는 갈라서 온다.
 * 탭하면 패스 상세(GET /passes/:id)로 — 정규반 상품도 상세 조회는 막지 않는다.
 */
export type MyRegularClassResponse = {
  /** 상품(pass) id — 반 id 가 아니다. 패스 상세 이동에 쓴다 */
  id: number;
  /** Active 외에 Unpaid(미납 유예)도 온다 — 미납 유예분은 쓸 수 있는 상태라 흐리게 그리지 않는다 */
  status: PassStatus | 'Unpaid';
  /** 'yyyy-MM-dd'. 안 정해져 있으면 키 생략 */
  startDate?: string;
  /** 'yyyy-MM-dd' */
  endDate: string;
  /** 다니는 요일(0=일 ~ 6=토). 요일을 가리지 않으면 키 생략 */
  days?: number[];
  /** 정규반. 반이 지워져 못 읽으면 null — 이름은 passPlan.name 으로 폴백 */
  regularClass: StudioRegularClassResponse | null;
  passPlan?: MyPassResponse['passPlan'];
  studio?: { id: number; name: string; profileImageUrl?: string | null; address?: string };
}

export type GetMeResponse = {
  id: number
  email: string
  status: UserStatus
  type: UserType
  profileImageUrl?: string
  name?: string
  nickName?: string
  phone?: string
  birth?: string
  studio?: GetStudioResponse
  upcomingLesson?: UpcomingLessonResponse
  ticketCount?: number
  paymentRecordCount?: number
  passCount?: number
  bookingCount?: number   // 대관 예약 수 (GET /users/me)
  myBookings?: MyBookingResponse[]
  myPasses?: MyPassResponse[]
  /** 내 정규반 — 정규반 상품은 myPasses 에 안 실리고 여기로 따로 온다 */
  myRegularClasses?: MyRegularClassResponse[]
  /**
   * 지금 다니는 정규반 수 — myRegularClasses 를 반(regularClass.id)으로 묶어 센 값.
   * 같은 반의 미납 유예분 + 다음 주기 선발급분은 두 줄이지만 한 반이라 length 로 세면 부풀린다 (연동 가이드 2026-10-04)
   */
  regularClassCount?: number
  /** 연결된 소셜 계정 — Default 유저만 채워짐 (provider: 'Google'|'Kakao'|'Apple') */
  socialLinks?: { provider: string }[]
  /** 강사로 소속된 학원 목록. 강사가 아니면 빈 배열 — 개인수업 개설 진입 시그널 */
  artistStudios?: { id: number; name: string; profileImageUrl?: string }[]
  /**
   * 내 강사 프로필 (SimpleArtistResponse) — 강사(type=Artist)로 연결된 계정에만, 미연결이면 키 생략.
   * 강사 수업 목록(GET /artists/:id/lessons)은 이 안의 id로 호출한다.
   */
  artist?: {
    id: number
    name?: string
    nickName?: string
    profileImageUrl?: string
    phone?: string
    instagramAddress?: string
    /** 강사 태그 (콤마 구분) */
    tag?: string | null
  }
}

export type GetAnnouncementResponse = {
  id: number
  title: string
  body: string
  imageUrl?: string | null
  studio: GetStudioResponse,
  /** 작성 시각 — ISO 또는 'yyyy.MM.dd HH:mm'(KST). 공지에 '작성 N분 전' 상대 표기용. */
  createdAt?: string | null
}

export type SignOutParameter = {
  reason: string
}

export const GetUser: Endpoint<GetUserParameter, GetUserResponse> = {
  method: 'get',
  path: (e) => `/users/${e.id}`,
  pathParams: ['id']
}

export const GetMe: Endpoint<object, GetMeResponse> = {
  method: 'get',
  path: `/users/me`,
}

export type PatchUserParameter = {
  id: number
  name?: string
  nickName?: string
  type: UserType
  phone?: string
  birth?: string
  gender?: string
  refundAccountNumber?: string
  refundAccountBank?: string
  refundDepositor?: string
  emailVerified?: boolean,
  country?: string,
  password?: string,
  countryCode?: string,
  code?: string,
}

export type CreateParentConnectionParameter = {
  studentUserId: number,
  parentPhone: string,
  parentName?: string,
}

export const UpdateUser: Endpoint<PatchUserParameter, GetUserResponse> = {
  method: 'patch',
  path: (e) => `/users/${e.id}`,
  bodyParams: ['name', 'nickName', 'type', 'phone', 'birth', 'gender', 'refundAccountNumber', 'refundAccountBank', 'refundDepositor', 'emailVerified', 'country', 'password', 'countryCode', 'code'],
  pathParams: ['id']
}

export const DeleteUser: Endpoint<SignOutParameter, SimpleResponse> = {
  method: 'delete',
  path: `/users`,
  bodyParams: ['reason']
}

export const CheckDuplicate: Endpoint<{ nickName?: string, phone?: string}, SimpleResponse> = {
  method: 'post',
  path: '/users/duplicate-check',
  bodyParams: ['nickName', 'phone']
}

export const CreateParentConnection: Endpoint<CreateParentConnectionParameter, SimpleResponse> = {
  method: "post",
  path: (e) => `/users/${e.studentUserId}/connect-parent`,
  bodyParams: ['studentUserId', 'parentName', 'parentPhone']
}


/**
 * 회원/수강생 검색 매칭 방식 (BE e5031f5c, 2026-08-28).
 *  - 'Keyword'(기본): 부분 일치. 숫자만이면 phone LIKE %q%, 문자 포함이면 name·nickName·email OR LIKE
 *  - 'PhoneSuffix': 검색어가 숫자면 전화번호 뒷자리 일치만(phone LIKE %q). 숫자가 아니면 Keyword와 동일 처리
 * 키오스크 뒷 4자리 패드(phonePadType='Short')에서는 반드시 PhoneSuffix — 부분 일치는 번호 가운데에 같은 4자리가 있는
 * 다른 회원이 먼저 잡히는 사고가 있었다 (studio 21, 2026-08-27).
 */
export type SearchMatchType = 'Keyword' | 'PhoneSuffix';

export type SearchUserParameter = {
  /** 검색 API 개편(BE 50613bf8, 2026-08-31)으로 파라미터가 query → keyword로 통일됨. 이름·닉네임·이메일·전화번호 OR LIKE. */
  keyword: string;
  /** 강사 계정 전용 — 자기 소속 학원의 수강생을 찾을 때. 파트너는 생략(계정의 학원이 우선) */
  studioId?: number;
  /** 생략하면 'Keyword'. */
  matchType?: SearchMatchType;
}

export type UserListResponse = {
  users: GetUserResponse[];
}

export const SearchUser: Endpoint<SearchUserParameter, UserListResponse> = {
  method: 'get',
  path: '/users/search',
  queryParams: ['keyword', 'studioId', 'matchType']
}