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
import {searchUserAction, registerKioskUserAction, getKioskPaymentAction, completeKioskPaymentAction, useKioskPassAction} from "@/app/kiosk/kiosk.actions";
import {GetPaymentResponse, DiscountResponse, PaymentDiscount} from "@/app/endpoint/payment.endpoint";
import {GetPassResponse, PassRuleResponse} from "@/app/endpoint/pass.endpoint";
import {CompleteKioskPaymentResponse} from "@/app/endpoint/kiosk.endpoint";
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

export const KioskForm = ({studioId, studioName, studioProfileImageUrl, kioskId, kioskImageUrl, passPlans}: {studioId: number; studioName: string; studioProfileImageUrl?: string; kioskId: number; kioskImageUrl?: string; passPlans: GetPassPlanResponse[]}) => {
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
  const [paymentResult, setPaymentResult] = useState<{ status: 'success' | 'fail'; data: Record<string, unknown> } | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newUserDialog, setNewUserDialog] = useState<{ phone: string; countryCode: string; suggestedName: string } | null>(null);
  const [printerDebugOpen, setPrinterDebugOpen] = useState(false);
  const [printerDebugResult, setPrinterDebugResult] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<GetPaymentResponse | null>(null);
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

  // payment-method 화면 진입 시 GET /kiosks/payment 호출 — price/discounts/methods 응답
  useEffect(() => {
    if (currentScreen !== 'payment-method' || !selectedUser || !kioskId) return;
    if (!selectedLesson && !selectedPassPlan) return;
    const item = selectedLesson ? 'lesson' : 'pass-plan';
    const itemId = selectedLesson?.id ?? selectedPassPlan?.id;
    if (!itemId) return;
    getKioskPaymentAction({ kioskId, targetUserId: selectedUser.id, item, itemId })
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToastMessage(res.message ?? '결제 정보를 불러오지 못했습니다');
          return;
        }
        setPaymentInfo(res as GetPaymentResponse);
      })
      .catch(() => {
        // 응답 실패는 토스트만 — UI는 prop으로 받은 price를 폴백으로 보여줌
        setToastMessage('결제 정보를 불러오지 못했습니다');
      });
  }, [currentScreen, selectedUser, selectedLesson, selectedPassPlan, kioskId]);

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
      const data = (result ?? {}) as Record<string, unknown>;

      setIsPaying(false);
      if (result?.canceled) return;
      // TODO: 성공 시 백엔드에 거래정보 저장 (outAuthNo / outVankey / outCustomerUuid 등)
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
      if (result?.success) {
        setToastMessage('영수증 출력 완료');
        return;
      }
      if (result?.canceled) return;
      const msg = result?.error ?? (result?.resultCode != null ? String(result.resultCode) : '프린트에 실패했습니다.');
      setToastMessage(`프린트 실패: ${msg}`);
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

  // 결제 성공 시 자동 영수증 인쇄 + 5초 후 자동 홈 이동
  useEffect(() => {
    if (paymentResult?.status !== 'success') return;
    handlePrintReceipt();
    const timer = setTimeout(() => {
      setPaymentResult(null);
      goHome();
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentResult, goHome]);

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
        subtitle: [formatLessonDate(selectedLesson), formatLessonStart(selectedLesson)].filter(Boolean).join(' · '),
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

  // 영수증 인쇄 — 결제 컨텍스트만 buildKioskReceipt에 넘기면 수단별 dispatch + KIS 응답 파싱은 receipt 모듈이 처리
  const handlePrintReceipt = useCallback(() => {
    if (!paymentItem || !paymentMethod) return;
    const lines = buildKioskReceipt({
      paymentMethod,
      studio: { name: studioName },
      items: [{ name: paymentItem.title, price: paymentItem.price }],
      discount: selectedDiscount ? {
        amount: selectedDiscount.amount,
        description: selectedDiscount.description,
        targetLabel: selectedDiscount.passRule?.targetLabel ?? undefined,
      } : undefined,
      cardData: paymentResult?.data,
    });
    sendReceiptToPrinter(lines);
  }, [paymentItem, paymentResult, paymentMethod, selectedDiscount, studioName]);

  // 카드 결제: KIS 단말기 호출 (응답은 마운트 시 등록한 onKisPaymentResult가 처리)
  // Apple Pay도 같은 단말기에서 NFC로 처리되므로 동일 핸들러 사용. 할인 적용 시 잔액만 청구.
  // variant는 대기 다이얼로그 문구 분기에만 사용 (실제 KIS 호출은 동일).
  const handleCardPayment = useCallback((variant: 'card' | 'applepay' = 'card') => {
    if (!paymentItem || isPaying) return;
    const finalAmount = Math.max(0, paymentItem.price - (selectedDiscount?.amount ?? 0));
    setCardPayingVariant(variant);
    setIsPaying(true);
    setPaymentResult(null);
    setPaymentMethod('card');

    // ============ MOCK_KIS_PAYMENT 시작 ============
    // 네이티브 KIS 단말기 없이 테스트용. 3초 후 가짜 승인 응답을 직접 트리거.
    // "Mock 없애줘"라고 하면 이 블록 (시작 주석부터 끝 주석까지 + return 포함) 통째로 제거 → 아래 requestKisPayment가 다시 활성화됨.
    const mockAuthDate = (() => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
    })();
    setTimeout(() => {
      type Win = Window & { onKisPaymentResult?: (r: Record<string, unknown>) => void };
      (window as Win).onKisPaymentResult?.({
        success: true,
        outAuthNo: '12345678',
        outAuthDate: mockAuthDate,
        outVanKey: `MOCK_VAN_${Date.now()}`,
        outTotAmt: finalAmount,
        outCardNo: '5570-9930-****-1234',
        outIssuerName: 'KB국민카드',
        outInstallment: '00',
      });
    }, 3000);
    return;
    // ============ MOCK_KIS_PAYMENT 끝 ============

    window.KloudEvent?.requestKisPayment?.(JSON.stringify({
      inTestMode: 'Y',
      inTranCode: 'D1',
      inTotAmt: `${finalAmount}`,
      inInstallment: '00',
    }));
  }, [paymentItem, isPaying, selectedDiscount]);

  // 현금 결제 신청: 결제는 인포에서 마무리 — 영수증만 출력하고 성공 화면으로
  const handleCashPayment = useCallback(() => {
    if (!paymentItem) return;
    setPaymentMethod('cash');
    setPaymentResult({ status: 'success', data: {} });
  }, [paymentItem]);

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

  // 결제 완료 → 백엔드에 POST /kiosks/payments (idempotent — 같은 paymentId 재호출 안전)
  // 카드: KIS 단말 승인 후 setPaymentResult가 트리거 → 이 effect가 메타데이터를 뒤로 보냄
  // 현금: handleCashPayment에서 직접 setPaymentResult → 동일 effect로 백엔드 기록
  // 패스(B): handlePinSubmit에서 useKioskPassAction 직접 호출 — 여기서는 스킵
  useEffect(() => {
    if (paymentResult?.status !== 'success') return;
    if (paymentMethod !== 'card' && paymentMethod !== 'cash') return;
    if (!paymentInfo?.paymentId || !selectedUser || !kioskId || !paymentItem) return;

    const data = paymentResult.data;
    const str = (k: string): string | undefined =>
      typeof data[k] === 'string' && data[k] ? (data[k] as string) : undefined;
    const num = (k: string): number | undefined =>
      typeof data[k] === 'number' ? (data[k] as number) : undefined;

    const discounts: PaymentDiscount[] | undefined = selectedDiscount ? [{
      key: selectedDiscount.key,
      amount: selectedDiscount.amount,
      type: selectedDiscount.type as PaymentDiscount['type'],
      itemId: selectedDiscount.itemId,
      passRuleId: selectedDiscount.passRule?.id,
    }] : undefined;

    const finalAmount = Math.max(0, paymentItem.price - (selectedDiscount?.amount ?? 0));

    // KIS는 outAuthDate를 YYYYMMDDHHmmss 14자리로 주기도 하는데 백엔드 spec은 YYYYMMDD 8자리 → 앞 8자리만 절단
    const rawAuthDate = str('outAuthDate');
    const cardFields = paymentMethod === 'card' ? {
      authNo: str('outAuthNo'),
      authDate: rawAuthDate ? rawAuthDate.slice(0, 8) : undefined,
      vanKey: str('outVanKey'),
      totalAmount: num('outTotAmt') ?? finalAmount,
      cardBrand: str('outIssuerName'),
      cardNumber: str('outCardNo'),
      vanResponse: data,
    } : {};

    completeKioskPaymentAction({
      targetUserId: selectedUser.id,
      kioskId,
      paymentId: paymentInfo.paymentId,
      type: paymentMethod,
      discounts,
      ...cardFields,
    })
      .then((res) => {
        if (isGuinnessErrorCase(res)) {
          setToastMessage(res.message ?? '결제 기록 저장 실패');
          return;
        }
        const ok = res as CompleteKioskPaymentResponse;
        if (ok.qrCodeUrl) setPaymentQrCodeUrl(ok.qrCodeUrl);
      })
      .catch(() => {
        setToastMessage('결제 기록 저장에 실패했습니다');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentResult, paymentMethod]);

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

      {/* payment-method / pass-select 공유 — modal 떠도 폼 인스턴스 유지 */}
      {(currentScreen === 'payment-method' || currentScreen === 'pass-select') && paymentItem && selectedUser && (
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
        <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%]">
          <div className="bg-white rounded-[32px] w-full max-w-[720px] p-[min(3.7vw,40px)] flex flex-col items-center">
            <p className="text-[#1E2124] font-bold text-center" style={{ fontSize: 'min(4vw, 44px)' }}>
              {t('kiosk_payment_failed')}
            </p>
            <div className="w-full mt-[min(2.6vw,28px)] bg-[#F9F9FB] rounded-[16px] p-[min(2.2vw,24px)] max-h-[60vh] overflow-auto">
              <pre className="text-[#1E2124] whitespace-pre-wrap break-all font-mono" style={{ fontSize: 'min(2vw, 22px)' }}>
                {Object.entries(paymentResult.data).length === 0
                  ? t('kiosk_no_response')
                  : Object.entries(paymentResult.data)
                      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                      .join('\n')}
              </pre>
            </div>
            <button
              onClick={() => { setPaymentResult(null); setPaymentMethod(null); }}
              className="mt-[min(3.7vw,40px)] w-full h-[min(11vw,120px)] rounded-[24px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(3.7vw, 40px)' }}>{t('kiosk_confirm')}</span>
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
        <KioskAdminModal kioskId={kioskId} studioName={studioName} onClose={() => setAdminOpen(false)} />
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
