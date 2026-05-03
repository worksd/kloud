'use client'

import React, {useState, useEffect, useCallback} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {KioskCardPaymentDialog} from "@/app/kiosk/KioskCardPaymentDialog";
import {KioskHomeForm} from "@/app/kiosk/KioskHomeForm";
import {KioskPrinterDebugOverlay} from "@/app/kiosk/KioskPrinterDebugOverlay";
import {KioskLessonListForm} from "@/app/kiosk/KioskLessonListForm";
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";
import {formatLessonDate, formatLessonStart} from "@/app/kiosk/kiosk.lesson";
import {KioskLessonDetailModal} from "@/app/kiosk/KioskLessonDetailModal";
import {KioskPhoneInputForm} from "@/app/kiosk/KioskPhoneInputForm";
import {KioskMemberConfirmModal} from "@/app/kiosk/KioskMemberConfirmModal";
import {KioskPaymentMethodForm} from "@/app/kiosk/KioskPaymentMethodForm";
import {KioskPassSelectModal} from "@/app/kiosk/KioskPassSelectModal";
import {KioskAttendanceForm} from "@/app/kiosk/KioskAttendanceForm";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";
import {searchUserAction, registerKioskUserAction, getKioskPaymentAction, startKioskPaymentAction, completeKioskPaymentAction, discardKioskPaymentAction, useKioskPassAction, getKioskDetailAction} from "@/app/kiosk/kiosk.actions";
import {GetPaymentResponse, DiscountResponse, PaymentDiscount} from "@/app/endpoint/payment.endpoint";
import {GetPassResponse, PassRuleResponse} from "@/app/endpoint/pass.endpoint";
import {StartKioskPaymentResponse, CompleteKioskPaymentResponse} from "@/app/endpoint/kiosk.endpoint";
import {KioskNewUserDialog} from "@/app/kiosk/KioskNewUserDialog";
import {KioskAdminModal} from "@/app/kiosk/KioskAdminModal";
import {KioskCashConfirmDialog} from "@/app/kiosk/KioskCashConfirmDialog";
import {generateRandomNickname} from "@/app/kiosk/random.nickname";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {GetPassPlanResponse} from "@/app/endpoint/pass.endpoint";
import {formatFeatureDescription, formatRuleDescription} from "@/utils/pass.description";
import {buildKioskReceipt} from "@/app/kiosk/kiosk.receipt";
import {sendReceiptToPrinter} from "@/app/kiosk/kiosk.native";

type SearchedUser = {
  id: number;
  name?: string;
  nickName?: string;
  phone?: string;
  profileImageUrl?: string;
  accessToken?: string;
};

type KioskScreen = 'home' | 'lesson-list' | 'lesson-detail' | 'phone' | 'searching' | 'member-confirm' | 'payment-method' | 'pass-select' | 'attendance';

const VALID_SCREENS: KioskScreen[] = ['home', 'lesson-list', 'lesson-detail', 'phone', 'searching', 'member-confirm', 'payment-method', 'pass-select', 'attendance'];

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
  passPlans,
}: {
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
  passPlans: GetPassPlanResponse[];
}) => {
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pass' | 'cash' | null>(null);
  const [phone, setPhone] = useState('');
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
  const [adminOpen, setAdminOpen] = useState(false);
  const [cashConfirmOpen, setCashConfirmOpen] = useState(false);
  const [cardPayingVariant, setCardPayingVariant] = useState<'card' | 'applepay'>('card');
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  // 홈 진입 시 손님 세션 상태만 정리 (운영자 토큰은 유지)
  const goHome = useCallback(async () => {
    setCurrentScreen('home');
    setSelectedLesson(null);
    setSelectedPassPlan(null);
    setPhone('');
    setSearchedUsers([]);
    setSelectedUser(null);
    setPaymentMethod(null);
    setPaymentInfo(null);
    setPaymentInfoError(null);
    setKioskReceiptFooter(null);
    setSelectedDiscount(null);
    setSelectedPass(null);
    setPaymentQrCodeUrl(null);
  }, []);

  // URL ?step= 으로 직접 진입했지만 필요한 state가 없으면 안전한 단계로 폴백
  useEffect(() => {
    const hasItem = !!selectedLesson || !!selectedPassPlan;
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
    if ((currentScreen === 'payment-method' || currentScreen === 'pass-select')
      && (!hasItem || !hasUser)) {
      setCurrentScreen(hasItem ? 'phone' : 'lesson-list');
    }
  }, [currentScreen, selectedLesson, selectedPassPlan, selectedUser]);

  // payment-method 화면 진입 시:
  //  1) GET /kiosks/payment — price/discounts/methods/paymentId
  //  2) GET /kiosks/:id     — kiosk별 receiptFooter 등 상세 (영수증 하단 안내 문구)
  // 두 호출은 서로 독립이라 병렬로 보냄.
  useEffect(() => {
    if (currentScreen !== 'payment-method' || !selectedUser || !kioskId) return;
    if (!selectedLesson && !selectedPassPlan) return;
    const item = selectedLesson ? 'lesson' : 'pass-plan';
    const itemId = selectedLesson?.id ?? selectedPassPlan?.id;
    if (!itemId) return;
    setPaymentInfoError(null);
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
  }, [currentScreen, selectedUser, selectedLesson, selectedPassPlan, kioskId, locale]);

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
      console.log('KIS 응답:', result);
      // 단일 채널이라 D2(취소) 응답이 여기로 올 수 있음 — admin 모달이 처리. 여기선 D1만 다룸.
      if (result?.outTranCode === 'D2') return;
      const data = (result ?? {}) as Record<string, unknown>;

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

  // 토스트 자동 dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 결제 성공 처리:
  //  - pass: 백엔드 record 미생성 — 바로 인쇄
  //  - cash: handleCashPayment에서 이미 POST → qrCodeUrl 수령 → 바로 인쇄
  //  - card: KIS 매입 성공 → POST /kiosks/payments/:id/complete → 응답의 qrCodeUrl 사용 → 인쇄
  // 인쇄 후 5초 자동 홈.
  useEffect(() => {
    if (paymentResult?.status !== 'success') return;

    let cancelled = false;
    let homeTimer: ReturnType<typeof setTimeout> | undefined;
    const finishUp = (qrText?: string) => {
      if (cancelled) return;
      handlePrintReceipt(qrText);
      homeTimer = setTimeout(() => { setPaymentResult(null); goHome(); }, 5000);
    };

    if (paymentMethod === 'pass') {
      finishUp();
      return () => { cancelled = true; if (homeTimer) clearTimeout(homeTimer); };
    }

    if (paymentMethod === 'cash') {
      finishUp(paymentQrCodeUrl ?? undefined);
      return () => { cancelled = true; if (homeTimer) clearTimeout(homeTimer); };
    }

    if (paymentMethod !== 'card') return;
    if (!paymentInfo?.paymentId || !selectedUser || !kioskId || !paymentItem) return;

    // 카드: KIS 응답에서 매입 정보 추출 → /complete 호출
    const data = paymentResult.data;
    const str = (k: string): string | undefined =>
      typeof data[k] === 'string' && data[k] ? (data[k] as string) : undefined;
    const num = (k: string): number | undefined =>
      typeof data[k] === 'number' ? (data[k] as number) : undefined;

    const finalAmount = Math.max(0, paymentItem.price - (selectedDiscount?.amount ?? 0));
    const rawAuthDate = str('outAuthDate');
    const authDate = rawAuthDate ? rawAuthDate.slice(0, 8) : '';

    completeKioskPaymentAction({
      paymentId: paymentInfo.paymentId,
      targetUserId: selectedUser.id,
      kioskId,
      authNo: str('outAuthNo') ?? '',
      authDate,
      vanKey: str('outVanKey') ?? '',
      totalAmount: num('outTotAmt') ?? finalAmount,
      cardBrand: str('outIssuerName'),
      cardNumber: str('outCardNo'),
      vanResponse: data,
    })
      .then((res) => {
        if (cancelled) return;
        const r = res as { code?: string; message?: string; qrCodeUrl?: string };
        let qrText: string | undefined;
        if (typeof r.code === 'string' && typeof r.message === 'string' && !r.qrCodeUrl) {
          setToastMessage(r.message);
        } else {
          const ok = res as CompleteKioskPaymentResponse;
          if (ok.qrCodeUrl) {
            setPaymentQrCodeUrl(ok.qrCodeUrl);
            qrText = ok.qrCodeUrl;
          }
        }
        finishUp(qrText);
      })
      .catch(() => {
        if (cancelled) return;
        setToastMessage('결제 기록 저장에 실패했습니다');
        finishUp();
      });

    return () => { cancelled = true; if (homeTimer) clearTimeout(homeTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentResult, paymentMethod]);

  // KIS 실패/취소 → Pending 폐기. 'fail'은 실패 다이얼로그도 함께 노출, 'canceled'는 조용히 폼으로 복귀.
  useEffect(() => {
    if (paymentResult?.status !== 'fail' && paymentResult?.status !== 'canceled') return;
    if (paymentMethod !== 'card') return;
    if (!paymentInfo?.paymentId || !kioskId) return;

    discardKioskPaymentAction(paymentInfo.paymentId, kioskId).catch(() => {
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
      });
      setCurrentScreen('member-confirm');
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 신규 가입 확인 → 등록 후 결제 수단 선택으로 바로 진입
  // (사용자가 이미 다이얼로그에서 가입을 명시 확인했으므로 member-confirm 단계는 생략)
  const handleConfirmNewUser = async () => {
    if (!newUserDialog) return;
    const { phone: p, countryCode: cc, suggestedName } = newUserDialog;
    setNewUserDialog(null);
    setCurrentScreen('searching');
    try {
      const reg = await registerKioskUserAction(p, cc, suggestedName);
      if (isGuinnessErrorCase(reg)) {
        setErrorMessage('가입에 실패했습니다.\n다시 시도해주세요.');
        setCurrentScreen('phone');
        return;
      }
      setSelectedUser({
        id: (reg as { id: number }).id,
        name: (reg as { name?: string }).name ?? suggestedName,
        nickName: (reg as { nickName?: string }).nickName,
      });
      setCurrentScreen('payment-method');
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 유저 확인 → 결제 수단 선택으로 이동 (운영자 토큰 유지, 손님 정보는 selectedUser 상태로만 들고 감)
  const handleConfirmUser = async () => {
    if (!selectedUser) return;
    setCurrentScreen('payment-method');
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
                ? formatRuleDescription({ target: r.target, benefit: r.benefit, excludes: r.excludes }, locale, selectedPassPlan.name)
                : (r.description ?? '')
            ),
            ...(selectedPassPlan.features ?? []).map((f) =>
              formatFeatureDescription(f.key, locale, f.value) || f.description || f.key
            ),
          ].filter(Boolean),
        }
      : null;

  // 영수증 인쇄 — 결제 컨텍스트만 buildKioskReceipt에 넘기면 수단별 dispatch + KIS 응답 파싱은 receipt 모듈이 처리.
  // qrText는 백엔드 POST /kiosks/payments 응답의 qrCodeUrl을 그대로 받아 푸터 QR로 인쇄.
  const handlePrintReceipt = useCallback((qrText?: string) => {
    if (!paymentItem || !paymentMethod) return;
    // /me의 studio는 필드 누락 케이스가 있어 /kiosks/payment 응답의 lesson|passPlan.studio가 있으면 우선 사용
    const itemStudio = paymentInfo?.lesson?.studio ?? paymentInfo?.passPlan?.studio;
    // 수업일시 — 서버가 미리 포맷한 lesson.date 우선, 없으면 raw startDate
    const lessonForReceipt = paymentInfo?.lesson ?? selectedLesson;
    const lessonDateTime = lessonForReceipt
      ? ((lessonForReceipt as { date?: string }).date ?? lessonForReceipt.startDate)
      : undefined;
    const lines = buildKioskReceipt({
      paymentMethod,
      studio: {
        name: itemStudio?.name ?? studioName,
        address: itemStudio?.address ?? studioAddress,
        businessNumber: itemStudio?.businessRegistrationNumber ?? studioBusinessNumber,
        representative: itemStudio?.representative ?? studioRepresentative,
        phone: itemStudio?.phone ?? studioPhone,
        // kiosk별 footer가 있으면 우선, 없으면 studio 기본값
        receiptFooter: kioskReceiptFooter ?? studioReceiptFooter,
      },
      transaction: { kioskName, paymentId: paymentInfo?.paymentId },
      user: selectedUser ? {
        name: selectedUser.name,
        nickName: selectedUser.nickName,
        phone: phone || selectedUser.phone,
      } : undefined,
      itemType: selectedLesson ? 'lesson' : (selectedPassPlan ? 'pass-plan' : undefined),
      // 수업 결제 시 강사 노출 — 닉네임 우선, 없으면 본명
      artists: selectedLesson
        ? (paymentInfo?.lesson?.artists ?? selectedLesson.artists ?? [])
            .map((a) => a.nickName || a.name)
            .filter((n): n is string => Boolean(n))
        : undefined,
      lessonDateTime: selectedLesson ? lessonDateTime : undefined,
      items: [{ name: paymentItem.title, price: paymentItem.price }],
      discount: selectedDiscount ? {
        amount: selectedDiscount.amount,
        description: selectedDiscount.description,
        targetLabel: selectedDiscount.passRule?.targetLabel ?? undefined,
      } : undefined,
      cardData: paymentResult?.data,
      qrText,
    });
    sendReceiptToPrinter(lines);
  }, [paymentItem, paymentResult, paymentMethod, selectedDiscount, studioName, studioReceiptFooter, kioskReceiptFooter, studioAddress, studioBusinessNumber, studioRepresentative, studioPhone, kioskName, selectedUser, phone, selectedLesson, selectedPassPlan, paymentInfo]);

  // 공통: 선택된 할인을 PaymentDiscount[] 형태로 직렬화
  const buildDiscounts = useCallback((): PaymentDiscount[] | undefined => {
    if (!selectedDiscount) return undefined;
    return [{
      key: selectedDiscount.key,
      amount: selectedDiscount.amount,
      type: selectedDiscount.type as PaymentDiscount['type'],
      itemId: selectedDiscount.itemId,
      passRuleId: selectedDiscount.passRule?.id,
    }];
  }, [selectedDiscount]);

  // 카드 결제 (Apple Pay 포함):
  //  ① POST /kiosks/payments — Pending 생성 → 응답의 amount를 단말 매입 금액으로 사용
  //  ② requestKisPayment 호출 (D1) — 응답은 onKisPaymentResult가 처리
  //  결제 성공/실패 판정 후 ③ POST /kiosks/payments/:id/complete 또는 DELETE /kiosks/payments/:id 는 paymentResult useEffect에서 진행
  const handleCardPayment = useCallback(async (variant: 'card' | 'applepay' = 'card') => {
    if (!paymentItem || isPaying || !selectedUser || !paymentInfo?.paymentId || !kioskId) return;
    setCardPayingVariant(variant);
    setIsPaying(true);
    setPaymentResult(null);
    setPaymentMethod('card');

    const res = await startKioskPaymentAction({
      targetUserId: selectedUser.id,
      kioskId,
      paymentId: paymentInfo.paymentId,
      type: 'card',
      discounts: buildDiscounts(),
    });

    const r = res as { code?: string; message?: string; amount?: number };
    if (typeof r.code === 'string' && typeof r.message === 'string' && typeof r.amount !== 'number') {
      setIsPaying(false);
      setPaymentMethod(null);
      setToastMessage(r.message);
      return;
    }

    const created = res as StartKioskPaymentResponse;

    // KIS 단말 호출 — 1초 대기 제거. Pending 응답 직후 곧장 송출.
    window.KloudEvent?.requestKisPayment?.(JSON.stringify({
      ...(process.env.NEXT_PUBLIC_KIS_TEST_MODE === 'Y' ? { inTestMode: 'Y' } : {}),
      inTranCode: 'D1',
      inTotAmt: `${created.amount}`,
      inInstallment: '00',
    }));
  }, [paymentItem, isPaying, selectedUser, paymentInfo, kioskId, buildDiscounts]);

  // 현금 결제: POST /kiosks/payments(type='cash') 한 방에 즉시 Completed + qrCodeUrl 수령
  const handleCashPayment = useCallback(async () => {
    if (!paymentItem || !selectedUser || !paymentInfo?.paymentId || !kioskId || isPaying) return;
    setPaymentMethod('cash');
    setIsPaying(true);

    const res = await startKioskPaymentAction({
      targetUserId: selectedUser.id,
      kioskId,
      paymentId: paymentInfo.paymentId,
      type: 'cash',
      discounts: buildDiscounts(),
    });

    setIsPaying(false);

    const r = res as { code?: string; message?: string; status?: string; qrCodeUrl?: string | null };
    if (typeof r.code === 'string' && typeof r.message === 'string' && !r.status) {
      setPaymentMethod(null);
      setToastMessage(r.message);
      return;
    }

    const ok = res as StartKioskPaymentResponse;
    if (ok.qrCodeUrl) setPaymentQrCodeUrl(ok.qrCodeUrl);
    setPaymentResult({ status: 'success', data: {} });
  }, [paymentItem, selectedUser, paymentInfo, kioskId, isPaying, buildDiscounts]);

  // 패스권 사용 (B 흐름) — POST /kiosks/passes/:passId/use 직접 호출
  const handlePayWithPass = useCallback(async () => {
    if (!paymentItem || !selectedUser || !selectedLesson) return;
    const passId = selectedPass?.pass.id;
    if (!passId) {
      setToastMessage('패스권 정보를 찾을 수 없습니다');
      return;
    }
    try {
      const res = await useKioskPassAction({
        passId,
        targetUserId: selectedUser.id,
        kioskId,
        lessonId: selectedLesson.id,
      });
      if (isGuinnessErrorCase(res)) {
        setToastMessage(res.message ?? '패스권 사용에 실패했습니다');
        return;
      }
      setPaymentMethod('pass');
      setPaymentResult({ status: 'success', data: {} });
    } catch {
      setToastMessage('요청에 실패했습니다');
    }
  }, [paymentItem, selectedPass, selectedUser, selectedLesson, kioskId]);


  return (
    <div className="w-full h-screen overflow-hidden">
      {currentScreen === 'home' && (
        <KioskHomeForm
          studioName={studioName}
          kioskImageUrl={kioskImageUrl}
          locale={locale}
          onSelectPayment={() => setCurrentScreen('lesson-list')}
          onSelectVisit={() => setCurrentScreen('attendance')}
          onChangeLocale={setLocale}
          onAdminMode={() => setAdminOpen(true)}
        />
      )}

      {/* lesson-list / lesson-detail에서 list form은 같은 인스턴스로 유지 — 모달이 떠도 뒤에서 재마운트/재fetch 안 일어나게 */}
      {(currentScreen === 'lesson-list' || currentScreen === 'lesson-detail') && (
        <KioskLessonListForm
          studioId={studioId}
          passPlans={passPlans}
          locale={locale}
          onSelectLesson={(lesson) => { setSelectedLesson(lesson); setSelectedPassPlan(null); setCurrentScreen('lesson-detail'); }}
          onSelectPassPlan={(plan) => { setSelectedPassPlan(plan); setSelectedLesson(null); setCurrentScreen('phone'); }}
          onBack={goHome}
          onChangeLocale={setLocale}
        />
      )}

      {currentScreen === 'lesson-detail' && selectedLesson && (
        <KioskLessonDetailModal
          lesson={selectedLesson}
          locale={locale}
          onClose={() => setCurrentScreen('lesson-list')}
          onPayment={() => setCurrentScreen('phone')}
        />
      )}

      {/* phone / searching / member-confirm 공유 — modal 떠도 폼 인스턴스 유지 */}
      {(currentScreen === 'phone' || currentScreen === 'searching' || currentScreen === 'member-confirm') && (
        <KioskPhoneInputForm
          locale={locale}
          onBack={() => setCurrentScreen('lesson-list')}
          onNext={handlePhoneNext}
          onHome={goHome}
          onChangeLocale={setLocale}
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
          profileImageUrl={selectedUser.profileImageUrl}
          locale={locale}
          onBack={() => setCurrentScreen('phone')}
          onConfirm={handleConfirmUser}
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
          itemType={selectedLesson ? 'lesson' : 'pass-plan'}
          lessonTitle={paymentItem.title}
          lessonSubtitle={paymentItem.subtitle}
          lessonThumbnailUrl={paymentItem.thumbnailUrl}
          price={paymentItem.price}
          user={{
            name: selectedUser.name,
            nickName: selectedUser.nickName,
            phone: phone || selectedUser.phone,
            profileImageUrl: selectedUser.profileImageUrl,
          }}
          selectedDiscount={selectedDiscount ?? (selectedPass ? {
            // 패스 사용(B 흐름)은 UI상 풀 커버 할인으로 표시 — finalPrice = 0으로 떨어지면서 신청하기 버튼이 노출됨
            key: `pass-${selectedPass.pass.id}`,
            value: String(paymentItem.price),
            amount: paymentItem.price,
            type: 'passRule',
            itemId: selectedPass.pass.id,
            description: selectedPass.pass.passPlan?.name ?? '패스권',
          } as DiscountResponse : null)}
          locale={locale}
          onBack={() => setCurrentScreen('phone')}
          onSelectPass={() => setCurrentScreen('pass-select')}
          onClearDiscount={() => { setSelectedDiscount(null); setSelectedPass(null); }}
          onSelectCard={() => handleCardPayment('card')}
          onSelectApplePay={() => handleCardPayment('applepay')}
          onSelectCash={() => setCashConfirmOpen(true)}
          onPayWithPass={handlePayWithPass}
          onHome={goHome}
          onChangeLocale={setLocale}
        />
      )}

      {isPaying && (
        <KioskCardPaymentDialog method={cardPayingVariant} locale={locale} onCancel={() => setIsPaying(false)} />
      )}

      {paymentResult?.status === 'success' && (
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

            {/* 결제 항목 카드 */}
            <div className="w-full max-w-[720px] mt-[min(3.7vw,40px)] bg-white border border-[#E6E8EA] rounded-[16px] px-[min(3vw,32px)] py-[min(2.4vw,26px)] flex items-center justify-between gap-[12px]">
              <span className="text-black font-bold leading-snug line-clamp-2 flex-1" style={{ fontSize: 'min(2.4vw,26px)' }}>
                {paymentItem?.title ?? ''}
              </span>
              <span className="flex items-baseline gap-[6px] shrink-0">
                <span className="text-black font-bold" style={{ fontSize: 'min(2.8vw,30px)' }}>
                  {new Intl.NumberFormat('ko-KR').format(paymentItem?.price ?? 0)}
                </span>
                <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vw,20px)' }}>{t('won')}</span>
              </span>
            </div>
          </div>

          {/* 하단 안내 + 버튼 */}
          <div className="shrink-0 px-[5.6%] pb-[min(4vw,44px)]">
            <p className="text-[#86898C] text-center mb-[min(1.4vw,16px)]" style={{ fontSize: 'min(1.6vw,18px)' }}>
              {t('kiosk_close_in_5s')}
            </p>
            <div className="flex gap-[min(1.4vw,16px)]">
              {selectedPassPlan && (
                <button
                  onClick={() => { setPaymentResult(null); setPaymentMethod(null); setSelectedPassPlan(null); setCurrentScreen('lesson-list'); }}
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
        <div className="fixed left-1/2 -translate-x-1/2 z-40 px-[min(3.7vw,40px)] py-[min(2.2vw,24px)] rounded-[16px] bg-black/85" style={{ bottom: 'min(7.4vw, 80px)' }}>
          <span className="text-white font-medium" style={{ fontSize: 'min(2.6vw, 28px)' }}>{toastMessage}</span>
        </div>
      )}

      {adminOpen && (
        <KioskAdminModal
          kioskId={kioskId}
          kioskName={kioskName}
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
          amount={Math.max(0, paymentItem.price - (selectedDiscount?.amount ?? 0))}
          locale={locale}
          onCancel={() => setCashConfirmOpen(false)}
          onConfirm={() => { setCashConfirmOpen(false); handleCashPayment(); }}
        />
      )}

      {newUserDialog && (
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

      {currentScreen === 'pass-select' && selectedLesson && selectedUser && (
        <KioskPassSelectModal
          passes={paymentInfo?.user?.passes ?? []}
          discounts={paymentInfo?.discounts ?? []}
          locale={locale}
          onBack={() => setCurrentScreen('payment-method')}
          onSelect={(selection) => {
            if (selection.kind === 'discount') {
              setSelectedDiscount(selection.discount);
              setSelectedPass(null);
            } else {
              setSelectedPass({ pass: selection.pass, rule: selection.rule });
              setSelectedDiscount(null);
            }
            setCurrentScreen('payment-method');
          }}
        />
      )}

      {currentScreen === 'attendance' && (
        <KioskAttendanceForm
          studioName={studioName}
          onBack={goHome}
          onComplete={goHome}
          locale={locale}
        />
      )}
    </div>
  );
}
