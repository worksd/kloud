import { Endpoint, SimpleResponse } from '@/app/endpoint/index';
import { LessonType } from '@/entities/lesson/lesson';
import { GetStudioResponse } from '@/app/endpoint/studio.endpoint';
import { TicketListResponse, TicketResponse } from '@/app/endpoint/ticket.endpoint';
import { GetArtistResponse } from '@/app/endpoint/artist.endpoint';

export type GetLessonParameter = {
    id: number;
};

export type GetLessonResponse = {
    id: number;
    code?: string;
    status?: LessonStatus;
    limit?: number;
    title?: string;
    thumbnailUrl?: string;
    date?: string;
    startDate?: string; // yyyy-MM-dd HH:mm 형식
    saleDate?: string;
    duration?: number;
    type?: LessonType;
    price?: number;
    level?: string;
    artists?: GetArtistResponse[];
    studio?: GetStudioResponse;
    currentStudentCount?: number;
    room?: GetStudioRoomResponse;
    ticket?: TicketResponse;
    buttonTitle: string;
    buttonRoute: string;
    buttons: GetLessonButtonResponse[];
    paymentType?: 'Subscription' | 'Default'
    days?: string;
    description?: string;
    genre?: string;
    tags?: string;
    formattedDate?: GetFormattedDateResponse;
    /** 어드민 권한 종류. truthy면 수강생/정산 정보 표시. */
    adminType?: 'artist' | 'partner';
    /** 이 수업이 포함된 판매중 묶음 목록. BE가 status=Public + closeDate>now + 본 lesson 포함 조건으로 필터해 내려줌. */
    bundles?: BundleSummaryResponse[];
};

export type BundleSummaryResponse = {
    id: number;
    name: string;
    description?: string;
    price: number;            // 묶음 판매가
    originalPrice: number;    // 구성 수업 합계 (할인 표시용)
    closeDate: string;        // 'YYYY.MM.DD HH:mm' KST
    items: BundleItemResponse[];
}

export type BundleItemResponse = {
    itemType: string;         // 'lesson'
    itemId: number;
    title: string;
    price: number;
    startDate?: string;
    thumbnailUrl?: string;
}

export type GetFormattedDateResponse = {
  type: 'oneTime' | 'subscription';
  date?: string;
  weekday?: string;
  startTime: string;
  endTime: string;
  daysOfWeek?: string;
}

export type GetLessonButtonResponse = {
    title: string;
    route?: string;
    activateAt?: string;
}

export type GetStudioRoomResponse = {
    id: number;
    maxNumber: number;
    name: string;
};
export type LessonListResponse = {
    lessons: GetBandLessonResponse[]
    totalPage: number
}

export type GetStudioLessonParameter = {
    studioId: number;
    page?: number;
}

export type GetStudioLessonsByDateParameter = {
    studioId: number;
    date?: string;
    startDate?: string;
    endDate?: string;
    isAdmin?: boolean;
}

export type BandLabel = {
    /** true면 밴드 제목 위에 'SOON' 태그 노출 */
    coming?: boolean;
    /** true면 밴드 제목 위에 'NEW' 태그 노출 */
    new?: boolean;
}

export type GetBandResponse = {
    title: string;
    type: BandType;
    label?: BandLabel;
    lessons: GetBandLessonResponse[];
}

export type GetLessonListResponse = {
  lessons: GetLessonResponse[];
}

export type GetBandLessonResponse = {
    id: number;
    title: string;
    status: LessonStatus;
    description: string;
    studioImageUrl: string;
    studioName: string;
    /** Today 밴드 응답이 함께 내려주는 룸 이름. */
    roomName?: string;
    thumbnailUrl: string;
    label: GetLabelResponse;
    type?: 'default' | 'subscription';
    date?: string; // yyyy-MM-dd 형식
    startDate?: string; // yyyy-MM-dd HH:mm 형식
    startTime?: string; // HH:mm 형식
    /** 수업 길이(분). 'Today' 밴드 timetable에서 진행중/종료 판단에 사용. */
    duration?: number;
    artist?: GetArtistResponse;
    artists?: GetArtistResponse[];
}

export type GetLabelResponse = {
    isEnded: boolean;
    type?: LessonType;
    genre?: string;
    /** ','로 구분된 태그 문자열 (예: '전문반,입시반'). null/undefined면 미노출 */
    tags?: string | null;
}

export type CheckTicketCapacityParameter = {
    lessonId: number;
}

export type JumbotronResponse = {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    studioImageUrl: string;
}

export type BandType = 'Default' | 'Recommendation' | 'Today'

export const GetLesson: Endpoint<GetLessonParameter, GetLessonResponse> = {
    method: "get",
    path: (e) => `/lessons/${e.id}`,
};

export const ListOngoingLessons: Endpoint<GetStudioLessonParameter, LessonListResponse> = {
    method: 'get',
    path: `/lessons/ongoing`,
    queryParams: ['studioId', 'page']
}

export const ListStudioLessonsByDate: Endpoint<GetStudioLessonsByDateParameter, GetLessonListResponse> = {
    method: 'get',
    path: `/lessons`,
    queryParams: ['studioId', 'date', 'startDate', 'endDate', 'isAdmin']
}

export const CheckCapacity: Endpoint<CheckTicketCapacityParameter, SimpleResponse> = {
    method: 'get',
    path: (e) => `/lessons/${e.lessonId}/capacity-check`
}

export type GetLessonTicketsParameter = {
    id: number;
    /** BE가 메모리에서 입장 순서로 정렬 */
    order?: 'RankAsc';
}

export const GetLessonTickets: Endpoint<GetLessonTicketsParameter, TicketListResponse> = {
    method: 'get',
    path: (e) => `/lessons/${e.id}/tickets`,
    queryParams: ['order'],
}

export type SettleUpItem = {
    key: string;
    value: string;
    type?: 'Default' | 'Total' | string;
}

export type SettleUpSection = {
    title: string;
    items: SettleUpItem[];
}

export type SettleUpArtistResponse = {
    id: number;
    nickName: string;
    profileImageUrl: string;
    settleAmount: number;
    totalAmount: number;
    description: string;
}

export type SettleUpLessonResponse = {
    id: number;
    date: string;
    title: string;
    artists: SettleUpArtistResponse[];
    sales: SettleUpSection;
    settleUp: SettleUpSection;
}

export type GetLessonSettleUpParameter = {
    id: number;
}

export const GetLessonSettleUp: Endpoint<GetLessonSettleUpParameter, SettleUpLessonResponse> = {
    method: 'get',
    path: (e) => `/lessons/${e.id}/settle-up`,
}

// LessonGroup (정기수업) 관련 타입
export type GetLessonGroupParameter = {
    id: number;
}

export type GetLessonGroupLessonsParameter = {
    id: number;
    year?: number;
    month?: number;
    page?: number;
}

export type GetLessonGroupResponse = {
    id: number;
    title: string;
    thumbnailUrl?: string;
    level?: string;
    price?: number;
    unitPrice?: number;
    limit: number;
    genre?: string;
    description?: string;
    status: string;
    studio?: GetStudioResponse;
    artist?: GetArtistResponse;
    studioRoom?: GetStudioRoomResponse;
    days?: string[];
    startTime?: string;
    duration?: number;
    generateAheadDays?: number;
    webSiteUrl?: string;
    ticket?: LessonGroupTicketResponse;
    currentStudentCount: number;
    paymentCount?: number;
    lastLessonDate?: string;
    buttons?: GetLessonButtonResponse[];
}

export type LessonGroupTicketResponse = {
    id: number;
    status: string;
    remainingCount?: number;
    startDate?: string;
    endDate?: string;
}

export const GetLessonGroup: Endpoint<GetLessonGroupParameter, GetLessonGroupResponse> = {
    method: 'get',
    path: (e) => `/lesson-groups/${e.id}`,
}

export const GetLessonGroupLessons: Endpoint<GetLessonGroupLessonsParameter, LessonListResponse> = {
    method: 'get',
    path: (e) => `/lesson-groups/${e.id}/lessons`,
    queryParams: ['year', 'month', 'page'],
}

export enum LessonStatus {
    Pending = 'Pending',
    NotForSale = 'NotForSale',
    PreSale = 'PreSale',
    Recruiting = 'Recruiting',
    Ready = 'Ready',
    Cancelled = 'Cancelled',
    Completed = 'Completed',
    SaleClosed = 'SaleClosed',
}

export const LessonStatusDisplay: Record<string, string> = {
    Pending: '공개 예정',
    NotForSale: '판매 예정',
    PreSale: '선예약 중',
    Recruiting: '예약 중',
    Ready: '수업 예정',
    Cancelled: '수업 취소',
    Completed: '수업 종료',
    SaleClosed: '결제 마감',
};