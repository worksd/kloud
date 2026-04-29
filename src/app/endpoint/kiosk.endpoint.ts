import { Endpoint, NoParameter } from "@/app/endpoint";

export type KioskStatus = 'Active' | 'Inactive';

export type KioskResponse = {
  id: number;
  name: string;
  status: KioskStatus;
  lastSeenAt: string | null;
  imageUrl: string | null;
  canCheckIn: boolean;
  canPurchase: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KioskListResponse = {
  kiosks: KioskResponse[];
};

export const GetKiosks: Endpoint<NoParameter, KioskListResponse> = {
  method: 'get',
  path: '/kiosks',
};
