import { Endpoint } from "@/app/endpoint/index";

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
