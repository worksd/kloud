import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { AmenityResponse } from "@/app/endpoint/studio.room.endpoint";

// 대관 예약 상세의 홀 정보. GET /roomBookings/:id 의 studioRoom (설명서·스펙·시설).
export type RoomBookingStudioRoom = {
  id: number;
  name: string;
  imageUrls?: string[];
  /** HTML 문자열일 수 있음(렌더 시 dangerouslySetInnerHTML). */
  description?: string | null;
  maxNumber?: number | null;
  practiceMaxNumber?: number | null;
  areaSize?: number | null;
  widthMeter?: number | null;
  depthMeter?: number | null;
  heightMeter?: number | null;
  floorType?: string | null;
  isElasticFloor?: boolean | null;
  advanceBookingDays?: number | null;
  advanceBookingOpenTime?: string | null;
  minBookingDuration?: number | null;
  maxBookingDuration?: number | null;
  bookingWhileInUse?: boolean | null;
  dailyBookingLimit?: number | null;
  amenities?: AmenityResponse[];
};

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
  /** 결제 ID — 있으면 결제내역(PaymentRecordDetail)으로 이동 가능. */
  paymentId?: string | null;
  /** 취소(환불) 가능 여부 — 상태·시점 등 서버 판단. 취소하기 노출 조건. */
  isRefundable?: boolean;
  notice?: string | null;
  user?: {
    id: number;
    name: string;
    nickName?: string | null;
    phone?: string | null;
    profileImageUrl?: string | null;
  } | null;
  studioRoom?: RoomBookingStudioRoom | null;
  studio?: {
    id: number;
    name: string;
    profileImageUrl?: string | null;
  } | null;
  pass?: {
    id: number;
    passPlanName?: string;
  };
  createdAt: string;
  /** 취소 사유 — status가 Cancelled일 때 내려옴 */
  cancelReason?: string | null;
  /** 취소 일시 'yyyy.MM.dd HH:mm' — status가 Cancelled일 때 내려옴 */
  cancelledAt?: string | null;
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
