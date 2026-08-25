'use client'

import React, {useState, useEffect, useCallback, useRef} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {KioskCardPaymentDialog} from "@/app/kiosk/KioskCardPaymentDialog";
import {KioskHomeForm} from "@/app/kiosk/KioskHomeForm";
import {AdminKioskHomeForm} from "@/app/kiosk/AdminKioskHomeForm";
import {AdminKioskPaymentForm} from "@/app/kiosk/AdminKioskPaymentForm";
import {AdminKioskPaymentSuccess} from "@/app/kiosk/AdminKioskPaymentSuccess";
import {KioskPrinterDebugOverlay} from "@/app/kiosk/KioskPrinterDebugOverlay";
import {KioskLessonListForm} from "@/app/kiosk/KioskLessonListForm";
import {GetLessonResponse, BundleSummaryResponse} from "@/app/endpoint/lesson.endpoint";
import {formatLessonDate, formatLessonStart} from "@/app/kiosk/kiosk.lesson";
import {KioskLessonDetailModal} from "@/app/kiosk/KioskLessonDetailModal";
import {KioskPhoneInputForm} from "@/app/kiosk/KioskPhoneInputForm";
import {KioskMemberConfirmModal} from "@/app/kiosk/KioskMemberConfirmModal";
import {KioskPaymentMethodForm} from "@/app/kiosk/KioskPaymentMethodForm";
import {KioskPassSelectModal} from "@/app/kiosk/KioskPassSelectModal";
import {KioskAttendanceForm} from "@/app/kiosk/KioskAttendanceForm";
import {KioskAttendanceSelectForm} from "@/app/kiosk/KioskAttendanceSelectForm";
import {KioskLessonAttendanceForm} from "@/app/kiosk/KioskLessonAttendanceForm";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";
import {searchUserAction, registerKioskUserAction, getKioskPaymentAction, startKioskPaymentAction, completeKioskPaymentAction, discardKioskPaymentAction, useKioskPassAction, getKioskDetailAction, getKioskAdminPaymentAction, createAdminManualPaymentAction, getKioskLessonPoliciesAction} from "@/app/kiosk/kiosk.actions";
import {GetPaymentResponse, DiscountResponse, PaymentDiscount} from "@/app/endpoint/payment.endpoint";
import {KioskPhonePadType, KioskTicketSummary} from "@/app/endpoint/kiosk.endpoint";
import {LessonPricePolicyResponse} from "@/app/endpoint/payment.endpoint";
import {GetPassResponse, PassRuleResponse} from "@/app/endpoint/pass.endpoint";
import {KioskNewUserDialog} from "@/app/kiosk/KioskNewUserDialog";
import {AdminKioskNewUserDialog} from "@/app/kiosk/AdminKioskNewUserDialog";
import {KioskAdminModal} from "@/app/kiosk/KioskAdminModal";
import {KioskCashConfirmDialog} from "@/app/kiosk/KioskCashConfirmDialog";
import {generateRandomNickname} from "@/app/kiosk/random.nickname";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {GetPassPlanResponse} from "@/app/endpoint/pass.endpoint";
import {formatFeatureDescription, formatRuleDescription} from "@/utils/pass.description";
import {buildKioskReceipt} from "@/app/kiosk/kiosk.receipt";
import {sendReceiptToPrinter} from "@/app/kiosk/kiosk.native";
import {initKisDebug, recordKisResponse, setKisDebugContext} from "@/app/kiosk/kiosk.kis.debug";
import {KisDebugOverlay} from "@/app/kiosk/KisDebugOverlay";
import {KioskRoomReservationForm, KioskRoomBooking} from "@/app/kiosk/KioskRoomReservationForm";
import {Toast} from "@/app/components/Toast";
import {trackEvent} from "@/app/lib/analytics";

type SearchedUser = {
  id: number;
  name?: string;
  nickName?: string;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
  accessToken?: string;
};

type KioskScreen = 'home' | 'lesson-list' | 'lesson-detail' | 'phone' | 'searching' | 'member-confirm' | 'payment-method' | 'pass-select' | 'attendance-select' | 'attendance' | 'lesson-attendance' | 'admin-payment' | 'room-reservation';

const VALID_SCREENS: KioskScreen[] = ['home', 'lesson-list', 'lesson-detail', 'phone', 'searching', 'member-confirm', 'payment-method', 'pass-select', 'attendance-select', 'attendance', 'lesson-attendance', 'admin-payment', 'room-reservation'];

// KIS는 매입됐는데 서버 /complete가 실패한 결제 — 클라가 가진 KIS 응답으로 나중에 자동 재시도하기 위한 로컬 큐.
// (카드에서 돈은 빠졌으니 유실 없이 반드시 서버에 기록되도록)
const PENDING_COMPLETE_KEY = 'kiosk_pending_completions';
type CompleteArgs = Parameters<typeof completeKioskPaymentAction>[0];
const loadPendingCompletions = (): CompleteArgs[] => {
  try { return JSON.parse(localStorage.getItem(PENDING_COMPLETE_KEY) ?? '[]'); } catch { return []; }
};
const savePendingCompletion = (args: CompleteArgs) => {
  try {
    const list = loadPendingCompletions();
    // 같은 paymentId 중복 저장 방지
    if (!list.some((a) => a.paymentId === args.paymentId)) list.push(args);
    localStorage.setItem(PENDING_COMPLETE_KEY, JSON.stringify(list));
  } catch { /* localStorage 불가 환경 무시 */ }
};
const removePendingCompletion = (paymentId: string) => {
  try {
    const list = loadPendingCompletions().filter((a) => a.paymentId !== paymentId);
    localStorage.setItem(PENDING_COMPLETE_KEY, JSON.stringify(list));
  } catch { /* noop */ }
};

// 결제/패스사용 응답 표준화 — start/complete/use 응답의 제각각 shape 판별을 한 곳으로 통일.
// paymentId가 있고 도메인 에러(isGuinnessErrorCase)가 아니면 성공. 실패면 code/message로 안내.
type ParsedPaymentResult = {
  ok: boolean;
  paymentId?: string;
  amount?: number;
  qrCodeUrl?: string | null;
  rank?: string | null;
  /** 발급된 수강권 요약. 자동 사용처리된 건은 status='Used'로 오고 qrCodeUrl/rank는 비어 있다. */
  ticket?: KioskTicketSummary | null;
  code?: string;
  message?: string;
};

const parsePaymentResult = (res: unknown): ParsedPaymentResult => {
  const r = res as { code?: string; message?: string; paymentId?: string; amount?: number; qrCodeUrl?: string | null; rank?: string | null; ticket?: KioskTicketSummary | null };
  const ok = !!r.paymentId && !isGuinnessErrorCase(res);
  return {
    ok,
    paymentId: r.paymentId,
    amount: r.amount,
    qrCodeUrl: r.qrCodeUrl ?? null,
    rank: r.rank ?? null,
    ticket: r.ticket ?? null,
    code: r.code,
    message: r.message,
  };
};

export type KioskFormProps = {
  studioId: number;
  studioName: string;
  studioProfileImageUrl?: string;
  studioReceiptFooter?: string;
  studioAddress?: string;
  studioBusinessNumber?: string;
  studioRepresentative?: string;
  studioPhone?: string;
  kioskId: number;
  kioskName?: string;
  kioskImageUrl?: string;
  /** 관리자 모드 진입 비밀번호 — BE에서 키오스크 단위로 내려주는 값 */
  kioskPassword?: string;
  /** 전화 입력 패드 형태 — 'Short'면 뒷 4자리, 'Default'(기본)면 전체 번호. 모든 전화 입력 UI가 이 값 하나로 분기한다. */
  phonePadType?: KioskPhonePadType;
  canCheckIn: boolean;
  canPurchase: boolean;
  canBookRoom?: boolean;
  canLessonAttendance?: boolean;
  passPlans: GetPassPlanResponse[];
  /** 'admin'이면 홈을 태블릿 상담실 UI(AdminKioskHomeForm)로 교체. 결제/출첵 등 하위 플로우는 공유. 기본 'kiosk'. */
  variant?: 'kiosk' | 'admin';
};

export const KioskForm = ({
  studioId,
  studioName,
  studioProfileImageUrl,
  studioReceiptFooter,
  studioAddress,
  studioBusinessNumber,
  studioRepresentative,
  studioPhone,
  kioskId,
  kioskName,
  kioskImageUrl,
  kioskPassword,
  phonePadType,
  canCheckIn,
  canPurchase,
  canBookRoom = false,
  canLessonAttendance = false,
  passPlans,
  variant = 'kiosk',
}: KioskFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = (() => {
    const s = searchParams.get('step');
    return s && (VALID_SCREENS as string[]).includes(s) ? (s as KioskScreen) : 'home';
  })();
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>(initialStep);

  // currentScreen 변경 시 URL ?step=... 동기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (currentScreen === 'home') params.delete('step');
    else params.set('step', currentScreen);
    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (window.location.pathname + window.location.search !== nextUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [currentScreen, router]);
  const [selectedLesson, setSelectedLesson] = useState<GetLessonResponse | null>(null);
  const [selectedPassPlan, setSelectedPassPlan] = useState<GetPassPlanResponse | null>(null);
  // 연습실 예약 (패스권 전용). 설정되면 결제 대상이 practice-room이 됨.
  const [roomBooking, setRoomBooking] = useState<KioskRoomBooking | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<BundleSummaryResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pass' | 'cash' | 'onsite' | null>(null);
  // admin 현장결제 중복 제출 방지
  const adminOnsiteBusyRef = useRef(false);
  // admin 결제(카드/현장)에서 직원이 편집한 실결제 금액 — 성공 화면 금액 표시에 사용
  const [adminPaidAmount, setAdminPaidAmount] = useState<number | null>(null);
  // admin(상담실) — 가격 정책 수업의 방식 목록 (수업 상세 보충 조회). 무인은 결제 조회 응답에 실려 온다.
  const [adminPolicies, setAdminPolicies] = useState<LessonPricePolicyResponse[]>([]);
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('82');
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [locale, setLocale] = useState<Locale>('ko');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 'canceled' = KIS 단말에서 사용자가 ESC/취소 — 실패 다이얼로그는 띄우지 않고 Pending 폐기만 트리거
  const [paymentResult, setPaymentResult] = useState<{ status: 'success' | 'fail' | 'canceled'; data: Record<string, unknown> } | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newUserDialog, setNewUserDialog] = useState<{ phone: string; countryCode: string; suggestedName: string } | null>(null);
  const [printerDebugOpen, setPrinterDebugOpen] = useState(false);
  const [printerDebugResult, setPrinterDebugResult] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<GetPaymentResponse | null>(null);
  const [paymentInfoError, setPaymentInfoError] = useState<string | null>(null);
  const [kioskReceiptFooter, setKioskReceiptFooter] = useState<string | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountResponse | null>(null);
  const [selectedPass, setSelectedPass] = useState<{ pass: GetPassResponse; rule: PassRuleResponse } | null>(null);
  const [paymentQrCodeUrl, setPaymentQrCodeUrl] = useState<string | null>(null);
  // 가격 정책 수업(정기)에서 사용자가 고른 방식. null이면 기본 정책(isRecommended → 첫 번째)로 폴백.
  const [selectedKioskPolicyId, setSelectedKioskPolicyId] = useState<number | null>(null);
  // BE complete 응답의 rank 라벨 (예: "No. 7 (A Group)") — 영수증 임팩트 박스에 노출
  const [paymentRank, setPaymentRank] = useState<string | null>(null);
  // 발급된 수강권 상태. 'Used'면 학원이 자동 사용처리를 켜둔 상태로 출석까지 끝난 것 — 성공 화면에서 QR 체크인 불필요 안내
  const [paymentTicketStatus, setPaymentTicketStatus] = useState<KioskTicketSummary['status'] | null>(null);
  // 패스권 사용 시 응답으로 받는 paymentId — 영수증의 결제번호 라인에 노출 (paymentInfo.paymentId보다 우선)
  const [receiptPaymentIdOverride, setReceiptPaymentIdOverride] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [cashConfirmOpen, setCashConfirmOpen] = useState(false);
  const [noPassDialogOpen, setNoPassDialogOpen] = useState(false);
  const [noPassDialogClosing, setNoPassDialogClosing] = useState(false);
  // 다른 다이얼로그와 동일하게 fade/scale out 후 언마운트
  const closeNoPassDialog = useCallback(() => {
    setNoPassDialogClosing(true);
    setTimeout(() => { setNoPassDialogOpen(false); setNoPassDialogClosing(false); }, 200);
  }, []);
  // 패스권 구매 직후 "수업 신청하러 가기" 흐름에서 자동으로 사용할 passPlan id
  // 설정돼 있으면 lesson 선택 후 phone/member-confirm/payment-method 단계 모두 스킵하고 패스권을 즉시 사용
  const [autoUsePassPlanId, setAutoUsePassPlanId] = useState<number | null>(null);
  const [cardPayingVariant, setCardPayingVariant] = useState<'card' | 'applepay' | 'kakaopay' | 'zeropay'>('card');
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  // 전화 입력 형태 — variant(admin/kiosk)나 플로우(구매/출석)와 무관하게 오직 phonePadType으로만 분기.
  // 검색 API가 LIKE 연산이라 뒷 4자리로도 회원 조회가 된다.
  const phoneInputMode: 'phone' | 'lastFour' = phonePadType === 'Short' ? 'lastFour' : 'phone';

  // 출석 체크 진입 — 둘 다 가능하면 선택 화면, 하나만 가능하면 해당 출석으로 바로 이동.
  const enterAttendance = () => {
    if (canCheckIn && canLessonAttendance) setCurrentScreen('attendance-select');
    else if (canCheckIn) setCurrentScreen('attendance');
    else setCurrentScreen('lesson-attendance');
  };

  // 홈 진입 시 손님 세션 상태만 정리 (운영자 토큰은 유지)
  const goHome = useCallback(async () => {
    setCurrentScreen('home');
    setSelectedLesson(null);
    setSelectedPassPlan(null);
    setRoomBooking(null);
    setSelectedBundle(null);
    setPhone('');
    setPhoneCountryCode('82');
    setSearchedUsers([]);
    setSelectedUser(null);
    setPaymentMethod(null);
    setPaymentInfo(null);
    setPaymentInfoError(null);
    setKioskReceiptFooter(null);
    setSelectedDiscount(null);
    setSelectedPass(null);
    setPaymentQrCodeUrl(null);
    setPaymentRank(null);
    setPaymentTicketStatus(null);
    setSelectedKioskPolicyId(null);
    setReceiptPaymentIdOverride(null);
    setAutoUsePassPlanId(null);
    setAdminPaidAmount(null);
    lastFetchedKeyRef.current = null;
    completedPaymentIdsRef.current.clear();
    activePaymentIdRef.current = null;
    discardContextRef.current = null;
  }, []);

  // 홈 외 화면에서 2분간 사용자 인터랙션이 없으면 자동으로 홈 복귀.
  //  - touch/mouse/keyboard 이벤트마다 타이머 리셋
  //  - goHome이 selectedUser 등 손님 세션 전체를 초기화 (다음 사용자가 새로 시작하도록)
  //  - 홈 화면 자체엔 타임아웃 미적용
  useEffect(() => {
    // admin(상담실)은 직원이 진행하므로 자동 홈 복귀(무입력 타임아웃) 미적용
    if (currentScreen === 'home' || variant === 'admin') return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const IDLE_MS = 2 * 60 * 1000;
    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { goHome(); }, IDLE_MS);
    };
    reset();
    const events: (keyof WindowEventMap)[] = ['touchstart', 'touchmove', 'mousedown', 'keydown', 'click'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [currentScreen, goHome, variant]);

  // URL ?step= 으로 직접 진입했지만 필요한 state가 없으면 안전한 단계로 폴백
  useEffect(() => {
    const hasItem = !!selectedLesson || !!selectedPassPlan || !!roomBooking || !!selectedBundle;
    const hasUser = !!selectedUser;
    if (currentScreen === 'lesson-detail' && !selectedLesson) {
      setCurrentScreen('lesson-list');
      return;
    }
    if ((currentScreen === 'phone' || currentScreen === 'searching' || currentScreen === 'member-confirm')
      && !hasItem) {
      setCurrentScreen('lesson-list');
      return;
    }
    if (currentScreen === 'member-confirm' && !hasUser) {
      setCurrentScreen('phone');
      return;
    }
    if ((currentScreen === 'payment-method' || currentScreen === 'pass-select' || currentScreen === 'admin-payment')
      && (!hasItem || !hasUser)) {
      setCurrentScreen(hasItem ? 'phone' : 'lesson-list');
    }
  }, [currentScreen, selectedLesson, selectedPassPlan, roomBooking, selectedUser]);

  // payment-method 화면 진입 시:
  //  1) GET /kiosks/payment — price/discounts/methods/paymentId
  //  2) GET /kiosks/:id     — kiosk별 receiptFooter 등 상세 (영수증 하단 안내 문구)
  // 두 호출은 서로 독립이라 병렬로 보냄.
  const lastFetchedKeyRef = useRef<string | null>(null);
  // 가격 정책 수업 — 조회와 결제 사이에 다른 학생이 먼저 사면 LESSON_GROUP_* 에러가 난다.
  // 그때 이 카운터를 올려 결제 상세를 재조회해 방식 목록(usable/reason)을 갱신한다.
  const [paymentInfoRefreshKey, setPaymentInfoRefreshKey] = useState(0);
  // Fix A — complete 성공으로 확정된 paymentId 집합. 같은 paymentId로 2차 create/단말 호출을 원천 차단.
  const completedPaymentIdsRef = useRef<Set<string>>(new Set());
  // Fix B — 현재 진행 중인 활성 카드결제 시도의 paymentId. 단말 호출 직전 설정, 결과 처리 시 해제.
  //         값이 없으면 이미 완료/폐기된 세션에 뒤늦게 온 '유령' 단말 응답으로 본다.
  const activePaymentIdRef = useRef<string | null>(null);
  // 유령 응답에서 폐기 DELETE를 쏠 때 쓰는 컨텍스트(paymentId/kioskId). 스테일 클로저 회피용으로 단말 호출 직전 갱신.
  const discardContextRef = useRef<{ paymentId: string; kioskId: number } | null>(null);

  useEffect(() => {
    // admin-payment는 경량 GET /kiosks/admin/payment로 결제 시점에 paymentId를 따로 받으므로 여기서 heavy fetch 안 함
    if (currentScreen !== 'payment-method' || !selectedUser || !kioskId) return;
    if (!selectedLesson && !selectedPassPlan && !roomBooking && !selectedBundle) return;
    const item = selectedLesson ? 'lesson' : selectedPassPlan ? 'pass-plan' : roomBooking ? 'practice-room' : 'bundle';
    const itemId = selectedLesson?.id ?? selectedPassPlan?.id ?? roomBooking?.studioRoomId ?? selectedBundle?.id;
    if (!itemId) return;

    // 같은 selection으로 재진입(예: pass-select 갔다오기)일 땐 fetch/reset skip → 선택해둔 할인/패스권 보존.
    // key 변하면 새 transaction이므로 stale state 즉시 클리어 + refetch.
    const key = `${selectedUser.id}:${item}:${itemId}:${kioskId}:${paymentInfoRefreshKey}`;
    if (lastFetchedKeyRef.current === key) return;
    lastFetchedKeyRef.current = key;

    setPaymentInfo(null);
    setPaymentInfoError(null);
    setSelectedDiscount(null);
    setSelectedPass(null);
    setPaymentMethod(null);
    setPaymentResult(null);
    setPaymentQrCodeUrl(null);
    setSelectedKioskPolicyId(null);
    setReceiptPaymentIdOverride(null);
    const fallbackErr = getLocaleString({ locale, key: 'kiosk_search_failed' });

    getKioskPaymentAction({ kioskId, targetUserId: selectedUser.id, item, itemId })
      .then((res) => {
        // isGuinnessErrorCase는 enum 등록된 코드만 통과시켜서 TICKET_ALREADY_EXISTS 같은
        // 신규/도메인별 에러 코드를 못 잡음. shape으로 직접 판별 — code+message 있고 paymentId 없으면 에러.
        const r = res as { code?: string; message?: string; paymentId?: string };
        if (typeof r.code === 'string' && typeof r.message === 'string' && !r.paymentId) {
          setPaymentInfoError(r.message);
          return;
        }
        setPaymentInfo(res as GetPaymentResponse);
      })
      .catch(() => {
        setPaymentInfoError(fallbackErr);
      });

    getKioskDetailAction(kioskId)
      .then((res) => {
        const r = res as { receiptFooter?: string; code?: string };
        if (!r.code && r.receiptFooter !== undefined) setKioskReceiptFooter(r.receiptFooter ?? null);
      })
      .catch(() => {
        // kiosk 상세 실패는 영수증 footer 없이 진행 — 토스트도 띄우지 않음 (결제 본 흐름엔 영향 없음)
      });
  }, [currentScreen, selectedUser, selectedLesson, selectedPassPlan, roomBooking, kioskId, locale, paymentInfoRefreshKey]);

  // KIS 응답 디버그 채널 준비 — 환경(staging/prod) 1회 조회 + 리포트에 실을 키오스크 컨텍스트 등록
  useEffect(() => {
    setKisDebugContext({ kioskId, kioskName });
    initKisDebug();
  }, [kioskId, kioskName]);

  // KIS 결제 응답 콜백을 마운트 시 한 번만 등록
  useEffect(() => {
    type KisResult = {
      success?: boolean;
      canceled?: boolean;
      outTranCode?: string;
      outReplyCode?: string;
      outReplyMsg1?: string;
    };
    type KisWindow = Window & { onKisPaymentResult?: (result: KisResult) => void };

    (window as KisWindow).onKisPaymentResult = (result) => {
      // KIS raw 응답 수집 — staging은 KisDebugOverlay에 표시, prod는 Discord 전송.
      // 조기 return(D2 위임/유령 응답)보다 앞에서 기록해 어떤 응답도 놓치지 않게 한다.
      recordKisResponse('payment', result, activePaymentIdRef.current ?? discardContextRef.current?.paymentId);
      // 단일 채널이라 D2(취소) 응답이 여기로 올 수 있음 — admin 모달이 처리. 여기선 D1만 다룸.
      if (result?.outTranCode === 'D2') return;

      const data = (result ?? {}) as Record<string, unknown>;

      // Fix B — 진행 중인 활성 카드결제 시도가 없으면(이미 완료/폐기된 세션에 뒤늦게 온 유령 단말 응답).
      //         이 핸들러는 마운트 시 1회만 등록되어 state 클로저가 스테일하므로 활성 여부는 반드시 ref로 판단.
      //         유령 실패/취소는 폐기 DELETE만 fire-and-forget로 쏘고(응답 미참조), paymentResult는 건드리지 않아
      //         진행 중인 성공 화면/영수증 등 UI를 그대로 유지한다(오탐 실패 다이얼로그 방지).
      if (!activePaymentIdRef.current) {
        if (!result?.success) {
          const ctx = discardContextRef.current;
          if (ctx) {
            const reason = JSON.stringify({ status: result?.canceled ? 'canceled' : 'fail', kis: data });
            discardKioskPaymentAction(ctx.paymentId, ctx.kioskId, reason).catch(() => {});
          }
        }
        return;
      }
      // 이 결과로 활성 시도를 소비 — 같은 시도에 대한 중복/후속 유령 응답을 차단.
      activePaymentIdRef.current = null;

      setIsPaying(false);
      if (result?.canceled) {
        // 사용자 ESC — Pending 폐기는 paymentResult.status='canceled' 핸들러에서 처리
        setPaymentResult({ status: 'canceled', data });
        return;
      }
      setPaymentResult({ status: result?.success ? 'success' : 'fail', data });
    };

    return () => {
      delete (window as KisWindow).onKisPaymentResult;
    };
  }, []);

  // 시리얼 프린터 응답 콜백을 마운트 시 한 번만 등록
  useEffect(() => {
    type SerialPrintResult = {
      success?: boolean;
      canceled?: boolean;
      error?: string;
      resultCode?: string | number;
      device?: string;
      baud?: number;
      queries?: Array<{ query?: string; len?: number; hex?: string; ascii?: string }>;
    };
    type SerialWindow = Window & { onSerialPrintResult?: (result: SerialPrintResult) => void };

    (window as SerialWindow).onSerialPrintResult = (result) => {
      console.log('Print result:', result);
      // 진단 query 응답이 오면 화면에 dump
      if (result?.queries && Array.isArray(result.queries)) {
        setPrinterDebugResult(JSON.stringify(result, null, 2));
        return;
      }
      // 인쇄 성공/실패는 토스트로 노출하지 않음 — 영수증 종이가 곧 결과. 실패는 콘솔만 남기고 운영자가 admin에서 재인쇄.
      if (!result?.success && !result?.canceled) {
        console.warn('영수증 인쇄 실패:', result?.error ?? result?.resultCode);
      }
    };

    return () => {
      delete (window as SerialWindow).onSerialPrintResult;
    };
  }, []);


  // 결제 성공 처리:
  //  - pass: 백엔드 record 미생성 — 바로 인쇄
  //  - cash: handleCashPayment에서 이미 POST → qrCodeUrl 수령 → 바로 인쇄
  //  - card: KIS 매입 성공 → POST /kiosks/payments/:id/complete → 응답의 qrCodeUrl 사용 → 인쇄
  // 인쇄 후 5초 자동 홈.
  useEffect(() => {
    if (paymentResult?.status !== 'success') return;

    let cancelled = false;
    let homeTimer: ReturnType<typeof setTimeout> | undefined;
    const finishUp = (qrText?: string, rankText?: string, ticketStatus?: KioskTicketSummary['status'] | null) => {
      if (cancelled) return;
      handlePrintReceipt(qrText, rankText, ticketStatus);
      if (variant !== 'admin') homeTimer = setTimeout(() => { setPaymentResult(null); goHome(); }, 5000);
    };

    if (paymentMethod === 'pass') {
      // 패스권 사용 응답의 qrCodeUrl을 영수증 QR로 사용 (paymentQrCodeUrl 상태에 이미 보관됨)
      finishUp(paymentQrCodeUrl ?? undefined);
      return () => { cancelled = true; if (homeTimer) clearTimeout(homeTimer); };
    }

    if (paymentMethod === 'cash') {
      finishUp(paymentQrCodeUrl ?? undefined);
      return () => { cancelled = true; if (homeTimer) clearTimeout(homeTimer); };
    }

    if (paymentMethod !== 'card') return;
    if (!selectedUser || !kioskId || !paymentItem) return;

    // 카드: KIS 응답에서 매입 정보 추출 → /complete 호출
    const data = paymentResult.data;
    const str = (k: string): string | undefined =>
      typeof data[k] === 'string' && data[k] ? (data[k] as string) : undefined;
    const num = (k: string): number | undefined =>
      typeof data[k] === 'number' ? (data[k] as number) : undefined;

    // KIS가 echo한 outCustomerUuid를 진짜 매입된 paymentId로 사용 — paymentInfo.paymentId가 그 사이 다른 값으로 바뀐 케이스 대비
    // (이전에는 paymentInfo.paymentId만 사용해 KIS 매입은 됐는데 서버는 다른 paymentId로 complete 시도 → KIOSK_PAYMENT_NOT_PENDING 발생)
    const completePaymentId = str('outCustomerUuid') ?? effectivePaymentId;
    if (!completePaymentId) return;

    const finalAmount = Math.max(0, effectivePrice - (selectedDiscount?.amount ?? 0));
    const rawAuthDate = str('outAuthDate');
    const authDate = rawAuthDate ? rawAuthDate.slice(0, 8) : '';

    // KIS 승인액(outTotAmt)을 항상 우선 — 서버엔 실제 매입 금액으로 기록(폼 표시가 0이어도 승인액으로).
    const completeArgs: CompleteArgs = {
      paymentId: completePaymentId,
      targetUserId: selectedUser.id,
      kioskId,
      authNo: str('outAuthNo') ?? '',
      authDate,
      vanKey: str('outVanKey') ?? '',
      totalAmount: num('outTotAmt') ?? finalAmount,
      cardBrand: str('outIssuerName'),
      cardNumber: str('outCardNo'),
      vanResponse: data,
      // 연습실 예약이면 결제 시작(POST /kiosks/payments)에 보낸 시간대를 그대로 재전송.
      // completeArgs는 실패 시 localStorage 재시도 큐에도 저장되므로 나중 재시도에도 같은 값이 실린다.
      ...(roomBooking ? { startDate: roomBooking.startDate, endDate: roomBooking.endDate } : {}),
    };

    // KIS는 이미 매입 완료 — 서버 complete가 실패해도 클라가 가진 이 정보로 재시도해서 반드시 기록되게 한다.
    const runCompleteWithRetry = async () => {
      const MAX = 3;
      for (let attempt = 1; attempt <= MAX; attempt++) {
        try {
          const res = await completeKioskPaymentAction(completeArgs);
          if (cancelled) return;
          const parsed = parsePaymentResult(res);
          if (parsed.ok) {
            // Fix A — complete 성공으로 확정된 paymentId 기록 → 같은 paymentId로 2차 create/단말 호출 차단.
            completedPaymentIdsRef.current.add(completePaymentId);
            if (paymentInfo?.paymentId) completedPaymentIdsRef.current.add(paymentInfo.paymentId);
            removePendingCompletion(completePaymentId);
            applyReceiptFields(parsed);
            // setPaymentQrCodeUrl/setPaymentRank는 비동기라 같은 tick의 handlePrintReceipt 클로저엔 반영 안 됨 → 값을 인자로 직접 전달
            finishUp(parsed.qrCodeUrl ?? undefined, parsed.rank ?? undefined, parsed.ticket?.status ?? null);
            return;
          }
          // 도메인 에러(res.ok=false) — 마지막 시도까지 재시도 후 로컬 큐로 보관
        } catch {
          if (cancelled) return;
        }
        if (attempt < MAX) await new Promise((r) => setTimeout(r, 800 * attempt));
      }
      if (cancelled) return;
      // 재시도 모두 실패 — KIS 정보 로컬 보관(다음 진입/키오스크 로드 시 자동 재시도) + 안내
      savePendingCompletion(completeArgs);
      setToastMessage('결제 기록 저장에 실패했어요. 잠시 후 자동으로 다시 시도돼요');
      if (variant !== 'admin') homeTimer = setTimeout(() => { setPaymentResult(null); goHome(); }, 5000);
    };
    runCompleteWithRetry();

    return () => { cancelled = true; if (homeTimer) clearTimeout(homeTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentResult, paymentMethod]);

  // 미완료(서버 저장 실패) 결제 자동 복구 — 저장해둔 KIS 정보로 마운트 시 재시도. 성공하면 큐에서 제거.
  useEffect(() => {
    const pending = loadPendingCompletions();
    if (pending.length === 0) return;
    (async () => {
      for (const args of pending) {
        try {
          const res = await completeKioskPaymentAction(args);
          const parsed = parsePaymentResult(res);
          if (parsed.ok) removePendingCompletion(args.paymentId);
          // 실패면 큐에 유지 — 다음 기회에 재시도
        } catch { /* 유지 */ }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KIS 실패/취소 → Pending 폐기. 'fail'은 실패 다이얼로그도 함께 노출, 'canceled'는 조용히 폼으로 복귀.
  // 폐기 대상 paymentId도 outCustomerUuid를 우선 사용 (state staleness로 다른 paymentId 폐기되는 사고 방지)
  useEffect(() => {
    if (paymentResult?.status !== 'fail' && paymentResult?.status !== 'canceled') return;
    if (paymentMethod !== 'card') return;
    if (!kioskId) return;

    const data = paymentResult.data;
    const outCustomerUuid = typeof data?.outCustomerUuid === 'string' ? data.outCustomerUuid : undefined;
    const discardPaymentId = outCustomerUuid || paymentInfo?.paymentId;
    if (!discardPaymentId) return;

    // 진단용: KIS VAN 응답 raw + 클라가 매긴 status를 reason 필드로 동봉.
    // 서버 로그에서 폐기 트리거 원인(어떤 outReplyCode/outTranCode가 들어왔는지)을 추적 가능.
    const reason = JSON.stringify({
      status: paymentResult.status,
      kis: paymentResult.data ?? null,
    });

    discardKioskPaymentAction(discardPaymentId, kioskId, reason).catch(() => {
      // 폐기 실패는 사용자에게 노출 안 함 — 관리자가 paymentRecords에서 수동 폐기 가능
      console.warn('Pending 폐기 실패');
    });

    if (paymentResult.status === 'canceled') {
      // 사용자가 단말에서 ESC — 결제 방법 화면으로 조용히 복귀
      setPaymentResult(null);
    }
  }, [paymentResult, paymentMethod, paymentInfo, kioskId]);

  // 전화번호 입력 → /users/search?query=phone 으로 검색 (운영자 토큰 사용)
  const handlePhoneNext = async (phoneNumber: string, countryCode: string = '82') => {
    setPhone(phoneNumber);
    setPhoneCountryCode(countryCode || '82');
    setCurrentScreen('searching');
    setErrorMessage(null);

    try {
      const res = await searchUserAction(phoneNumber);
      if (isGuinnessErrorCase(res)) {
        setErrorMessage(res.message ?? '검색에 실패했습니다.');
        setCurrentScreen('phone');
        return;
      }
      if (!res.users || res.users.length === 0) {
        // 뒷 4자리 모드에선 신규 가입 불가(4자리는 진짜 전화번호가 아님) — 미조회 안내만
        if (phoneInputMode === 'lastFour') {
          setErrorMessage(t('kiosk_new_user_notice'));
          setCurrentScreen('phone');
          return;
        }
        // 유저 없음 → 신규 가입 다이얼로그
        setNewUserDialog({ phone: phoneNumber, countryCode, suggestedName: generateRandomNickname() });
        setCurrentScreen('phone');
        return;
      }
      // 첫 번째 매칭 유저 사용
      const u = res.users[0];
      setSelectedUser({
        id: u.id,
        name: u.name,
        nickName: u.nickName,
        email: u.email,
      });
      setCurrentScreen('member-confirm');
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 이메일로 회원 검색 — 전화번호 흐름과 별개. 매칭 없으면 신규 가입 다이얼로그 대신 에러만 표시 (이메일은 자동 가입 흐름이 없음)
  const handleEmailSearch = async (email: string) => {
    setCurrentScreen('searching');
    setErrorMessage(null);
    try {
      const res = await searchUserAction(email);
      if (isGuinnessErrorCase(res)) {
        setErrorMessage(res.message ?? '검색에 실패했습니다.');
        setCurrentScreen('phone');
        return;
      }
      if (!res.users || res.users.length === 0) {
        setErrorMessage('일치하는 회원이 없습니다.');
        setCurrentScreen('phone');
        return;
      }
      const u = res.users[0];
      setSelectedUser({
        id: u.id,
        name: u.name,
        nickName: u.nickName,
        email: u.email,
      });
      setCurrentScreen('member-confirm');
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 신규 가입 확인 → 등록 후 결제 수단 선택으로 바로 진입
  // (사용자가 이미 다이얼로그에서 가입을 명시 확인했으므로 member-confirm 단계는 생략)
  const handleConfirmNewUser = async (nameOverride?: string) => {
    if (!newUserDialog) return;
    const { phone: p, countryCode: cc, suggestedName } = newUserDialog;
    // admin은 직원이 입력한 이름을 name으로 저장 (미입력이면 suggestedName)
    const name = nameOverride?.trim() || undefined;
    setNewUserDialog(null);
    setCurrentScreen('searching');
    try {
      const reg = await registerKioskUserAction(p, cc, suggestedName, name);
      if (isGuinnessErrorCase(reg)) {
        setErrorMessage('가입에 실패했습니다.\n다시 시도해주세요.');
        setCurrentScreen('phone');
        return;
      }
      setSelectedUser({
        id: (reg as { id: number }).id,
        name: (reg as { name?: string }).name ?? name ?? suggestedName,
        nickName: (reg as { nickName?: string }).nickName,
      });
      setCurrentScreen(variant === 'admin' ? 'admin-payment' : 'payment-method');
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 유저 확인 → 결제 수단 선택으로 이동 (운영자 토큰 유지, 손님 정보는 selectedUser 상태로만 들고 감)
  const handleConfirmUser = async () => {
    if (!selectedUser) return;
    // admin(상담실)은 결제수단 선택 대신 상품+금액 편집 결제 폼으로 진입
    setCurrentScreen(variant === 'admin' ? 'admin-payment' : 'payment-method');
  };

  // 결제 대상(수업/패스권 공통) — 둘 중 선택된 것을 통일된 형태로 반환
  const paymentItem = selectedLesson
    ? {
        title: selectedLesson.title ?? '',
        price: selectedLesson.price ?? 0,
        subtitle: [formatLessonDate(selectedLesson, locale), formatLessonStart(selectedLesson, locale)].filter(Boolean).join(' · '),
        thumbnailUrl: selectedLesson.thumbnailUrl,
        benefits: [] as string[],
      }
    : selectedPassPlan
      ? {
          title: selectedPassPlan.name,
          price: selectedPassPlan.price ?? 0,
          subtitle: selectedPassPlan.expireDateStamp,
          thumbnailUrl: selectedPassPlan.imageUrl ?? undefined,
          benefits: [
            ...(selectedPassPlan.rules ?? []).map((r) =>
              r.target && r.benefit
                ? formatRuleDescription({ target: r.target, benefit: r.benefit, duration: r.duration, excludes: r.excludes }, locale, selectedPassPlan.name)
                : (r.description ?? '')
            ),
            ...(selectedPassPlan.features ?? []).map((f) =>
              formatFeatureDescription(f.key, locale, f.value) || f.description || f.key
            ),
          ].filter(Boolean),
        }
      : roomBooking
        ? {
            title: roomBooking.roomName,
            price: roomBooking.price,
            subtitle: `${roomBooking.date} ${roomBooking.startTime}~${roomBooking.endTime}`,
            thumbnailUrl: undefined as string | undefined,
            benefits: [] as string[],
          }
      : selectedBundle
        ? {
            title: selectedBundle.name,
            price: selectedBundle.price ?? 0,
            subtitle: selectedBundle.description ?? '',
            thumbnailUrl: selectedBundle.items?.[0]?.imageUrl ?? selectedBundle.items?.[0]?.thumbnailUrl,
            benefits: (selectedBundle.items ?? []).map((it) => it.title).filter(Boolean),
          }
        : null;

  // 가격 정책 수업(정기) — 결제 조회 응답의 정책 목록에서 방식을 고르고 그 항목의 paymentId('LGT…')로 결제한다.
  // 키오스크엔 자동 결제 수단이 없어 갱신은 걸리지 않고, 한 번의 결제로 lessonCount만큼 수강권이 발급된다.
  // 판매 중단(Cancelled) 정책은 제외. 최상위 paymentId/price는 기본 정책의 값이라 미선택 시 폴백과 일치한다.
  // admin(상담실)은 heavy 결제 조회를 하지 않아 방식 목록을 수업 상세로 보충 조회한다 —
  // 이게 없으면 상담실 결제가 항상 기본(첫 번째) 정책 paymentId로 잡히는 버그가 된다.
  const kioskPricePolicies: LessonPricePolicyResponse[] = selectedLesson
    ? (paymentInfo?.lesson?.pricePolicies ?? paymentInfo?.pricePolicies ?? (variant === 'admin' ? adminPolicies : []) ?? []).filter((p) => p.status !== 'Cancelled')
    : [];
  const selectedKioskPolicy: LessonPricePolicyResponse | undefined =
    kioskPricePolicies.find((p) => p.id === selectedKioskPolicyId)
    ?? (kioskPricePolicies.length > 0 ? (kioskPricePolicies.find((p) => p.isRecommended) ?? kioskPricePolicies[0]) : undefined);
  // 실제 결제에 쓰는 id/금액 — 정책 수업이면 선택한 정책의 것, 아니면 기존 응답 그대로.
  const effectivePaymentId = selectedKioskPolicy?.paymentId ?? paymentInfo?.paymentId;
  const effectivePrice = selectedKioskPolicy?.price ?? paymentInfo?.price ?? paymentItem?.price ?? 0;
  // admin(상담실) 결제 화면 진입 시 — 가격 정책 수업이면 방식 목록 보충 조회
  useEffect(() => {
    if (variant !== 'admin' || currentScreen !== 'admin-payment') return;
    if (!selectedLesson || selectedLesson.price != null) { setAdminPolicies([]); return; }
    setSelectedKioskPolicyId(null);
    getKioskLessonPoliciesAction(selectedLesson.id).then(setAdminPolicies);
  }, [variant, currentScreen, selectedLesson]);

  // 결제수단 활성화 여부 — paymentInfo.methods의 isEnabled를 type별로 추출.
  // 키오스크 응답은 paymentMethod로 wrap되어 옴, 일반 결제 응답은 root에 type. 둘 다 지원.
  const isMethodEnabled = (type: 'credit' | 'cash' | 'pass'): boolean => {
    const methods = paymentInfo?.methods;
    if (!methods) return false; // paymentInfo 미수신 단계엔 비활성 (응답 오기 전까지 잔상 방지)
    const m = methods.find((x) => (x.paymentMethod?.type ?? x.type) === type);
    if (!m) return false;
    return m.isEnabled ?? true;
  };
  const cardEnabled = isMethodEnabled('credit');
  const cashEnabled = isMethodEnabled('cash');
  const passEnabled = isMethodEnabled('pass');

  // 영수증 인쇄 — 결제 컨텍스트만 buildKioskReceipt에 넘기면 수단별 dispatch + KIS 응답 파싱은 receipt 모듈이 처리.
  // qrText는 백엔드 POST /kiosks/payments 응답의 qrCodeUrl을 그대로 받아 푸터 QR로 인쇄.
  const handlePrintReceipt = useCallback((qrText?: string, rankText?: string, ticketStatus?: KioskTicketSummary['status'] | null) => {
    if (!paymentItem || !paymentMethod) return;
    // /me의 studio는 필드 누락 케이스가 있어 /kiosks/payment 응답의 lesson|passPlan.studio가 있으면 우선 사용
    const itemStudio = paymentInfo?.lesson?.studio ?? paymentInfo?.passPlan?.studio;
    // 수업일시 — 서버가 미리 포맷한 lesson.date 우선, 없으면 raw startDate
    const lessonForReceipt = paymentInfo?.lesson ?? selectedLesson;
    const lessonDateTime = lessonForReceipt
      ? ((lessonForReceipt as { date?: string }).date ?? lessonForReceipt.startDate)
      : undefined;
    const lines = buildKioskReceipt({
      // onsite(현장결제)는 영수증 인쇄 경로를 타지 않음 — 타입 충족용으로 cash에 매핑
      paymentMethod: paymentMethod === 'onsite' ? 'cash' : paymentMethod,
      studio: {
        name: itemStudio?.name ?? studioName,
        address: itemStudio?.address ?? studioAddress,
        businessNumber: itemStudio?.businessRegistrationNumber ?? studioBusinessNumber,
        representative: itemStudio?.representative ?? studioRepresentative,
        phone: itemStudio?.phone ?? studioPhone,
        // kiosk별 footer가 있으면 우선, 없으면 studio 기본값
        receiptFooter: kioskReceiptFooter ?? studioReceiptFooter,
      },
      transaction: { kioskName, paymentId: receiptPaymentIdOverride ?? paymentInfo?.paymentId },
      user: selectedUser ? {
        name: selectedUser.name,
        nickName: selectedUser.nickName,
        phone: phone || selectedUser.phone,
      } : undefined,
      itemType: selectedLesson ? 'lesson' : selectedPassPlan ? 'pass-plan' : roomBooking ? 'practice-room' : selectedBundle ? 'bundle' : undefined,
      // 수업 결제 시 강사 노출 — 닉네임 우선, 없으면 본명
      artists: selectedLesson
        ? (paymentInfo?.lesson?.artists ?? selectedLesson.artists ?? [])
            .map((a) => a.nickName || a.name)
            .filter((n): n is string => Boolean(n))
        : undefined,
      lessonDateTime: selectedLesson ? lessonDateTime : undefined,
      // rankText(인자) 우선 — 카드 결제 complete 직후엔 paymentRank 상태가 아직 미반영이라 인자로 받은 값을 사용
      rank: selectedLesson ? (rankText ?? paymentRank ?? undefined) : undefined,
      // 자동 사용처리된 건은 QR이 없으므로 그 자리에 '출석 완료' 안내를 인쇄. rank와 같은 이유로 인자 우선.
      attended: (ticketStatus ?? paymentTicketStatus) === 'Used',
      // 가격 정책 결제면 상품명을 '제목 · N회'로 (BE의 정기결제 상품명 규칙과 동일), 금액은 정책가.
      items: [{
        // BE 상품명 규칙(B-2)과 맞춤: '{수업 제목} · {방식 이름}' — 이름 없는 옛 정책은 회차 수 폴백
        name: selectedKioskPolicy ? `${paymentItem.title} · ${selectedKioskPolicy.name || `${selectedKioskPolicy.lessonCount}회`}` : paymentItem.title,
        price: selectedKioskPolicy ? selectedKioskPolicy.price : paymentItem.price,
      }],
      discount: selectedDiscount ? {
        amount: selectedDiscount.amount,
        // description/targetLabel이 둘 다 비어 있는 케이스(예: 1천원할인권 — key만 있음)에서 key를 폴백으로 사용
        description: selectedDiscount.description ?? selectedDiscount.key,
        targetLabel: selectedDiscount.passRule?.targetLabel ?? undefined,
      } : undefined,
      cardData: paymentResult?.data,
      qrText,
    });
    sendReceiptToPrinter(lines);
  }, [paymentItem, paymentResult, paymentMethod, selectedDiscount, studioName, studioReceiptFooter, kioskReceiptFooter, studioAddress, studioBusinessNumber, studioRepresentative, studioPhone, kioskName, selectedUser, phone, selectedLesson, selectedPassPlan, roomBooking, paymentInfo, receiptPaymentIdOverride, paymentRank, paymentTicketStatus, selectedKioskPolicy]);

  // 공통: 선택된 할인을 PaymentDiscount[] 형태로 직렬화.
  // 서버가 passRule 풀 객체를 함께 요구해서 그대로 전달.
  const buildDiscounts = useCallback((): PaymentDiscount[] | undefined => {
    if (!selectedDiscount) return undefined;
    return [{
      key: selectedDiscount.key,
      amount: selectedDiscount.amount,
      type: selectedDiscount.type as PaymentDiscount['type'],
      itemId: selectedDiscount.itemId,
      passRuleId: selectedDiscount.passRule?.id,
      passRule: selectedDiscount.passRule,
    }];
  }, [selectedDiscount]);

  // 공통 결제 시작 — POST /kiosks/payments(Pending/즉시완료) 호출 + 응답 표준화 + 실패 처리(토스트).
  // card/qr/cash가 공유. 성공 시 ParsedPaymentResult 반환, 실패/에러 시 상태 정리 후 null.
  const runStartPayment = useCallback(async (
    type: 'card' | 'cash',
    ctx: { targetUserId: number; kioskId: number; paymentId: string; amount?: number; startDate?: string; endDate?: string },
  ): Promise<ParsedPaymentResult | null> => {
    const res = await startKioskPaymentAction({
      targetUserId: ctx.targetUserId,
      kioskId: ctx.kioskId,
      paymentId: ctx.paymentId,
      type,
      amount: ctx.amount,
      discounts: buildDiscounts(),
      // 연습실 예약이면 선택 시간대(KST) 전달 — 서버가 예약 생성.
      ...(ctx.startDate && ctx.endDate ? { startDate: ctx.startDate, endDate: ctx.endDate } : {}),
    });
    const parsed = parsePaymentResult(res);
    if (!parsed.ok) {
      setIsPaying(false);
      setPaymentMethod(null);
      setToastMessage(parsed.message ?? '결제를 시작하지 못했어요');
      // 가격 정책 에러(판매 중단·겹침·회차 부족)면 결제 상세를 재조회해 방식 목록을 갱신 —
      // 조회 시점과 판정이 달라진 것이므로 화면의 usable/reason도 새로 받아야 한다.
      if (parsed.code?.startsWith('LESSON_GROUP')) {
        lastFetchedKeyRef.current = null;
        setPaymentInfoRefreshKey((n) => n + 1);
      }
      return null;
    }
    return parsed;
  }, [buildDiscounts]);

  // 결제/패스 성공 응답의 영수증용 필드(QR·입장번호·결제번호)를 상태에 반영. cash/pass/complete 공용.
  const applyReceiptFields = useCallback((parsed: ParsedPaymentResult, opts?: { receiptOverride?: boolean }) => {
    if (parsed.qrCodeUrl) setPaymentQrCodeUrl(parsed.qrCodeUrl);
    if (opts?.receiptOverride && parsed.paymentId) setReceiptPaymentIdOverride(parsed.paymentId);
    if (parsed.rank) setPaymentRank(parsed.rank);
    // 자동 사용처리 여부는 발급된 수강권 상태로만 판별 (qrCodeUrl은 발급 실패 때도 비어 있어 구분 불가).
    // 이번 결제 응답이 항상 권위값이라 없으면 명시적으로 비운다 — 직전 결제의 'Used'가 남지 않도록.
    setPaymentTicketStatus(parsed.ticket?.status ?? null);
  }, []);

  // 카드 결제 (Apple Pay 포함):
  //  ⓪ requestKisPayment 인터페이스 존재 확인 (네이티브 미설치 환경에선 진행 자체 차단 — Pending도 안 만듦)
  //  ① POST /kiosks/payments — Pending 생성 → 응답의 amount를 단말 매입 금액으로 사용
  //  ② requestKisPayment 호출 (D1) — 응답은 onKisPaymentResult가 처리
  //  결제 성공/실패 판정 후 ③ POST /kiosks/payments/:id/complete 또는 DELETE /kiosks/payments/:id 는 paymentResult useEffect에서 진행
  const handleCardPayment = useCallback(async (variant: 'card' | 'applepay' = 'card') => {
    // 가격 정책 수업이면 선택한 정책의 paymentId('LGT…')로 결제 — 서버가 그 id로 금액 계산·수강권 발급.
    if (!paymentItem || isPaying || !selectedUser || !effectivePaymentId || !kioskId) return;
    // 선택한 방식이 결제 불가(usable=false)면 진입 차단 — 버튼도 비활성이지만 이중 방어
    if (selectedKioskPolicy?.usable === false) return;

    // Fix A — 이미 complete로 확정된 paymentId면 재결제/단말 호출 차단.
    // (결제 성공 직후 홈 전환 전 버튼 재탭으로 같은 paymentId로 2차 create가 나가는 사고 방지)
    if (completedPaymentIdsRef.current.has(effectivePaymentId)) return;

    // KIS 단말 호출 인터페이스가 없으면 Pending 생성/단말 호출 모두 진행 X (orphan Pending 방지)
    if (typeof window.KloudEvent?.requestKisPayment !== 'function') {
      setToastMessage('카드결제를 진행할 수 없습니다');
      return;
    }

    setCardPayingVariant(variant);
    setIsPaying(true);
    setPaymentResult(null);
    setPaymentMethod('card');

    const parsed = await runStartPayment('card', {
      targetUserId: selectedUser.id,
      kioskId,
      paymentId: effectivePaymentId,
      // 연습실 예약이면 선택 시간대(KST) 전달 — 서버가 예약 생성. amount는 서버 계산.
      ...(roomBooking ? { startDate: roomBooking.startDate, endDate: roomBooking.endDate } : {}),
    });
    if (!parsed) return; // 실패 처리(토스트/상태정리)는 runStartPayment가 완료

    // Fix B — 단말 호출 직전 활성 시도 + 폐기 컨텍스트 등록. 이 이후 도착하는 D1 결과만 유효 처리되고,
    //         완료/폐기 뒤 유령 응답은 discardContext로 폐기 DELETE만 쏘고 UI는 유지된다.
    activePaymentIdRef.current = parsed.paymentId!;
    discardContextRef.current = { paymentId: parsed.paymentId!, kioskId };

    // KIS 단말 호출 — 1초 대기 제거. Pending 응답 직후 곧장 송출.
    // inCustomerUuid에 우리 paymentId를 박아두면 KIS 단말에 조회 키로 저장돼서 추후 ST(상태 조회)를 같은 paymentId로 할 수 있음.
    window.KloudEvent?.requestKisPayment?.(JSON.stringify({
      inTranCode: 'D1',
      inTotAmt: `${parsed.amount}`,
      inInstallment: '00',
      inCustomerUuid: parsed.paymentId,
    }));
  }, [paymentItem, isPaying, selectedUser, effectivePaymentId, kioskId, runStartPayment, roomBooking, selectedKioskPolicy]);

  // admin(상담실) 카드결제 — 직원이 편집한 금액(customAmount)을 단말 매입 금액으로 사용.
  //  ① POST /kiosks/payments — Pending 생성(paymentId 확보)  ② requestKisPayment(D1)에 편집 금액 송출
  //  KIS가 그 금액으로 매입 → outTotAmt → complete.totalAmount 까지 편집 금액이 그대로 반영됨.
  // admin 카드결제 — GET /kiosks/admin/payment로 paymentId 발급받아 requestKisPayment(편집금액) 송출.
  const handleAdminCardPayment = useCallback(async (customAmount: number) => {
    // 인터페이스 존재 확인을 맨 앞에서 — 없으면 어떤 상태든 누르는 즉시 토스트 (샤라락)
    if (typeof window.KloudEvent?.requestKisPayment !== 'function') {
      setToastMessage('카드결제를 진행할 수 없습니다');
      return;
    }
    if (!Number.isFinite(customAmount) || customAmount <= 0) { setToastMessage('금액을 확인해주세요'); return; }
    if (!paymentItem || isPaying || !selectedUser || !kioskId) return;
    const item = selectedLesson ? 'lesson' : selectedPassPlan ? 'pass-plan' : 'bundle';
    const itemId = selectedLesson?.id ?? selectedPassPlan?.id ?? selectedBundle?.id;
    if (!itemId) return;

    setCardPayingVariant('card');
    setIsPaying(true);
    setPaymentResult(null);
    setPaymentMethod('card');
    setAdminPaidAmount(Math.round(customAmount));

    // 가격 정책 수업이면 고른 방식의 paymentId(LGT…)로 결제 — 경량 조회는 기본(첫 번째) 정책
    // paymentId를 돌려주므로 그대로 쓰면 선택과 무관하게 맨 위 방식이 결제되는 버그가 된다.
    let paymentId = selectedKioskPolicy?.paymentId;
    if (!paymentId) {
      // 결제하기 시점에 서버에서 paymentId 발급
      const res = await getKioskAdminPaymentAction(item, itemId);
      paymentId = (res as { paymentId?: string })?.paymentId;
      if (!paymentId) {
        setIsPaying(false);
        setPaymentMethod(null);
        setToastMessage((res as { message?: string })?.message ?? '결제를 시작하지 못했어요');
        return;
      }
    }

    // 발급받은 paymentId로 Pending 생성 — 편집금액(customAmount)을 함께 전송.
    // complete(POST /kiosks/payments/:id/complete)가 Pending을 전제로 함.
    const parsed = await runStartPayment('card', { targetUserId: selectedUser.id, kioskId, paymentId, amount: Math.round(customAmount) });
    if (!parsed) return; // 실패 처리(isPaying/토스트)는 runStartPayment가 완료

    activePaymentIdRef.current = parsed.paymentId!;
    discardContextRef.current = { paymentId: parsed.paymentId!, kioskId };

    window.KloudEvent?.requestKisPayment?.(JSON.stringify({
      inTranCode: 'D1',
      inTotAmt: `${Math.round(customAmount)}`,
      inInstallment: '00',
      inCustomerUuid: parsed.paymentId,
    }));
  }, [paymentItem, isPaying, selectedUser, selectedLesson, selectedPassPlan, kioskId, runStartPayment, selectedKioskPolicy]);

  // admin 현장결제 — 카드단말 흐름 아님. 확인 다이얼로그(폼)에서 확인 시 호출되어
  // POST /paymentRecords/manual (methodType='admin', 편집 amount)로 즉시 기록 → '결제 완료' 성공 화면.
  const handleAdminOnsitePayment = useCallback(async (customAmount: number) => {
    if (adminOnsiteBusyRef.current) return;
    if (!paymentItem || !selectedUser) return;
    if (!Number.isFinite(customAmount) || customAmount <= 0) { setToastMessage('금액을 확인해주세요'); return; }
    const item = selectedLesson ? 'lesson' : selectedPassPlan ? 'pass-plan' : 'bundle';
    const itemId = selectedLesson?.id ?? selectedPassPlan?.id ?? selectedBundle?.id;
    if (!itemId) return;

    adminOnsiteBusyRef.current = true;
    setAdminPaidAmount(Math.round(customAmount));
    setPaymentMethod('onsite'); // 'cash' 아님 — 성공 화면에서 '결제 완료' 멘트로 분기
    try {
      // 가격 정책 수업이면 계약 단위로 결제 — item을 'lesson-group', itemId를 고른 정책 id로 보낸다.
      // (수업 id 그대로 보내면 회차 1장 결제가 되어 방식 선택이 무시된다)
      const effItem = selectedKioskPolicy ? 'lesson-group' : item;
      const effItemId = selectedKioskPolicy ? selectedKioskPolicy.id : itemId;
      const res = await createAdminManualPaymentAction({ item: effItem, itemId: effItemId, targetUserId: selectedUser.id, amount: Math.round(customAmount) });
      const parsed = parsePaymentResult(res);
      if (!parsed.ok) {
        setPaymentMethod(null);
        setToastMessage(parsed.message ?? '결제에 실패했어요');
        return;
      }
      applyReceiptFields(parsed);
      setPaymentResult({ status: 'success', data: {} });
    } catch {
      setPaymentMethod(null);
      setToastMessage('요청에 실패했습니다');
    } finally {
      adminOnsiteBusyRef.current = false;
    }
  }, [paymentItem, selectedUser, selectedLesson, selectedPassPlan, applyReceiptFields, selectedKioskPolicy]);

  // QR 간편결제 (카카오페이/제로페이) — KIS 간편결제 흐름:
  //  ⓪ requestKisEasyPay 네이티브 인터페이스 존재 확인
  //  ① POST /kiosks/payments — Pending 생성 (카드와 동일, 할인 반영된 amount)
  //  ② requestKisEasyPay 호출 — 웹은 금액만 넘기고, 스캔(1회)+KIS(D1) 전송은 네이티브가 처리
  //  결과는 카드와 동일하게 window.onKisPaymentResult로 옴 → paymentResult → complete/영수증 재사용
  //  (provider는 대기 다이얼로그 라벨용. KIS 페이로드엔 미포함 — 스캐너가 카카오/제로 바코드를 모두 읽음)
  const handleQrPayment = useCallback(async (provider: 'kakaopay' | 'zeropay') => {
    if (!paymentItem || isPaying || !selectedUser || !effectivePaymentId || !kioskId) return;

    if (typeof window.KloudEvent?.requestKisEasyPay !== 'function') {
      setToastMessage('간편결제를 진행할 수 없습니다');
      return;
    }

    setCardPayingVariant(provider);
    setIsPaying(true);
    setPaymentResult(null);
    setPaymentMethod('card');

    const parsed = await runStartPayment('card', { targetUserId: selectedUser.id, kioskId, paymentId: effectivePaymentId });
    if (!parsed) return; // 실패 처리는 runStartPayment가 완료

    // Fix B — QR도 onKisPaymentResult(카드 D1과 동일 채널)로 결과가 오므로 활성 시도/폐기 컨텍스트 등록.
    activePaymentIdRef.current = parsed.paymentId!;
    discardContextRef.current = { paymentId: parsed.paymentId!, kioskId };

    // 네이티브 KIS 간편결제 — 웹은 금액/식별자만. 스캔·KIS 전송은 네이티브가 처리.
    // 결과는 onKisPaymentResult로 수신 (카드 D1과 동일 채널).
    // TODO: inTestMode는 규격 확정 후 실거래 시 false로 전환.
    window.KloudEvent?.requestKisEasyPay?.(JSON.stringify({
      inTotAmt: `${parsed.amount}`,
      inCustomerUuid: parsed.paymentId,
      inTestMode: true,
    }));
  }, [paymentItem, isPaying, selectedUser, effectivePaymentId, kioskId, runStartPayment]);

  // 현금 결제: POST /kiosks/payments(type='cash') 한 방에 즉시 Completed + qrCodeUrl 수령
  const handleCashPayment = useCallback(async () => {
    if (!paymentItem || !selectedUser || !effectivePaymentId || !kioskId || isPaying) return;
    // 선택한 방식이 결제 불가(usable=false)면 진입 차단 — 버튼도 비활성이지만 이중 방어
    if (selectedKioskPolicy?.usable === false) return;
    setPaymentMethod('cash');
    setIsPaying(true);

    const parsed = await runStartPayment('cash', {
      targetUserId: selectedUser.id,
      kioskId,
      paymentId: effectivePaymentId,
      // 연습실 예약이면 선택 시간대(KST) 전달 — 서버가 예약 생성. amount는 서버 계산.
      ...(roomBooking ? { startDate: roomBooking.startDate, endDate: roomBooking.endDate } : {}),
    });
    if (!parsed) return; // 실패 처리는 runStartPayment가 완료
    setIsPaying(false);

    applyReceiptFields(parsed); // cash 즉시 발급 — QR/입장번호 라벨 반영
    setPaymentResult({ status: 'success', data: {} });
  }, [paymentItem, selectedUser, effectivePaymentId, kioskId, isPaying, runStartPayment, applyReceiptFields, roomBooking, selectedKioskPolicy]);

  // 결제수단 화면 하단 '신청하기'(최종금액 0원) 핸들러.
  //  - 차감할 패스권(FreeCount/Unlimited)이 선택돼 있으면 패스 사용 (B 흐름) — POST /kiosks/passes/:passId/use
  //  - 패스권 없이 0원인 경우(무료 수업·무료 대관, 또는 할인권으로 전액 커버)는 0원 결제로 즉시 완료.
  //    (예전엔 여기서 '패스권 정보를 찾을 수 없습니다' 토스트만 뜨고 신청이 막혔다)
  const handlePayWithPass = useCallback(async () => {
    if (!paymentItem || !selectedUser) return;
    const passId = selectedPass?.pass.id;
    if (!passId) {
      // 실가격은 서버 응답(paymentInfo.price) 기준 — 폼/할인과 동일 소스로 통일.
      const finalPrice = Math.max(0, (paymentInfo?.price ?? paymentItem.price ?? 0) - (selectedDiscount?.amount ?? 0));
      if (finalPrice === 0) {
        await handleCashPayment();   // 0원 → cash 흐름으로 즉시 Completed + QR 발급
        return;
      }
      setToastMessage('패스권 정보를 찾을 수 없습니다');
      return;
    }
    // 패스권 차감은 수업/연습실만 대상
    if (!selectedLesson && !roomBooking) {
      setToastMessage('패스권으로 결제할 수 없는 상품입니다');
      return;
    }
    try {
      // 연습실 예약이면 룸/시간 정보를, 수업이면 lessonId를 전달
      const res = await useKioskPassAction({
        passId,
        targetUserId: selectedUser.id,
        kioskId,
        ...(roomBooking
          ? { studioRoomId: roomBooking.studioRoomId, startDate: roomBooking.startDate, endDate: roomBooking.endDate }
          : { lessonId: selectedLesson!.id }),
      });
      // paymentId 없거나 도메인 에러면 실패 — 영수증 인쇄 차단 (SAME_TIME_LESSON_ALREADY_EXISTS 등 미등록 코드 포함).
      const parsed = parsePaymentResult(res);
      if (!parsed.ok) {
        setToastMessage(parsed.message ?? '패스권 사용에 실패했습니다');
        return;
      }
      // 응답의 qrCodeUrl/paymentId/입장번호를 영수증에 사용
      applyReceiptFields(parsed, { receiptOverride: true });
      setPaymentMethod('pass');
      setPaymentResult({ status: 'success', data: {} });
    } catch {
      setToastMessage('요청에 실패했습니다');
    }
  }, [paymentItem, selectedPass, selectedUser, selectedLesson, roomBooking, kioskId, applyReceiptFields, paymentInfo, selectedDiscount, handleCashPayment]);

  // 패스권 자동 사용 — "수업 신청하러 가기" 직후 lesson 선택해서 payment-method 진입했을 때 자동 트리거.
  // paymentInfo가 도착하고, autoUsePassPlanId와 매칭되는 usable한 pass가 있으면 즉시 useKioskPassAction 호출.
  // 매칭 패스 없거나 isPaying 진입 후엔 effect 재실행되지 않도록 autoUsePassPlanId를 호출 직전에 비움.
  useEffect(() => {
    if (!autoUsePassPlanId) return;
    if (currentScreen !== 'payment-method') return;
    if (!paymentInfo || !selectedLesson || !selectedUser || !kioskId) return;
    if (isPaying || paymentResult) return;

    // 응답 형상: 최신은 paymentInfo.passes, 과거에는 paymentInfo.user.passes — legacy 폴백 유지
    const passes = paymentInfo.passes ?? paymentInfo.user?.passes ?? [];
    // usable은 선택한 레슨 기준으로 BE가 내려주는 권위 있는 판정이라 명시적 값(true/false)이면 그대로 신뢰한다.
    // (false를 무시하고 룰 단위 플래그로 폴백하면, 이 레슨에 못 쓰는 패스를 auto-use해 PASS_NOT_FOR_LESSON 발생)
    // 신규 응답에서 usable이 누락(undefined)된 경우에만 passRule.usable / passRules[].usable로 폴백.
    const isPassUsable = (p: GetPassResponse): boolean => {
      if (typeof p.usable === 'boolean') return p.usable;
      if (p.passRule?.usable === true) return true;
      return (p.passRules ?? []).some((r) => r.usable === true);
    };
    const matchingPass = passes.find((p) => p.passPlan?.id === autoUsePassPlanId && isPassUsable(p));
    if (!matchingPass) {
      // BE에서 갓 만든 pass가 아직 안 보이거나 unusable — 폴백: 사용자가 수동 선택하도록 일반 결제 흐름 유지
      setAutoUsePassPlanId(null);
      return;
    }

    const passId = matchingPass.id;
    setAutoUsePassPlanId(null);
    setIsPaying(true);
    useKioskPassAction({
      passId,
      targetUserId: selectedUser.id,
      kioskId,
      lessonId: selectedLesson.id,
    })
      .then((res) => {
        const parsed = parsePaymentResult(res);
        if (!parsed.ok) {
          setToastMessage(parsed.message ?? '패스권 사용에 실패했습니다');
          setIsPaying(false);
          return;
        }
        applyReceiptFields(parsed, { receiptOverride: true });
        setPaymentMethod('pass');
        setPaymentResult({ status: 'success', data: {} });
        setIsPaying(false);
      })
      .catch(() => {
        setToastMessage('요청에 실패했습니다');
        setIsPaying(false);
      });
  }, [autoUsePassPlanId, currentScreen, paymentInfo, selectedLesson, selectedUser, kioskId, isPaying, paymentResult, applyReceiptFields]);


  // 화면 전환 fade — 하위 화면끼리 폼 인스턴스를 공유(재fetch 방지)하는 묶음은 한 그룹으로 취급해
  // 그룹이 바뀔 때만 루트를 remount(key)해서 fade-in. 그룹 내 이동(리스트↔상세 등)은 유지.
  const screenGroup =
    currentScreen === 'lesson-list' || currentScreen === 'lesson-detail' ? 'lessons'
      : currentScreen === 'phone' || currentScreen === 'searching' || currentScreen === 'member-confirm' ? 'member'
        : currentScreen === 'payment-method' || currentScreen === 'pass-select' ? 'payment'
          : currentScreen;

  // 키오스크 수업 화면 진입 — 리스트↔상세 왕복(같은 'lessons' 그룹)은 재진입으로 세지 않고,
  // 다른 그룹에서 lessons 그룹으로 넘어올 때만 1회 전송한다.
  const prevScreenGroupRef = useRef<string | null>(null);
  useEffect(() => {
    if (screenGroup === 'lessons' && prevScreenGroupRef.current !== 'lessons') {
      trackEvent('enter_kiosk_lesson', { kioskId, studioId, variant });
    }
    prevScreenGroupRef.current = screenGroup;
  }, [screenGroup, kioskId, studioId, variant]);

  // 학원의 자동 사용처리(studio.ticketAutoUse) 설정으로 결제 즉시 출석까지 끝난 건.
  // 현금 결제는 BE 생성 응답에 ticket이 없어 아직 판별 불가 — 기존 안내로 폴백된다.
  const isAutoAttended = paymentTicketStatus === 'Used';

  return (
    <div key={screenGroup} className="w-full h-screen overflow-hidden animate-[fadeIn_260ms_ease-out]">
      {currentScreen === 'home' && (
        variant === 'admin' ? (
          <AdminKioskHomeForm
            studioName={studioName}
            studioImageUrl={studioProfileImageUrl}
            locale={locale}
            canCheckIn={canCheckIn}
            canPurchase={canPurchase}
            canBookRoom={canBookRoom}
            canLessonAttendance={canLessonAttendance}
            onSelectPayment={() => setCurrentScreen('lesson-list')}
            onSelectAttendance={enterAttendance}
            onSelectBookRoom={() => { setSelectedLesson(null); setSelectedPassPlan(null); setRoomBooking(null); setCurrentScreen('room-reservation'); }}
            onAdminMode={() => setAdminOpen(true)}
          />
        ) : (
          <KioskHomeForm
            studioName={studioName}
            kioskImageUrl={kioskImageUrl}
            locale={locale}
            canCheckIn={canCheckIn}
            canPurchase={canPurchase}
            canBookRoom={canBookRoom}
            canLessonAttendance={canLessonAttendance}
            onSelectPayment={() => setCurrentScreen('lesson-list')}
            onSelectAttendance={enterAttendance}
            onReserveRoom={() => { setSelectedLesson(null); setSelectedPassPlan(null); setRoomBooking(null); setCurrentScreen('room-reservation'); }}
            onChangeLocale={setLocale}
            onAdminMode={() => setAdminOpen(true)}
          />
        )
      )}

      {currentScreen === 'room-reservation' && (
        <KioskRoomReservationForm
          studioId={studioId}
          locale={locale}
          onBack={goHome}
          onConfirm={(booking) => {
            setRoomBooking(booking);
            setSelectedLesson(null);
            setSelectedPassPlan(null);
            setCurrentScreen('phone');
          }}
        />
      )}

      {/* lesson-list / lesson-detail에서 list form은 같은 인스턴스로 유지 — 모달이 떠도 뒤에서 재마운트/재fetch 안 일어나게 */}
      {(currentScreen === 'lesson-list' || currentScreen === 'lesson-detail') && (
        <KioskLessonListForm
          studioId={studioId}
          passPlans={passPlans}
          locale={locale}
          variant={variant}
          onSelectLesson={(lesson) => { setSelectedLesson(lesson); setSelectedPassPlan(null); setSelectedBundle(null); setCurrentScreen('lesson-detail'); }}
          onSelectPassPlan={(plan) => { setSelectedPassPlan(plan); setSelectedLesson(null); setSelectedBundle(null); setCurrentScreen('phone'); }}
          onSelectBundle={(bundle) => { setSelectedBundle(bundle); setSelectedLesson(null); setSelectedPassPlan(null); setCurrentScreen('phone'); }}
          onBack={goHome}
        />
      )}

      {currentScreen === 'lesson-detail' && selectedLesson && (
        <KioskLessonDetailModal
          lesson={selectedLesson}
          locale={locale}
          variant={variant}
          onClose={() => setCurrentScreen('lesson-list')}
          // 패스권 자동 사용 모드 + selectedUser 이미 있음 → phone 스킵하고 payment-method로 직행 (auto-use effect가 처리)
          onPayment={() => setCurrentScreen(autoUsePassPlanId && selectedUser ? 'payment-method' : 'phone')}
        />
      )}

      {/* phone / searching / member-confirm 공유 — modal 떠도 폼 인스턴스 유지 */}
      {(currentScreen === 'phone' || currentScreen === 'searching' || currentScreen === 'member-confirm') && (
        <KioskPhoneInputForm
          locale={locale}
          variant={variant}
          mode={phoneInputMode}
          onBack={() => setCurrentScreen(roomBooking ? 'room-reservation' : 'lesson-list')}
          onNext={handlePhoneNext}
          onSearchByEmail={handleEmailSearch}
          onHome={goHome}
          loading={currentScreen === 'searching'}
          errorMessage={errorMessage}
          onDismissError={() => setErrorMessage(null)}
        />
      )}

      {currentScreen === 'member-confirm' && selectedUser && (
        <KioskMemberConfirmModal
          phone={phone}
          name={selectedUser.name}
          nickName={selectedUser.nickName}
          email={selectedUser.email}
          profileImageUrl={selectedUser.profileImageUrl}
          locale={locale}
          onBack={() => setCurrentScreen('phone')}
          onConfirm={handleConfirmUser}
        />
      )}

      {/* admin(상담실) 결제 폼 — 상품 + 편집 가능한 금액 → requestKisPayment */}
      {currentScreen === 'admin-payment' && paymentItem && selectedUser && (
        <AdminKioskPaymentForm
          item={{
            title: paymentItem.title,
            subtitle: paymentItem.subtitle,
            thumbnailUrl: paymentItem.thumbnailUrl,
            // 가격 정책 수업이면 고른 방식의 가격으로 금액 입력을 시드한다 (낱개 가격은 null → 0)
            price: effectivePrice,
          }}
          locale={locale}
          loading={isPaying}
          pricePolicies={kioskPricePolicies}
          selectedPolicyId={selectedKioskPolicy?.id}
          onSelectPolicy={(id) => setSelectedKioskPolicyId(id)}
          onBack={() => setCurrentScreen('member-confirm')}
          onHome={goHome}
          onPay={(amount, method) => { if (method === 'card') handleAdminCardPayment(amount); else handleAdminOnsitePayment(amount); }}
        />
      )}

      {/* payment-method 진입 시 GET /kiosks/payment 실패 (예: TICKET_ALREADY_EXISTS) → 에러 화면으로 대체 */}
      {currentScreen === 'payment-method' && paymentInfoError && (
        <div className="fixed inset-0 z-30 bg-white flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-[5%]">
            <div className="rounded-full bg-[#FFE9E9] flex items-center justify-center" style={{ width: 'min(8vw,84px)', height: 'min(8vw,84px)' }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                <path d="M12 3L22 21H2L12 3Z" stroke="#E55B5B" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 10V14M12 17V18" stroke="#E55B5B" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-black font-bold text-center mt-[min(2.6vw,28px)] whitespace-pre-line" style={{ fontSize: 'min(3vw,32px)' }}>
              {paymentInfoError}
            </p>
          </div>
          <div className="shrink-0 px-[5.6%] pb-[min(4vw,44px)]">
            <button
              onClick={() => { setPaymentInfoError(null); setCurrentScreen('phone'); }}
              className="w-full h-[min(7vh,72px)] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(2.4vw,26px)' }}>{t('kiosk_back')}</span>
            </button>
          </div>
        </div>
      )}

      {/* payment-method / pass-select 공유 — modal 떠도 폼 인스턴스 유지 */}
      {(currentScreen === 'payment-method' || currentScreen === 'pass-select') && paymentItem && selectedUser && !paymentInfoError && (
        <KioskPaymentMethodForm
          itemType={selectedLesson ? 'lesson' : roomBooking ? 'practice-room' : selectedPassPlan ? 'pass-plan' : 'bundle'}
          lessonTitle={paymentItem.title}
          lessonSubtitle={paymentItem.subtitle}
          lessonThumbnailUrl={paymentItem.thumbnailUrl}
          price={effectivePrice}
          pricePolicies={kioskPricePolicies}
          selectedPolicyId={selectedKioskPolicy?.id}
          onSelectPolicy={(id) => setSelectedKioskPolicyId(id)}
          user={{
            name: selectedUser.name,
            nickName: selectedUser.nickName,
            phone: phone || selectedUser.phone,
            profileImageUrl: selectedUser.profileImageUrl,
          }}
          selectedDiscount={selectedDiscount ?? (selectedPass ? {
            // 패스 사용(B 흐름)은 UI상 풀 커버 할인으로 표시 — finalPrice = 0으로 떨어지면서 신청하기 버튼이 노출됨
            key: `pass-${selectedPass.pass.id}`,
            value: String(paymentInfo?.price ?? paymentItem.price),
            amount: paymentInfo?.price ?? paymentItem.price,
            type: 'passRule',
            itemId: selectedPass.pass.id,
            description: selectedPass.pass.passPlan?.name ?? '패스권',
          } as DiscountResponse : null)}
          locale={locale}
          onBack={() => setCurrentScreen('phone')}
          onSelectPass={() => {
            // 사용 가능한 패스권/할인이 둘 다 없으면 모달 진입 대신 안내 다이얼로그 노출
            const hasPasses = ((paymentInfo?.passes ?? paymentInfo?.user?.passes)?.length ?? 0) > 0;
            const hasDiscounts = (paymentInfo?.discounts?.length ?? 0) > 0;
            if (!hasPasses && !hasDiscounts) {
              setNoPassDialogOpen(true);
              return;
            }
            setCurrentScreen('pass-select');
          }}
          onClearDiscount={() => { setSelectedDiscount(null); setSelectedPass(null); }}
          onSelectCard={() => handleCardPayment('card')}
          onSelectApplePay={() => handleCardPayment('applepay')}
          onSelectKakaoPay={() => handleQrPayment('kakaopay')}
          onSelectZeroPay={() => handleQrPayment('zeropay')}
          onSelectCash={() => setCashConfirmOpen(true)}
          onPayWithPass={handlePayWithPass}
          onHome={goHome}
          // 결제수단은 서버 응답(paymentInfo.methods) 기준. 연습실도 카드/현금/패스권 모두 지원.
          cardEnabled={cardEnabled}
          cashEnabled={cashEnabled}
          passEnabled={passEnabled}
        />
      )}

      {isPaying && (
        <KioskCardPaymentDialog method={cardPayingVariant} locale={locale} variant={variant} onCancel={() => setIsPaying(false)} />
      )}

      {/* admin(상담실) 결제 완료 — 전용 화면 (무인 성공 오버레이와 별개) */}
      {paymentResult?.status === 'success' && variant === 'admin' && (
        <AdminKioskPaymentSuccess
          title={paymentItem?.title ?? ''}
          thumbnailUrl={paymentItem?.thumbnailUrl}
          amount={adminPaidAmount ?? 0}
          locale={locale}
          paymentId={receiptPaymentIdOverride ?? paymentInfo?.paymentId ?? null}
          defaultPhone={phone || selectedUser?.phone || ''}
          defaultCountryCode={phoneCountryCode}
          attendanceDone={isAutoAttended}
          onHome={() => { setPaymentResult(null); goHome(); }}
        />
      )}

      {paymentResult?.status === 'success' && variant !== 'admin' && (
        <div className="fixed inset-0 z-30 bg-white flex flex-col">
          {/* 상단 바 placeholder (back/lang/home은 굳이 X) */}
          <div className="flex-1 flex flex-col items-center justify-start px-[5.6%] pt-[min(20vw,200px)]">
            {/* 체크 원형 */}
            <div className="rounded-full bg-[#3CC0AF] flex items-center justify-center" style={{ width: 'min(8vw,84px)', height: 'min(8vw,84px)' }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* 결제 완료 + 안내 — 현금 결제 신청은 결제 미완료 상태이므로 멘트 분기 */}
            <p className="text-black font-bold text-center mt-[min(2.6vw,28px)]" style={{ fontSize: 'min(3.7vw,40px)' }}>
              {paymentMethod === 'cash' ? t('kiosk_request_done') : t('kiosk_payment_done')}
            </p>
            <p className="text-[#6D7882] text-center mt-[min(0.8vw,8px)]" style={{ fontSize: 'min(2vw,22px)' }}>
              {paymentMethod === 'cash' ? t('kiosk_finish_at_info_desk') : t('kiosk_take_receipt')}
            </p>

            {/* 자동 사용처리(ticket.status='Used') — 결제와 동시에 출석까지 끝나 QR 체크인이 필요 없음을 명확히 안내.
                이 경우 서버가 qrCodeUrl·rank를 비워서 내려주므로 화면에 안내가 없으면 손님이 체크인 대기를 하게 된다. */}
            {isAutoAttended && (
              <div className="w-full max-w-[720px] mt-[min(2.6vw,28px)] rounded-[16px] bg-[#EAF7F4] border border-[#BFE7E0] px-[min(3vw,32px)] py-[min(2vw,22px)] flex items-center gap-[min(1.6vw,18px)]">
                <div className="rounded-full bg-[#1E9E8A] flex items-center justify-center shrink-0" style={{ width: 'min(3.6vw,40px)', height: 'min(3.6vw,40px)' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '54%', height: '54%' }}>
                    <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[#12796A] font-bold leading-snug" style={{ fontSize: 'min(2.2vw,24px)' }}>
                    {t('kiosk_attendance_auto_done')}
                  </span>
                  <span className="text-[#3D8C80] leading-snug mt-[min(0.4vw,4px)]" style={{ fontSize: 'min(1.7vw,19px)' }}>
                    {t('kiosk_attendance_auto_done_desc')}
                  </span>
                </div>
              </div>
            )}

            {/* 결제 항목 카드 — 결제수단 폼/영수증과 동일 패턴으로 할인 반영한 실결제액 노출.
                할인 라인이 있으면 원가는 취소선으로 부가 노출 (사용자가 차감 흐름을 한눈에 확인). */}
            {(() => {
              const originalPrice = effectivePrice;
              const discountAmount = selectedDiscount?.amount ?? 0;
              const finalPrice = Math.max(0, originalPrice - discountAmount);
              return (
                <div className="w-full max-w-[720px] mt-[min(3.7vw,40px)] bg-white border border-[#E6E8EA] rounded-[16px] px-[min(3vw,32px)] py-[min(2.4vw,26px)] flex items-center justify-between gap-[12px]">
                  <span className="text-black font-bold leading-snug line-clamp-2 flex-1" style={{ fontSize: 'min(2.4vw,26px)' }}>
                    {paymentItem?.title ?? ''}
                  </span>
                  <span className="flex items-baseline gap-[6px] shrink-0">
                    {discountAmount > 0 && (
                      <span className="text-[#86898C] line-through mr-[min(1vw,12px)]" style={{ fontSize: 'min(2vw,22px)' }}>
                        {new Intl.NumberFormat('ko-KR').format(originalPrice)}{t('won')}
                      </span>
                    )}
                    <span className="text-black font-bold" style={{ fontSize: 'min(2.8vw,30px)' }}>
                      {new Intl.NumberFormat('ko-KR').format(finalPrice)}
                    </span>
                    <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vw,20px)' }}>{t('won')}</span>
                  </span>
                </div>
              );
            })()}
          </div>

          {/* 하단 안내 + 버튼 */}
          <div className="shrink-0 px-[5.6%] pb-[min(4vw,44px)]">
            <p className="text-[#86898C] text-center mb-[min(1.4vw,16px)]" style={{ fontSize: 'min(1.6vw,18px)' }}>
              {t('kiosk_close_in_5s')}
            </p>
            <div className="flex gap-[min(1.4vw,16px)]">
              {selectedPassPlan && (
                <button
                  onClick={() => {
                    // 직전 구매한 패스권 ID 기억 → 다음 lesson 결제 시 자동 사용
                    setAutoUsePassPlanId(selectedPassPlan.id);
                    // 결제 잔여 상태 정리 (selectedUser/phone는 유지 — 방금 인증한 손님 그대로)
                    setPaymentResult(null);
                    setPaymentMethod(null);
                    setSelectedPassPlan(null);
                    setSelectedDiscount(null);
                    setSelectedPass(null);
                    setPaymentInfo(null);
                    setPaymentQrCodeUrl(null);
                    setPaymentRank(null);
                    setPaymentTicketStatus(null);
                    setSelectedKioskPolicyId(null);
                    setReceiptPaymentIdOverride(null);
                    setCurrentScreen('lesson-list');
                  }}
                  className="flex-1 h-[min(7vh,72px)] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
                >
                  <span className="text-white font-bold" style={{ fontSize: 'min(2.4vw,26px)' }}>{t('kiosk_go_apply_lesson')}</span>
                </button>
              )}
              <button
                onClick={() => { setPaymentResult(null); goHome(); }}
                className="flex-1 h-[min(7vh,72px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vw,26px)' }}>{t('kiosk_to_home')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentResult?.status === 'fail' && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%] animate-[fadeIn_180ms_ease-out]">
          <div className="bg-white rounded-[32px] w-full max-w-[640px] p-[min(3.7vw,40px)] flex flex-col items-center animate-[scaleIn_180ms_ease-out]">
            <div className="rounded-full bg-[#FFE9E9] flex items-center justify-center" style={{ width: 'min(8vw,84px)', height: 'min(8vw,84px)' }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                <path d="M12 3L22 21H2L12 3Z" stroke="#E55B5B" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 10V14M12 17V18" stroke="#E55B5B" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[#1E2124] font-bold text-center mt-[min(2.4vw,26px)]" style={{ fontSize: 'min(3.4vw, 36px)' }}>
              {t('kiosk_payment_failed')}
            </p>
            {(() => {
              const d = paymentResult.data;
              const msg = [d.outReplyMsg1, d.outReplyMsg2]
                .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
                .join(' ')
                .trim();
              return msg ? (
                <p className="text-[#1E2124] text-center mt-[min(1.6vw,18px)] whitespace-pre-line" style={{ fontSize: 'min(2.2vw, 24px)' }}>
                  {msg}
                </p>
              ) : null;
            })()}
            <p className="text-[#6D7882] text-center mt-[min(1vw,12px)]" style={{ fontSize: 'min(2vw, 22px)' }}>
              잠시 후 다시 시도해주세요
            </p>
            <button
              onClick={() => { setPaymentResult(null); setPaymentMethod(null); }}
              className="mt-[min(3vw,32px)] w-full h-[min(9vw,100px)] rounded-[20px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(3vw, 32px)' }}>{t('kiosk_confirm')}</span>
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          key={toastMessage}
          message={<span className="text-white font-medium" style={{ fontSize: 'min(2.6vw, 28px)' }}>{toastMessage}</span>}
          onDone={() => setToastMessage(null)}
          className="px-[min(3.7vw,40px)] py-[min(2.2vw,24px)] rounded-[16px] bg-black/85"
          wrapperClassName="fixed left-1/2 -translate-x-1/2 z-40"
          wrapperStyle={{ bottom: 'min(7.4vw, 80px)' }}
        />
      )}

      {/* 사용 가능한 패스권/할인이 없을 때 안내 다이얼로그 */}
      {noPassDialogOpen && (
        <div
          className={`fixed inset-0 z-40 bg-black/40 flex items-center justify-center px-[5%] ${noPassDialogClosing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_200ms_ease-out]'}`}
          onClick={closeNoPassDialog}
        >
          <div
            className={`bg-white rounded-[24px] w-full max-w-[640px] flex flex-col items-center px-[min(4vw,40px)] py-[min(4vw,40px)] ${noPassDialogClosing ? 'animate-[scaleOut_200ms_ease-in_forwards]' : 'animate-[scaleIn_200ms_ease-out]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-full bg-[#F2F4F6] flex items-center justify-center" style={{ width: 'min(7vw,72px)', height: 'min(7vw,72px)' }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
                <path d="M12 8V13" stroke="#6D7882" strokeWidth="2.4" strokeLinecap="round"/>
                <circle cx="12" cy="16.5" r="1.2" fill="#6D7882"/>
                <circle cx="12" cy="12" r="9" stroke="#6D7882" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-black font-bold text-center mt-[min(2vw,22px)]" style={{ fontSize: 'min(2.6vw,28px)' }}>
              {t('kiosk_no_pass')}
            </p>
            <button
              onClick={closeNoPassDialog}
              className="mt-[min(3vw,32px)] w-full h-[min(7vh,72px)] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(2.4vw,26px)' }}>{t('kiosk_confirm')}</span>
            </button>
          </div>
        </div>
      )}

      {adminOpen && (
        <KioskAdminModal
          kioskId={kioskId}
          kioskName={kioskName}
          password={kioskPassword}
          studio={{
            name: studioName,
            address: studioAddress,
            businessNumber: studioBusinessNumber,
            representative: studioRepresentative,
            phone: studioPhone,
            receiptFooter: kioskReceiptFooter ?? studioReceiptFooter,
          }}
          onClose={() => setAdminOpen(false)}
        />
      )}

      {cashConfirmOpen && paymentItem && (
        <KioskCashConfirmDialog
          // 가격 정책 수업은 낱개 가격(price)이 null — 고른 방식의 가격(effectivePrice) 기준으로 안내
          amount={Math.max(0, effectivePrice - (selectedDiscount?.amount ?? 0))}
          locale={locale}
          onCancel={() => setCashConfirmOpen(false)}
          onConfirm={() => { setCashConfirmOpen(false); handleCashPayment(); }}
        />
      )}

      {newUserDialog && variant === 'admin' && (
        <AdminKioskNewUserDialog
          phone={newUserDialog.phone}
          locale={locale}
          onConfirm={(name) => handleConfirmNewUser(name)}
          onCancel={() => setNewUserDialog(null)}
        />
      )}

      {newUserDialog && variant !== 'admin' && (
        <KioskNewUserDialog
          name={newUserDialog.suggestedName}
          phone={newUserDialog.phone}
          locale={locale}
          onConfirm={handleConfirmNewUser}
          onCancel={() => setNewUserDialog(null)}
        />
      )}

      {printerDebugOpen && (
        <KioskPrinterDebugOverlay onClose={() => setPrinterDebugOpen(false)} />
      )}

      {/* staging에서만 노출되는 KIS raw 응답 뷰어 (prod는 Discord로 전송되므로 렌더 X) */}
      <KisDebugOverlay />

      {printerDebugResult && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-[3%]">
          <div className="bg-white rounded-[16px] w-full max-w-[920px] max-h-[88vh] flex flex-col overflow-hidden">
            <div className="shrink-0 px-[20px] pt-[16px] pb-[10px] flex items-center justify-between">
              <p className="text-black font-bold text-[16px]">프린터 진단 결과 (queries)</p>
              <div className="flex gap-[8px]">
                <button
                  onClick={() => navigator.clipboard?.writeText(printerDebugResult)}
                  className="px-[12px] h-[32px] rounded-[8px] bg-[#1E2124] text-white text-[12px] font-bold active:scale-[0.97]"
                >
                  복사
                </button>
                <button
                  onClick={() => setPrinterDebugResult(null)}
                  className="px-[12px] h-[32px] rounded-[8px] bg-[#F2F4F6] text-[#1E2124] text-[12px] font-bold active:scale-[0.97]"
                >
                  닫기
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto px-[16px] pb-[16px]">
              <pre className="text-[#1E2124] text-[11px] font-mono whitespace-pre-wrap break-all bg-[#F9F9FB] p-[12px] rounded-[8px]">
                {printerDebugResult}
              </pre>
            </div>
          </div>
        </div>
      )}

      {currentScreen === 'pass-select' && (selectedLesson || roomBooking) && selectedUser && (
        <KioskPassSelectModal
          // passEnabled=false면 보유 패스권은 modal에 노출 X → discounts만 보이도록 빈 배열 전달.
          // discounts는 passEnabled와 무관하게 항상 노출.
          // 응답 형상: 최신은 paymentInfo.passes, 과거에는 paymentInfo.user.passes — legacy 폴백 유지
          passes={passEnabled ? (paymentInfo?.passes ?? paymentInfo?.user?.passes ?? []) : []}
          discounts={paymentInfo?.discounts ?? []}
          locale={locale}
          onBack={() => setCurrentScreen('payment-method')}
          onSelect={(selection) => {
            if (selection.kind === 'discount') {
              setSelectedDiscount(selection.discount);
              setSelectedPass(null);
              setCurrentScreen('payment-method');
              return;
            }
            // 보유 패스의 rule이 Discount benefitType이면 웹과 동일하게 일반 결제수단 + 할인 적용 흐름.
            // (use pass 사용은 FreeCount/Unlimited/UnlimitedDay 등 횟수·기간 차감 룰만 해당)
            const { pass, rule } = selection;
            if (rule.benefitType === 'Discount') {
              const amount = rule.benefitValue ?? 0;
              setSelectedDiscount({
                key: pass.passPlan?.name ?? `pass-${pass.id}`,
                value: String(amount),
                amount,
                type: 'passRule',
                itemId: pass.id,
                description: pass.passPlan?.name,
                passRule: {
                  id: rule.id,
                  status: rule.status ?? '',
                  startDate: rule.startDate ?? '',
                  endDate: rule.endDate ?? '',
                  remainingCount: rule.remainingCount,
                  usageCount: rule.usageCount ?? 0,
                  targetType: rule.targetType,
                  targetValue: rule.targetValue,
                  targetLabel: rule.targetLabel,
                  benefitType: rule.benefitType,
                  benefitValue: rule.benefitValue,
                  excludes: rule.excludes,
                  usable: rule.usable,
                },
              });
              setSelectedPass(null);
              setCurrentScreen('payment-method');
              return;
            }
            // FreeCount / Unlimited / UnlimitedDay → use pass(B 흐름)로 차감 사용
            setSelectedPass({ pass, rule });
            setSelectedDiscount(null);
            setCurrentScreen('payment-method');
          }}
        />
      )}

      {currentScreen === 'attendance-select' && (
        <KioskAttendanceSelectForm
          locale={locale}
          onSelectStudio={() => setCurrentScreen('attendance')}
          onSelectLesson={() => setCurrentScreen('lesson-attendance')}
          onBack={goHome}
          onHome={goHome}
        />
      )}

      {currentScreen === 'attendance' && (
        <KioskAttendanceForm
          studioName={studioName}
          studioImageUrl={studioProfileImageUrl}
          onBack={goHome}
          onHome={goHome}
          onComplete={goHome}
          locale={locale}
          variant={variant}
          phoneInputMode={phoneInputMode}
        />
      )}

      {currentScreen === 'lesson-attendance' && (
        <KioskLessonAttendanceForm
          studioId={studioId}
          onBack={goHome}
          onHome={goHome}
          locale={locale}
          variant={variant}
          phoneInputMode={phoneInputMode}
        />
      )}
    </div>
  );
}
