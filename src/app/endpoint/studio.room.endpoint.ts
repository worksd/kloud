import { Endpoint } from "@/app/endpoint/index";
import { GetLessonButtonResponse } from "@/app/endpoint/lesson.endpoint";

export type GetStudioRoomListParameter = {
  studioId: number;
  practiceOnly?: boolean;
}

export type TimeSlotResponse = {
  time: string;
  status: 'available' | 'full' | 'closed';
  currentCount: number;
  maxCount: number;
  /** 시간대별 가격 (StudioRoomPrice 규칙 적용가). null이면 예약 불가 슬롯. */
  price?: number | null;
}

export type AvailableDayTime = {
  day: number;
  startTime: string;
  endTime: string;
}

// 홀 운영시간·가격 그리드 원본 (요일/시간대별). slot.price가 null일 때 이걸로 가격 계산.
export type RoomScheduleResponse = {
  dayType: 'Weekly' | 'Holiday';
  day: number | null;      // Weekly: 0~6 (getDay 기준 0=일). Holiday: null
  startTime: string;       // 'HH:00'
  status: string;          // 'Active' 등
  price: number;
}

// 방/건물 시설 토글 (있음/없음). label = 한글 표시명. enabled=false도 목록에 포함되니 소비 측에서 필터.
export type AmenityResponse = {
  amenity: string;
  label: string;
  enabled: boolean;
}

export type RoomDimensions = {
  width?: number;
  depth?: number;
  height?: number;
}

// GET /studioRooms/:id, GET /studioRooms 목록의 홀정보(방 설명서). 예약 현황(slots)은 미포함 —
// slots는 GET /studioRooms/availability에서 받아 클라에서 studioRoomId로 조인.
export type StudioRoomResponse = {
  id: number;
  name: string;
  description?: string;
  mode?: string;
  maxNumber: number;
  practiceMaxNumber?: number;
  isPracticeRoom?: boolean;
  imageUrls?: string[];
  unitPrice?: number;
  dailyPrice?: number;
  minBookingDuration?: number;
  maxBookingDuration?: number | null;
  dailyBookingLimit?: number | null;
  advanceBookingDays?: number | null;
  advanceBookingOpenTime?: string;
  bookingWhileInUse?: boolean;
  requiredPassPlanIds?: number[];
  areaSize?: number;
  dimensions?: RoomDimensions;
  floorType?: string;
  amenities?: AmenityResponse[];
  availableDayTimes?: AvailableDayTime[];
  schedules?: RoomScheduleResponse[];
  createdAt?: string;
  /** 슬롯은 응답에 없음. availability 조인 후 클라에서 채우는 용도의 옵셔널 필드. */
  slots?: TimeSlotResponse[];
}

export type StudioRoomListResponse = {
  studioRooms: StudioRoomResponse[];
}

// GET /studioRooms — 홀 목록(홀정보만, 슬롯/date 없음)
export const ListStudioRooms: Endpoint<GetStudioRoomListParameter, StudioRoomListResponse> = {
  method: 'get',
  path: '/studioRooms',
  queryParams: ['studioId', 'practiceOnly'],
}

// GET /studioRooms/:id — 홀 상세(홀정보만). 예약 현황은 availability에서.
export type GetStudioRoomParameter = {
  id: number;
}

export const GetStudioRoom: Endpoint<GetStudioRoomParameter, StudioRoomResponse> = {
  method: 'get',
  path: (e) => `/studioRooms/${e.id}`,
  pathParams: ['id'],
}

export type RoomLessonResponse = {
  id: number;
  title: string;
  startDate: string;
  duration: number;
  currentStudentCount: number;
  limit: number;
  status: string;
  statusLabel: string;
  artistNickName?: string;
}

// GET /studioRooms/availability — 특정 날짜의 예약 현황(슬롯).
// studioId(학원 전 홀) 또는 studioRoomIds(콤마 구분 지정 홀). 로그인 시 방마다 buttons·myBookings 포함.
export type GetRoomsAvailabilityParameter = {
  studioRoomIds?: string;   // 콤마 구분 "83,84,85"
  studioId?: number;        // 학원 전 홀 한 번에
  date: string;             // 'YYYY-MM-DD'
}

export type RoomAvailabilityRowResponse = {
  studioRoomId: number;
  name?: string;
  slots: TimeSlotResponse[];
  schedules?: RoomScheduleResponse[];
  buttons?: GetLessonButtonResponse[];
  myBookings?: { id: number; startDate: string; endDate: string }[];
  lessons?: RoomLessonResponse[];
}

export type RoomsAvailabilityResponse = {
  date: string;
  rooms: RoomAvailabilityRowResponse[];
}

export const GetRoomsAvailability: Endpoint<GetRoomsAvailabilityParameter, RoomsAvailabilityResponse> = {
  method: 'get',
  path: '/studioRooms/availability',
  queryParams: ['studioRoomIds', 'studioId', 'date'],
}

// === 파트너(관리자) 예약 일정표 ===
// 동일 URL(GET /studioRooms/availability)이지만 X-Guinness-Client: PARTNER + 파트너 토큰일 때
// 앱/키오스크(slots)와 다른 멀티룸 응답(rooms[].bookings 예약자 목록)을 내려준다.

// 운영시간·가격 그리드 셀 하나. 요일별 주간 그리드 — day(0=일~6=토)로 조회일 요일과 매칭.
// Holiday(dayType='Holiday', day=null)는 공휴일 규칙. status Active=운영, Disabled=휴무.
export type RoomScheduleCellResponse = {
  dayType?: 'Weekly' | 'Holiday';
  day?: number | null;      // Weekly: 0~6(getDay). Holiday: null
  startTime: string;        // 'HH:mm'
  status: string;           // 'Active' | 'Disabled' 등
  price?: number | null;
}

// 그날 홀의 예약 1건 (예약자 정보 포함).
export type PartnerRoomBookingResponse = {
  id: number;
  type: 'individual' | 'full';
  startDate: string;        // 'yyyy.MM.dd HH:mm' KST
  endDate: string;
  name?: string | null;     // 개인=예약자명 / 전체대관=단체명
  user?: {
    id: number;
    name: string;
    nickName?: string | null;
    profileImageUrl?: string | null;
  } | null;
}

export type PartnerRoomAvailabilityResponse = {
  studioRoomId: number;
  name?: string;
  maxCount?: number;
  mode?: string;
  description?: string;
  imageUrls?: string[];
  minBookingDuration?: number;
  maxBookingDuration?: number | null;
  dailyBookingLimit?: number | null;
  advanceBookingDays?: number | null;
  advanceBookingOpenTime?: string;
  bookingWhileInUse?: boolean;
  practiceMaxNumber?: number;
  requiredPassPlanIds?: number[];
  schedules?: RoomScheduleCellResponse[];
  bookings?: PartnerRoomBookingResponse[];
  lessons?: RoomLessonResponse[];
  amenities?: AmenityResponse[];
}

export type PartnersMultiRoomAvailabilityResponse = {
  date: string;
  rooms: PartnerRoomAvailabilityResponse[];
}

export const GetPartnersRoomsAvailability: Endpoint<GetRoomsAvailabilityParameter, PartnersMultiRoomAvailabilityResponse> = {
  method: 'get',
  path: '/studioRooms/availability',
  queryParams: ['studioRoomIds', 'studioId', 'date'],
}
