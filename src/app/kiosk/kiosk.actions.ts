'use server';
import { cookies } from "next/headers";
import { api } from "@/app/api.client";
import { KioskPendingPaymentItemRequest } from "@/app/endpoint/payment.record.endpoint";
import { AttendanceStatus } from "@/app/endpoint/studio.endpoint";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { loginSuccessAction } from "@/app/login/action/login.success.action";
import { clearCookies } from "@/app/profile/clear.token.action";
import { accessTokenKey, kioskSelectedIdKey } from "@/shared/cookies.key";

export const searchUserByPhoneAction = async (phone: string, countryCode: string) => {
  return await api.user.searchByPhone({ phone, countryCode });
};

export const searchUserAction = async (query: string) => {
  return await api.user.search({ query });
};

export const registerKioskUserAction = async (phone: string, countryCode: string, name: string) => {
  // 1. phone-login (isAdmin: true → 신규 유저 자동 생성)
  const loginResult = await api.auth.checkPhoneVerification({
    phone,
    countryCode,
    isAdmin: true,
  });
  if (isGuinnessErrorCase(loginResult)) {
    return loginResult;
  }

  // 2. 이름 업데이트
  const updateResult = await api.user.update({
    id: loginResult.user.id,
    name,
    type: 'Default' as any,
  });
  if (isGuinnessErrorCase(updateResult)) {
    return updateResult;
  }

  return updateResult;
};

export const createKioskPaymentAction = async (items: KioskPendingPaymentItemRequest[], targetUserId: number) => {
  return await api.paymentRecord.createKiosk({ items, targetUserId });
};

export const createStudioAttendanceAction = async (targetUserId: number, status: AttendanceStatus) => {
  return await api.studio.createAttendance({ targetUserId, status });
};

export const kioskPhoneLoginAction = async (phone: string, countryCode: string = '82') => {
  const res = await api.auth.checkPhoneVerification({
    phone,
    countryCode,
    isAdmin: true,
  });
  if ('user' in res) {
    const user = res.user as any;
    return { success: true, userId: res.user.id, accessToken: res.accessToken, name: user.name as string | undefined, nickName: user.nickName as string | undefined };
  }
  return res;
};

export const kioskSaveTokenAction = async (accessToken: string, userId: number) => {
  await loginSuccessAction({ accessToken, userId });
};

export const kioskGetMyPassesAction = async () => {
  const res = await api.user.me({});
  if ('id' in res) {
    return { passes: res.myPasses ?? [] };
  }
  return { passes: [] };
};

export const kioskClearTokenAction = async () => {
  await clearCookies();
};

// QR로 받은 토큰을 일반 accessToken 쿠키로 저장 → 이후 모든 API 호출에 자동 사용
export const saveKioskOperatorTokenAction = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(accessTokenKey, token, {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });
};

export const clearKioskOperatorTokenAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(accessTokenKey);
  cookieStore.delete(kioskSelectedIdKey);
};

export const saveSelectedKioskIdAction = async (kioskId: number) => {
  const cookieStore = await cookies();
  cookieStore.set(kioskSelectedIdKey, String(kioskId), {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });
};

// 키오스크 목록 조회 — 쿠키의 accessToken을 자동으로 사용
export const getKiosksAction = async () => {
  return await api.kiosk.list({});
};
