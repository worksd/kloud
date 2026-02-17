'use server';
import { api } from "@/app/api.client";
import { KioskPendingPaymentItemRequest } from "@/app/endpoint/payment.record.endpoint";
import { AttendanceStatus } from "@/app/endpoint/studio.endpoint";

export const searchUserByPhoneAction = async (phone: string, countryCode: string) => {
  return await api.user.searchByPhone({ phone, countryCode });
};

export const createKioskPaymentAction = async (items: KioskPendingPaymentItemRequest[], targetUserId: number) => {
  return await api.paymentRecord.createKiosk({ items, targetUserId });
};

export const createStudioAttendanceAction = async (targetUserId: number, status: AttendanceStatus) => {
  return await api.studio.createAttendance({ targetUserId, status });
};
