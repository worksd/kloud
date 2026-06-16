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

// 연습실 목록 — practiceOnly로 연습 가능한 방만 조회 (운영자 토큰 사용)
export const getStudioRoomsAction = async (studioId: number) => {
  return await api.studioRoom.list({ studioId, practiceOnly: true });
};

// 특정 연습실의 날짜별 가용 슬롯 조회 — date는 'yyyy.MM.dd'
export const getRoomAvailabilityAction = async (studioRoomId: number, date: string) => {
  return await api.studioRoom.getAvailability({ id: studioRoomId, date });
};

export const registerKioskUserAction = async (phone: string, countryCode: string, nickName: string) => {
  // 1. phone-login (isAdmin: true → 신규 유저 자동 생성)
  const loginResult = await api.auth.checkPhoneVerification({
    phone,
    countryCode,
    isAdmin: true,
  });
  if (isGuinnessErrorCase(loginResult)) {
    return loginResult;
  }

  // 2. 닉네임 업데이트 — 키오스크 신규 가입은 name이 아니라 nickName으로 patch
  const updateResult = await api.user.update({
    id: loginResult.user.id,
    nickName,
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

// userId로 student 조회 → studentId로 passes 조회 (운영자 토큰 사용)
export const kioskGetStudentPassesByUserAction = async (userId: number) => {
  const studentRes = await api.student.getByUser({ userId });
  if (!('id' in studentRes)) {
    return studentRes; // 에러 그대로 반환
  }
  return await api.student.getPasses({ id: studentRes.id });
};

export const kioskClearTokenAction = async () => {
  await clearCookies();
};

// 현재 운영자 accessToken 쿠키값 반환 (네이티브에 토큰 전달할 때 사용)
export const getKioskOperatorTokenAction = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(accessTokenKey)?.value ?? null;
};

// QR로 받은 토큰을 loginSuccessAction으로 저장 (이메일 로그인과 동일한 흐름)
export const saveKioskOperatorTokenAction = async (token: string) => {
  // JWT payload에서 userId 추출 (단순 base64 디코드, 검증은 서버가 한다)
  let userId = 0;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    if (typeof payload?.userId === 'number') userId = payload.userId;
  } catch {
    // 토큰이 JWT가 아니어도 일단 저장은 진행
  }
  await loginSuccessAction({ accessToken: token, userId });
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

// 키오스크 상세 — 영수증 하단 안내 문구 등 kiosk별 설정 조회
export const getKioskDetailAction = async (kioskId: number) => {
  return await api.kiosk.detail({ kioskId });
};

// 키오스크에서 결제 화면 진입 시 호출 — price/discounts(적용 가능한 패스권 등)/methods 응답
export const getKioskPaymentAction = async (params: { kioskId: number; targetUserId: number; item: string; itemId: number }) => {
  return await api.kiosk.getPayment(params);
};

// 장바구니 결제정보 — 수업 여러 건의 합산 결제 정보 + 수업별 패스/할인. lessonIds는 콤마 조인.
export const getKioskCartPaymentAction = async (params: { kioskId: number; targetUserId: number; lessonIds: number[] }) => {
  return await api.kiosk.getCartPayment({
    kioskId: params.kioskId,
    targetUserId: params.targetUserId,
    lessonIds: params.lessonIds.join(','),
  });
};

// 결제 시작 — 카드: Pending 생성 / 현금: 즉시 Completed. 응답의 amount가 KIS 단말 매입 금액
export const startKioskPaymentAction = async (
  body: import("@/app/endpoint/kiosk.endpoint").StartKioskPaymentRequest,
) => {
  return await api.kiosk.startPayment(body);
};

// 결제 확정 — KIS 단말 승인 후. POST /kiosks/payments/:paymentId/complete (Pending → Completed)
export const completeKioskPaymentAction = async (
  body: import("@/app/endpoint/kiosk.endpoint").CompleteKioskPaymentRequest,
) => {
  return await api.kiosk.completePayment(body);
};

// 결제 폐기 — 단말 매입 전 사용자 취소 / 매입 실패. DELETE /kiosks/payments/:paymentId (Pending soft delete)
// reason: KIS VAN 응답 raw 또는 폐기 사유 라벨. 서버 측 진단 로그용.
export const discardKioskPaymentAction = async (paymentId: string, kioskId: number, reason?: string) => {
  return await api.kiosk.discardPayment({ paymentId, kioskId, reason });
};

// 보유 패스권 사용 — 티켓/예약 생성
export const useKioskPassAction = async (
  body: import("@/app/endpoint/kiosk.endpoint").UseKioskPassRequest,
) => {
  return await api.kiosk.usePass(body);
};

// 관리자 모드: 키오스크에서 발생한 결제 목록 조회. date(yyyy-MM-dd, KST), page(1-base) 옵션.
export const listKioskPaymentsAction = async (kioskId: number, params?: { date?: string; page?: number }) => {
  return await api.kiosk.listPayments({ kioskId, date: params?.date, page: params?.page });
};

// 관리자 모드: Completed 결제 취소 — KIS 단말 취소가 선행된 후 서버에 기록.
// POST /kiosks/payments/:paymentId/cancel — body { targetUserId, kioskId }.
// (Pending 폐기는 discardKioskPaymentAction 사용)
export const cancelKioskPaymentAction = async (params: { paymentId: string; targetUserId: number; kioskId: number }) => {
  return await api.kiosk.cancelPayment(params);
};

// 영수증 재발급용 — GET /kiosks/:id/paymentRecords/:paymentId. 인증 없음.
export const getKioskPaymentRecordDetailAction = async (params: { kioskId: number; paymentId: string }) => {
  return await api.kiosk.getPaymentRecordDetail(params);
};
