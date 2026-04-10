import { Endpoint } from "@/app/endpoint/index";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { PaymentMethodType } from "@/app/endpoint/payment.endpoint";

export type SimplePaymentRecordResponse = {
  id: number
  paymentId: string
  status: string
  amount: number
  methodType?: PaymentMethodType
  productName?: string
  createdAt?: string
}


export type GetPassPlanListRequest = {
  studioId: number
}

export type GetPassRequest = {
  id: number
}

export type GetPassListRequest = {
  order: PassOrder
}

export type RuleTicket = {
  id: number;
  title: string;
  date: string;
  status: 'Used' | 'Upcoming' | 'Cancelled';
}

export type PassRuleTicket = {
  id: number;
  status: string;
  paymentId: string;
  createdAt: string;
  lesson?: {
    id: number;
    title: string;
    startDate?: string;
    endDate?: string;
  };
}

export type PassRuleResponse = {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  remainingCount?: number | null;
  usageCount: number;
  targetType: string;
  targetValue?: string | null;
  targetLabel?: string | null;
  benefitType: string;
  benefitValue?: number | null;
  tickets: PassRuleTicket[];
}

export type PassRoomBookingResponse = {
  id: number;
  studioRoom?: {
    id: number;
    name: string;
    imageUrls?: string[];
  };
  startDate: string;
  endDate: string;
}

export type PassFeatureResponse = {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  usable: boolean;
  featureKey: string;
  featureValue?: string | null;
  duration: number;
  description?: string | null;
  roomBookings?: PassRoomBookingResponse[];
}

export type PassPlanRule = {
  id: number;
  description: string;
  target?: { type: string; value?: string | null; label?: string | null };
  benefit?: { type: string; value?: number | null };
  excludes?: { type: string; value?: string | null; label?: string | null }[];
  tickets?: RuleTicket[];
}

export type PassPlanFeature = {
  key: string;
  description?: string | null;
}

export type PassBenefitType = 'unlimited' | 'free_count' | 'discount' | 'presale' | 'fast_entry' | 'room';

export type PassBenefit = {
  type: PassBenefitType;
  title: string;
  subtitle?: string;
  description?: string;
  isAdditional?: boolean;
  remainingCount?: number;
  totalCount?: number;
  isUsedUp?: boolean;
}

export type GetPassPlanResponse = {
  id: number
  name: string
  price?: number
  studio?: GetStudioResponse
  isPopular: boolean,
  usageLimit?: number,
  expireDateStamp?: string,
  type: 'Count' | 'Unlimited',
  tier: PassPlanTier,
  tag?: string,
  canPreSale?: boolean,
  imageUrl?: string,
  isRecommended?: boolean,
  rules?: PassPlanRule[],
  features?: PassPlanFeature[],
  benefits?: PassBenefit[],
}

export type GetPassPlansResponse = {
  passPlans: GetPassPlanResponse[]
}

export type GetPassResponse = {
  id: number
  price: number
  paymentId: string
  startDate: string
  endDate: string
  status: PassStatus
  statusLabel: string
  passPlan: GetPassPlanResponse
  paymentRecord?: SimplePaymentRecordResponse
  tickets?: TicketResponse[]
  passRules?: PassRuleResponse[]
  passFeatures?: PassFeatureResponse[]
  remainingCount?: number
  usable: boolean
  reason?: string
  qrcodeUrl?: string
}

export type GetPassesResponse = {
  passes: GetPassResponse[]
}

export type CreatePassRequest = {
  passPlanId: number
  paymentId: string
  status: PassStatus,
  depositor?: string,
}

export type UsePassRequest = {
  passId: number
  lessonId?: number
  studioRoomId?: number
  startDate?: string
  endDate?: string
}

export type PassOrder = 'upcoming' | 'newest'
export type PassStatus = 'Active' | 'Done' | 'Expired' | 'Pending' | 'Waiting' | 'Cancelled' | 'CancelPending'


export const GetPassPlans: Endpoint<GetPassPlanListRequest, GetPassPlansResponse> = {
  method: "get",
  path: `/passPlans`,
  queryParams: ['studioId']
};

export const GetPasses: Endpoint<GetPassListRequest, GetPassesResponse> = {
  method: 'get',
  path: '/passes'
}

export const GetPass: Endpoint<GetPassRequest, GetPassResponse> = {
  method: 'get',
  path: (e) => `/passes/${e.id}`,
}

export const CreatePass: Endpoint<CreatePassRequest, GetPassResponse> = {
  method: 'post',
  path: `/passes`,
  bodyParams: ['passPlanId', 'paymentId', 'depositor', 'status']
}

export const UsePass: Endpoint<UsePassRequest, TicketResponse> = {
  method: 'post',
  path: (e) => `/passes/${e.passId}/use`,
  bodyParams: ['lessonId', 'studioRoomId', 'startDate', 'endDate']
}

export enum PassPlanTier {
  Basic = 0,
  Premium = 1,
}
