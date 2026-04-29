import { Endpoint } from "@/app/endpoint/index";

export type CreateStudentParameter = {
  studioId: number;
}

export type StudentResponse = {
  id: number;
  userId: number;
  studioId: number;
}

export const CreateStudent: Endpoint<CreateStudentParameter, StudentResponse> = {
  method: 'post',
  path: '/students',
  bodyParams: ['studioId'],
}

export type GetStudentByUserParameter = {
  userId: number;
}

export const GetStudentByUser: Endpoint<GetStudentByUserParameter, StudentResponse> = {
  method: 'get',
  path: (e) => `/students/by-user/${e.userId}`,
}

export type GetStudentPassesParameter = {
  id: number;
  page?: number;
  order?: string;
}

export type NewPassRuleResponse = {
  id: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  remainingCount?: number | null;
  usageCount?: number;
  targetType?: string;
  targetValue?: string | null;
  targetLabel?: string | null;
  benefitType?: string;
  benefitValue?: number | null;
  excludes?: { type: string; value?: string | null; label?: string | null }[];
}

export type NewPassFeatureResponse = {
  id: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  featureKey?: string;
  featureValue?: string | null;
  duration?: number;
}

export type NewPassResponse = {
  id: number;
  name?: string;
  price?: number;
  unitPrice?: number;
  status?: string;
  statusLabel?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  paymentId?: string;
  imageUrl?: string;
  passRules?: NewPassRuleResponse[];
  passFeatures?: NewPassFeatureResponse[];
  usable?: boolean;
  reason?: string;
}

export type NewPassListResponse = {
  passes: NewPassResponse[];
  totalCount: number;
  page: number;
  totalPage: number;
}

export const GetStudentPasses: Endpoint<GetStudentPassesParameter, NewPassListResponse> = {
  method: 'get',
  path: (e) => `/students/${e.id}/passes`,
  queryParams: ['page', 'order'],
}
