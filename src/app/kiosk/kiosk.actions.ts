'use server';
import { cookies } from "next/headers";
import { api } from "@/app/api.client";
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

export const registerKioskUserAction = async (phone: string, countryCode: string, nickName: string, name?: string) => {
  // 1. phone-login (isAdmin: true → 신규 유저 자동 생성)
  const loginResult = await api.auth.checkPhoneVerification({
    phone,
    countryCode,
    isAdmin: true,
  });
  if (isGuinnessErrorCase(loginResult)) {
    return loginResult;
  }

  // 2. 닉네임(+admin은 직원이 입력한 name) 업데이트
  const updateResult = await api.user.update({
    id: loginResult.user.id,
    nickName,
    name,
    type: 'Default' as any,
  });
  if (isGuinnessErrorCase(updateResult)) {
    return updateResult;
  }

  return updateResult;
};

// 스튜디오 출석의 수강생 검색 — user search(/users/search)가 아니라 GET /students.
// 학원(파트너 토큰) 소속 수강생만 대상이고, 이름·닉네임·폰·이메일을 한 번에 커버한다.
// 검색어가 숫자뿐이면 서버가 phone 전용 검색으로 동작한다(폰 뒷자리 검색이 이 경로).
export const searchStudentsAction = async (query: string) => {
  return await api.student.list({ query });
};

export const createStudioAttendanceAction = async (targetUserId: number, status: AttendanceStatus) => {
  return await api.studio.createAttendance({ targetUserId, status });
};

// 특정 수강생의 출결 기간 조회 (GET /studio-attendances). 달력/기록 표시용.
export const listStudioAttendancesAction = async (params: { targetUserId: number; startDate?: string; endDate?: string }) => {
  return await api.studio.listAttendances(params);
};

// QR 스캔값의 willUseTicketId(:id)/token으로 티켓(+lesson) 조회 — 수업 출석 체크 확인 화면용
export const getKioskTicketByTokenAction = async (ticketId: number, token: string) => {
  return await api.ticket.getByToken({ id: ticketId, token });
};

// token 없는 QR(willUseTicketId+expiredAt만 들어있는 티켓 QR)용 — 운영자 토큰으로 티켓 조회. GET /tickets/:id
export const getKioskTicketAction = async (ticketId: number) => {
  return await api.ticket.get({ id: ticketId, isParent: false });
};

// 티켓 사용 처리(출석 체크 확정) — POST /tickets/:id/use
export const markKioskTicketUsedAction = async (ticketId: number, lessonId?: number) => {
  return await api.ticket.toUsed({ id: ticketId, lessonId });
};

// 전자영수증(알림톡) 발송 — POST /alimtalks/ (template=PaymentReceipt). 운영자 토큰으로 호출.
// 확정된(confirmed) 결제만 가능. 성공은 '발송 요청 접수' 기준.
export const sendPaymentReceiptAction = async (params: { paymentId: string; phone: string; countryCode?: string }) => {
  return await api.alimtalk.sendPaymentReceipt({
    template: 'PaymentReceipt',
    paymentId: params.paymentId,
    phone: params.phone,
    countryCode: params.countryCode ?? '82',
  });
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

// 선택된 키오스크만 해제 (운영자 토큰은 유지) — 관리자 모드에서 '키오스크 변경' 시 사용.
// 이후 페이지를 리로드하면 KioskBootstrap이 다시 셀렉터를 띄운다.
export const clearSelectedKioskIdAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(kioskSelectedIdKey);
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

// admin(상담실) 카드결제용 — 결제 상세 없이 paymentId만 경량 발급. GET /kiosks/admin/payment
export const getKioskAdminPaymentAction = async (item: string, itemId: number) => {
  return await api.kiosk.getAdminPayment({ item, itemId });
};

// admin(상담실) 현장결제(현금) — paymentId 없이 수동 결제기록 생성. methodType='admin'. POST /paymentRecords/manual
export const createAdminManualPaymentAction = async (params: {
  item: import("@/app/endpoint/payment.record.endpoint").ManualPaymentItem;
  itemId: number;
  targetUserId: number;
  amount?: number;
  discounts?: import("@/app/endpoint/payment.endpoint").DiscountResponse[];
}) => {
  return await api.paymentRecord.createManual({ methodType: 'admin', ...params });
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
