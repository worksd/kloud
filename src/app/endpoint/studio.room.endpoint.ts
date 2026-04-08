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
}

export type AvailableDayTime = {
  day: number;
  startTime: string;
  endTime: string;
}

export type StudioRoomResponse = {
  id: number;
  name: string;
  description?: string;
  maxNumber: number;
  practiceMaxNumber?: number;
  isPracticeRoom?: boolean;
  imageUrls?: string[];
  practiceImageUrls?: string[];
  unitPrice?: number;
  dailyPrice?: number;
  slotDurationMinutes?: number;
  advanceBookingDays?: number | null;
  advanceBookingOpenTime?: string;
  bookingDurationMinutes?: number | null;
  bookingWhileInUse?: boolean;
  availableDayTimes?: AvailableDayTime[];
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
  targetDate?: string;
  startTime?: string;
  endTime?: string;
}

export type RoomAvailabilityResponse = {
  studioRoomId: number;
  name: string;
  description?: string;
  date: string;
  maxCount: number;
  slotDurationMinutes: number;
  imageUrls?: string[];
  practiceImageUrls?: string[];
  unitPrice?: number;
  dailyPrice?: number;
  practiceMaxNumber?: number;
  advanceBookingDays?: number | null;
  bookingDurationMinutes?: number | null;
  bookingWhileInUse?: boolean;
  availableDayTimes?: AvailableDayTime[];
  slots: TimeSlotResponse[];
  buttons?: GetLessonButtonResponse[];
}

export const GetRoomAvailability: Endpoint<GetRoomAvailabilityParameter, RoomAvailabilityResponse> = {
  method: 'get',
  path: (e) => `/studioRooms/${e.id}`,
  pathParams: ['id'],
  queryParams: ['date', 'targetDate', 'startTime', 'endTime'],
}
