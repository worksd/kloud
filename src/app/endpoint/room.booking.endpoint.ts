import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

export type RoomBookingDetailResponse = {
  id: number;
  studioRoomId: number;
  bookingGroupId?: number;
  type: 'Individual' | 'Full';
  groupName?: string;
  startDate: string;
  endDate: string;
  price: number;
  notice?: string;
  user?: {
    id: number;
    name: string;
    nickName?: string;
    phone?: string;
    profileImageUrl?: string;
  };
  studioRoom?: {
    id: number;
    name: string;
    imageUrls?: string[];
  };
  pass?: {
    id: number;
    passPlanName?: string;
  };
  createdAt: string;
}

export type GetRoomBookingParameter = {
  id: number;
}

export const GetRoomBooking: Endpoint<GetRoomBookingParameter, RoomBookingDetailResponse> = {
  method: 'get',
  path: (e) => `/roomBookings/${e.id}`,
  pathParams: ['id'],
}

export type DeleteRoomBookingParameter = {
  id: number;
  reason?: string;
}

export const DeleteRoomBooking: Endpoint<DeleteRoomBookingParameter, SimpleResponse> = {
  method: 'delete',
  path: (e) => `/roomBookings/${e.id}`,
  pathParams: ['id'],
  queryParams: ['reason'],
}
