import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

export type RoomBookingDetailResponse = {
  id: number;
  studioRoomId: number;
  bookingGroupId?: number | null;
  type: 'individual' | 'full';
  status: 'Pending' | 'Active' | 'Used' | 'Cancelled';
  requester?: 'app' | 'partner' | null;
  name?: string | null;                 // 예약자명(개인) 또는 단체명(전체대관)
  startDate: string;                    // 'yyyy.MM.dd HH:mm' KST
  endDate: string;
  price: number;
  notice?: string | null;
  user?: {
    id: number;
    name: string;
    nickName?: string | null;
    phone?: string | null;
    profileImageUrl?: string | null;
  } | null;
  studioRoom?: {
    id: number;
    name: string;
    imageUrls?: string[];
  } | null;
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

// 내 대관 예약 목록 — GET /roomBookings (@Auth). 앱 유저는 본인 예약만.
export type GetRoomBookingListParameter = {
  date?: string;
  studioRoomId?: number;
  studioId?: number;
}

export type RoomBookingListResponse = {
  roomBookings: RoomBookingDetailResponse[];
}

export const ListRoomBookings: Endpoint<GetRoomBookingListParameter, RoomBookingListResponse> = {
  method: 'get',
  path: `/roomBookings`,
  queryParams: ['date', 'studioRoomId', 'studioId'],
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
