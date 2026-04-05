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

export type StudioRoomResponse = {
  id: number;
  name: string;
  maxNumber: number;
  isPracticeRoom?: boolean;
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

export type RoomAvailabilityResponse = {
  studioRoomId: number;
  name: string;
  date: string;
  maxCount: number;
  slotDurationMinutes: number;
  slots: TimeSlotResponse[];
  buttons?: GetLessonButtonResponse[];
}

export const GetRoomAvailability: Endpoint<GetRoomAvailabilityParameter, RoomAvailabilityResponse> = {
  method: 'get',
  path: (e) => `/studioRooms/${e.id}`,
  pathParams: ['id'],
  queryParams: ['date'],
}
