import { Endpoint } from "@/app/endpoint/index";
import { GetLessonButtonResponse } from "@/app/endpoint/lesson.endpoint";

export type GetStudioRoomListParameter = {
  studioId: number;
  practiceOnly?: boolean;
  date?: string;
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

export type StudioRoomResponse = {
  id: number;
  name: string;
  description?: string;
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
  availableDayTimes?: AvailableDayTime[];
  schedules?: RoomScheduleResponse[];
  slots?: TimeSlotResponse[];
}

export type StudioRoomListResponse = {
  studioRooms: StudioRoomResponse[];
}

export const ListStudioRooms: Endpoint<GetStudioRoomListParameter, StudioRoomListResponse> = {
  method: 'get',
  path: '/studioRooms',
  queryParams: ['studioId', 'practiceOnly', 'date'],
}

export type GetRoomAvailabilityParameter = {
  id: number;
  date: string;
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

export type RoomAvailabilityResponse = {
  studioRoomId: number;
  name: string;
  description?: string;
  date: string;
  maxCount: number;
  minBookingDuration: number;
  maxBookingDuration?: number | null;
  dailyBookingLimit?: number | null;
  imageUrls?: string[];
  unitPrice?: number;
  dailyPrice?: number;
  advanceBookingDays?: number | null;
  advanceBookingOpenTime?: string;
  slots: TimeSlotResponse[];
  buttons?: GetLessonButtonResponse[];
  myBookings?: { id: number; startDate: string; endDate: string }[];
  lessons?: RoomLessonResponse[];
}

export const GetRoomAvailability: Endpoint<GetRoomAvailabilityParameter, RoomAvailabilityResponse> = {
  method: 'get',
  path: (e) => `/studioRooms/${e.id}`,
  pathParams: ['id'],
  queryParams: ['date'],
}

// 여러 홀의 특정 날짜 슬롯을 한 번에 조회 (키오스크 대관 그리드용)
export type GetRoomsAvailabilityParameter = {
  studioRoomIds: string;   // 콤마 구분 "83,84,85"
  date: string;            // 'YYYY-MM-DD'
}

export type RoomAvailabilityRowResponse = {
  studioRoomId: number;
  name: string;
  slots: TimeSlotResponse[];
  schedules?: RoomScheduleResponse[];
}

export type RoomsAvailabilityResponse = {
  date: string;
  rooms: RoomAvailabilityRowResponse[];
}

export const GetRoomsAvailability: Endpoint<GetRoomsAvailabilityParameter, RoomsAvailabilityResponse> = {
  method: 'get',
  path: '/studioRooms/availability',
  queryParams: ['studioRoomIds', 'date'],
}
