'use client'

import PaymentButton, { PaymentType } from "@/app/lessons/[id]/payment/payment.button";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { DiscountSection } from "@/app/lessons/[id]/payment/DiscountSection";
import { PassesSection } from "@/app/payment/PassesSection";
import { PricePolicySection } from "@/app/payment/PricePolicySection";
import { SubscriptionSection } from "@/app/payment/SubscriptionSection";
import { CouponResponse, DiscountResponse, GetPaymentMethodResponse, GetPaymentResponse, LessonPricePolicyResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type UnifiedPaymentType = 'lesson' | 'lesson-group' | 'pass-plan' | 'practice-room' | 'bundle';

const getPaymentType = (type: UnifiedPaymentType): PaymentType => {
  switch (type) {
    case 'lesson':
      return { value: 'lesson', prefix: 'LT', apiValue: 'lesson' };
    case 'lesson-group':
      return { value: 'lessonGroup', prefix: 'LGT', apiValue: 'lesson-group' };
    case 'pass-plan':
      return { value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan' };
    case 'practice-room':
      return { value: 'practiceRoom', prefix: 'PR', apiValue: 'practice-room' };
    case 'bundle':
      return { value: 'bundle', prefix: 'BD', apiValue: 'bundle' };
  }
}

const getTitleResource = (type: UnifiedPaymentType): StringResourceKey => {
  if (type === 'pass-plan') return 'pass_plan_price';
  if (type === 'bundle') return 'promotion_price';
  if (type === 'practice-room') return 'practice_room_price';
  return 'lesson_price';
}

const getItemId = (payment: GetPaymentResponse, type: UnifiedPaymentType): number => {
  switch (type) {
    case 'lesson':
    // lesson-group으로 진입해도 정책 선택 전 기본값은 lesson id — 정책이 선택되면 호출부가 정책 id로 대체한다.
    case 'lesson-group':
      return payment.lesson?.id ?? 0;
    case 'pass-plan':
      return payment.passPlan?.id ?? 0;
    case 'practice-room':
      return payment.studioRoom?.id ?? 0;
    case 'bundle':
      return payment.bundle?.id ?? 0;
  }
}

const getItemTitle = (payment: GetPaymentResponse, type: UnifiedPaymentType): string => {
  switch (type) {
    case 'lesson':
    case 'lesson-group':
      return payment.lesson?.title ?? '';
    case 'pass-plan':
      return payment.passPlan?.name ?? '';
    case 'practice-room':
      return payment.studioRoom?.name ?? '';
    case 'bundle':
      return payment.bundle?.name ?? '';
  }
}

const getItemPrice = (payment: GetPaymentResponse, type: UnifiedPaymentType): number => {
  // 최상위 price가 있으면 우선 사용, 없으면 아이템별 price
  if (payment.price != null) return payment.price;
  switch (type) {
    case 'lesson':
    case 'lesson-group':
      return payment.lesson?.price ?? 0;
    case 'pass-plan':
      return payment.passPlan?.price ?? 0;
    case 'practice-room':
      return payment.price ?? payment.studioRoom?.unitPrice ?? 0;
    case 'bundle':
      return 0;
  }
}

const getStudio = (payment: GetPaymentResponse, type: UnifiedPaymentType) => {
  switch (type) {
    case 'lesson':
      return payment.lesson?.studio;
    case 'pass-plan':
      return payment.passPlan?.studio;
    case 'practice-room':
      return null;
    case 'bundle':
      // bundle.studio는 간소형 — SellerInformation의 GetStudioResponse 풀 타입과 안 맞아 null 처리.
      // 판매자 정보는 BE가 페이로드에 풀 스튜디오 보내주면 그때 연결.
      return null;
  }
}

const needsMountCheck = (type: UnifiedPaymentType) =>
  type === 'pass-plan';

const defaultMethod = (type: UnifiedPaymentType): PaymentMethodType | undefined =>
  type === 'pass-plan' ? 'credit' : undefined;

export const UnifiedPaymentInfo = ({
  payment,
  type,
  url,
  appVersion,
  os,
  locale,
  beforeDepositor,
  actualPayerUserId,
  isProxyPayment,
  practiceRoomInfo,
  buttonSlotId,
}: {
  payment: GetPaymentResponse,
  type: UnifiedPaymentType,
  url: string,
  appVersion: string,
  os?: string,
  beforeDepositor: string,
  actualPayerUserId?: number,
  isProxyPayment?: boolean,
  locale: Locale,
  practiceRoomInfo?: { studioRoomId: number; startDate: string; endDate: string },
  /**
   * 결제 버튼을 화면 하단 고정 대신 이 id의 DOM 노드로 portal한다.
   * PC 결제 폼(PaymentPcForm)이 우측 요약 카드 아래 슬롯을 두고 지정 — 모바일 인스턴스는 미지정(고정 버튼 유지).
   */
  buttonSlotId?: string,
}) => {
  // easy_pay의 providers를 개별 메서드로 풀어서 사용
  const easyPayLabel: Record<string, string> = {
    naver_pay: getLocaleString({ locale, key: 'naver_pay' }),
    kakao_pay: getLocaleString({ locale, key: 'kakao_pay' }),
    toss_pay: getLocaleString({ locale, key: 'toss_pay' }),
  };
  // 'pass'는 결제수단 영역이 아니라 별도 PassesSection으로 렌더 — 결제수단 옵션에서 제외.
  // 단 methods에 'pass'가 있다는 사실은 "패스 결제 활성" 신호로 PassesSection 노출 가드에 사용.
  const passMethodEnabled = payment.methods.some(m => m.type === 'pass');
  const paymentMethods: GetPaymentMethodResponse[] = payment.methods
    .filter(m => m.type !== 'pass')
    .flatMap(m => {
      if (m.type === 'easy_pay' && m.providers && m.providers.length > 0) {
        return m.providers.map((p, i) => ({ id: m.id * -100 - i, type: p, name: easyPayLabel[p] ?? p }));
      }
      return [m];
    });

  // canSubscribe=true면 정기결제 스페셜 섹션을 따로 노출한다.
  // 결제수단 목록은 BE가 주는 대로 전부(billing 포함) 그대로 — 일반 billing 선택은 단건 결제,
  // 정기결제 섹션 선택(subscribeSelected)일 때만 구독 생성(POST /subscription)으로 간다.
  const canSubscribe = payment.canSubscribe === true;

  // BE 응답이 user와 같은 레벨로 분리됨 — 마이그레이션 호환 위해 둘 다 시도.
  // 비회원(연습실 게스트)은 user가 없으므로 옵셔널 체이닝.
  const availablePasses: GetPassResponse[] = payment.passes ?? payment.user?.passes ?? [];

  // BE가 단일 passRule로 내려줌 (신규). legacy passRules[] 첫 요소 fallback.
  // - Discount 룰 → 일반 결제수단 + selectedDiscount 적용 (결제수단/패스 동시 활성 OK, 잔액 일반 결제)
  // - FreeCount/Unlimited 룰 → selectedMethod='pass' + selectedDiscount=undefined (use pass 풀커버)
  const getPrimaryRule = (pass: GetPassResponse) =>
    pass.passRule ?? (pass.passRules ?? [])[0];

  const getPassDiscountRule = (pass: GetPassResponse) => {
    const rule = getPrimaryRule(pass);
    return rule?.usable && rule.benefitType === 'Discount' ? rule : undefined;
  };

  const buildDiscountFromPass = (pass: GetPassResponse): DiscountResponse | undefined => {
    const rule = getPrimaryRule(pass);
    if (!rule?.usable || rule.benefitType !== 'Discount' || (rule.benefitValue ?? 0) <= 0) return undefined;
    return {
      key: pass.passPlan?.name ?? 'pass',
      value: String(rule.benefitValue ?? 0),
      amount: rule.benefitValue ?? 0,
      type: 'passRule',
      itemId: pass.id,
      description: pass.passPlan?.name,
      passRule: {
        id: rule.id,
        status: rule.status,
        startDate: rule.startDate,
        endDate: rule.endDate,
        remainingCount: rule.remainingCount,
        usageCount: rule.usageCount,
        targetType: rule.targetType,
        targetValue: rule.targetValue,
        targetLabel: rule.targetLabel,
        benefitType: rule.benefitType,
        benefitValue: rule.benefitValue,
        excludes: rule.excludes,
        usable: rule.usable,
      },
    };
  };

  // 수업 가격 정책 — 존재하면 방식 선택 UI를 노출하고 선택한 정책의 price/paymentId로 결제한다.
  // 스펙상 위치는 lesson 하위. payment 루트는 구버전 응답 폴백이다.
  // 판매 중단(Cancelled)된 방식은 제외 — 이미 산 수강권은 유지되지만 새로 팔지는 않는다.
  // 정렬은 서버가 lessonCount 오름차순으로 보장하므로 그대로 쓴다.
  const pricePolicies: LessonPricePolicyResponse[] = useMemo(() => {
    const fromApi = payment.lesson?.pricePolicies ?? payment.pricePolicies ?? [];
    return fromApi.filter(p => p.status !== 'Cancelled');
  }, [payment.lesson?.pricePolicies, payment.pricePolicies]);
  const hasPolicies = pricePolicies.length > 0;
  // 기본 선택 — 구매 가능한(usable !== false) 방식 중 isRecommended 우선, 없으면 첫 번째.
  // 전부 불가면 첫 번째를 선택해 사유를 보여주고 결제 버튼은 disabled로 막는다.
  const defaultPolicyId = hasPolicies
    ? (pricePolicies.find(p => p.isRecommended && p.usable !== false)
        ?? pricePolicies.find(p => p.usable !== false)
        ?? pricePolicies[0]).id
    : undefined;
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | undefined>(defaultPolicyId);
  const selectedPolicy = hasPolicies
    ? (pricePolicies.find(p => p.id === selectedPolicyId) ?? pricePolicies[0])
    : undefined;

  const [cards, setCards] = useState<GetBillingResponse[]>(payment.cards ?? []);
  // 사용 가능한 패스 후보 — Discount/FreeCount/Unlimited 구분 없이 일단 잡는다.
  const detectedInitialPass = availablePasses.find(p => {
    const rule = getPrimaryRule(p);
    return !!rule?.usable || (p.passFeatures ?? []).some(f => f.usable);
  });
  const detectedIsDiscount = !!(detectedInitialPass && getPassDiscountRule(detectedInitialPass));
  // 초기 패스 분기:
  //   - Discount 룰 → 일반 결제수단 + selectedDiscount 자동 적용 (passMethodEnabled 무관)
  //   - 그 외(FreeCount/Unlimited) 룰 → 결제수단을 'pass'로 진입해야 하므로 passMethodEnabled가 true일 때만 허용.
  //     methods에 pass가 없는데 use-pass 류 패스만 보이는 부정합 케이스는 자동 method 선택을 보류해
  //     결제 버튼이 disabled 되도록 유도(사용자에게 명시 선택 강제).
  const fallbackMethod: PaymentMethodType | undefined =
    defaultMethod(type) ?? (paymentMethods.length > 0 ? paymentMethods[0].type : undefined);
  const useTypePassWithoutPassMethod =
    !passMethodEnabled && !!detectedInitialPass && !detectedIsDiscount;
  const initialPass: GetPassResponse | undefined = useTypePassWithoutPassMethod
    ? undefined
    : detectedInitialPass;
  const initialPassIsDiscount = !!(initialPass && getPassDiscountRule(initialPass));
  const initialMethod: PaymentMethodType | undefined = useTypePassWithoutPassMethod
    ? undefined                                                // BE 부정합 → disabled 유도
    : (initialPass && !initialPassIsDiscount ? 'pass' : fallbackMethod);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(initialMethod);
  const [selectedPass, setSelectedPass] = useState<GetPassResponse | undefined>(initialPass);
  const [selectedBillingCard, setSelectedBillingCard] = useState<GetBillingResponse | undefined>(
    payment.cards && payment.cards.length > 0 ? payment.cards[0] : undefined
  );
  const [depositor, setDepositor] = useState(beforeDepositor);
  const [mounted, setMounted] = useState(false);
  // portal 대상은 서버 렌더된 노드라 마운트 후에만 찾을 수 있다
  const [buttonSlot, setButtonSlot] = useState<HTMLElement | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponResponse | undefined>(undefined);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountResponse | undefined>(
    (type === 'pass-plan' || type === 'practice-room' || !initialPass || !initialPassIsDiscount)
      ? undefined
      : buildDiscountFromPass(initialPass)
  );

  const handleSelectMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    // 현재 선택된 패스가 FreeCount/Unlimited(=use pass 흐름)면 일반 결제수단과 모순 → 해제.
    // Discount 패스는 일반 결제수단과 같이 쓰는 정상 케이스 → 유지.
    if (method !== 'pass' && selectedPass && !getPassDiscountRule(selectedPass)) {
      setSelectedPass(undefined);
    }
  }

  // 정기결제 섹션이 선택됐는지 — 결제수단은 'billing'을 공유하되 제출 경로(단건/구독)만 가른다
  const [subscribeSelected, setSubscribeSelected] = useState(false);
  // 패스 선택 등 어떤 경로로든 수단이 billing에서 벗어나면 구독 모드 해제
  useEffect(() => {
    if (subscribeSelected && selectedMethod !== 'billing') setSubscribeSelected(false);
  }, [subscribeSelected, selectedMethod]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!buttonSlotId) return;
    setButtonSlot(document.getElementById(buttonSlotId));
  }, [buttonSlotId]);

  if (needsMountCheck(type) && !mounted) return null;

  const studio = getStudio(payment, type);
  const noPass = type === 'pass-plan' || type === 'practice-room';
  // 가격정책이 있으면 선택된 옵션의 가격이 상품가가 된다.
  const itemPrice = hasPolicies ? (selectedPolicy?.price ?? 0) : getItemPrice(payment, type);

  // 정기결제 주기 — 선택한 가격 정책으로 연산: 회차 수 ÷ 주당 요일 수 ≈ N주마다.
  // 요일 없는 정책은 회차 기준(N회마다), 정책 없는 상품(패스플랜 등)은 월 단위 폴백.
  const subscriptionCycle = (() => {
    if (selectedPolicy && selectedPolicy.lessonCount > 0) {
      const daysPerWeek = selectedPolicy.days?.length ?? 0;
      if (daysPerWeek > 0) {
        const weeks = Math.max(1, Math.round(selectedPolicy.lessonCount / daysPerWeek));
        return {
          suffix: getLocaleString({ locale, key: 'subscription_per_weeks' }).replace('{n}', String(weeks)),
          label: getLocaleString({ locale, key: 'cycle_every_weeks' }).replace('{n}', String(weeks)),
        };
      }
      return {
        suffix: getLocaleString({ locale, key: 'subscription_per_sessions' }).replace('{n}', String(selectedPolicy.lessonCount)),
        label: getLocaleString({ locale, key: 'cycle_every_sessions' }).replace('{n}', String(selectedPolicy.lessonCount)),
      };
    }
    return {
      suffix: getLocaleString({ locale, key: 'subscription_per_month' }),
      label: getLocaleString({ locale, key: 'cycle_monthly' }),
    };
  })();
  const priceAvailable = hasPolicies || payment.price != null;
  const priceNotAvailable = !priceAvailable && payment.methods.length === 0;

  // 할인은 하나만 선택 가능 (패스 할인 or 쿠폰)
  const activeDiscounts: DiscountResponse[] | undefined = (() => {
    if (selectedCoupon) {
      return [{
        key: selectedCoupon.name,
        value: String(selectedCoupon.discountAmount),
        amount: selectedCoupon.discountAmount,
        type: 'Coupon',
        itemId: selectedCoupon.id,
      }];
    }
    if (selectedDiscount) {
      return [selectedDiscount];
    }
    return undefined;
  })();

  const totalDiscount = (activeDiscounts ?? []).reduce((sum, d) => sum + d.amount, 0);
  const totalPrice = Math.max(0, itemPrice - totalDiscount);

  // 번들 프로모션 — 원래 금액(bundle.originalPrice)이 판매가(itemPrice)보다 크면
  // 하단 결제정보에 "원래 금액"(찍찍 긋기) + "프로모션 할인" 항목으로 표시.
  // 표시 전용이라 API로 넘어가는 activeDiscounts에는 포함하지 않는다(이중 차감 방지).
  const bundlePromotion = (() => {
    if (type !== 'bundle') return null;
    const orig = payment.bundle?.originalPrice;
    if (orig == null || orig <= itemPrice) return null;
    return { originalPrice: orig, discount: orig - itemPrice };
  })();

  const displayOriginalPrice = bundlePromotion?.originalPrice ?? itemPrice;
  const displayDiscounts: DiscountResponse[] | undefined = bundlePromotion
    ? [
        {
          key: getLocaleString({ locale, key: 'promotion_discount' }),
          value: String(bundlePromotion.discount),
          amount: bundlePromotion.discount,
          type: 'Promotion',
          itemId: 0,
        },
        ...(activeDiscounts ?? []),
      ]
    : activeDiscounts;

  return (
    <div className={"flex flex-col"}>
      {/* 대리 결제 안내 배너 */}
      {isProxyPayment && (
        <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            📢 {payment.user?.name}{getLocaleString({ locale, key: 'proxy_payment_notice' })}
          </p>
        </div>
      )}

      {/* 수강 횟수 가격정책 선택 — 1회/4회/8회 등 옵션이 있을 때만 노출.
          "무엇을 사는지"가 정해져야 결제 금액이 확정되므로 결제수단보다 위에 온다. */}
      {hasPolicies && (
        <>
          <PricePolicySection
            locale={locale}
            policies={pricePolicies}
            selectedPolicyId={selectedPolicyId}
            onSelectPolicy={(policy) => setSelectedPolicyId(policy.id)}
          />
          {/* 첫 수업 시작일 안내 — 결제 화면에 띄운 회차(firstLessonId로 전송되는 그 회차)부터 계약이 잡힌다.
              date는 서버가 로케일 적용해 내려주는 표시 문자열 그대로. */}
          {payment.lesson?.date && (
            <div className="mx-6 mt-3 flex items-center gap-2.5 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#4F51D8]">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="text-[13px] font-semibold text-[#3F3FA8]">
                {getLocaleString({ locale, key: 'first_lesson_start_notice' }).replace('{date}', payment.lesson.date)}
              </span>
            </div>
          )}
          <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 정기결제 스페셜 섹션 — canSubscribe 상품에서만. 선택 시 구독 생성(POST /subscription) 경로 */}
      {canSubscribe && (
        <SubscriptionSection
          locale={locale}
          price={itemPrice}
          cycleSuffix={subscriptionCycle.suffix}
          cycleLabel={subscriptionCycle.label}
          cards={cards ?? []}
          onCardsChangeAction={(cards) => setCards(cards)}
          selectedBillingCard={selectedBillingCard}
          selectBillingCard={(card: GetBillingResponse) => setSelectedBillingCard(card)}
          selected={subscribeSelected}
          onSelectAction={() => {
            setSubscribeSelected(true);
            handleSelectMethod('billing');
          }}
        />
      )}

      {paymentMethods.length > 0 && (
        <>
          <PaymentMethodComponent
            locale={locale}
            passes={[]}
            cards={cards ?? []}
            onCardsChangeAction={(cards) => setCards(cards)}
            selectedPass={selectedPass}
            selectedBillingCard={selectedBillingCard}
            selectBillingCard={(card: GetBillingResponse) => setSelectedBillingCard(card)}
            selectPass={(pass: GetPassResponse) => setSelectedPass(pass)}
            paymentOptions={paymentMethods}
            selectedMethod={subscribeSelected ? undefined : selectedMethod}
            selectPaymentMethodAction={(m) => {
              // 일반 수단을 고르면 정기결제 모드 해제 (같은 billing이어도 단건 경로)
              setSubscribeSelected(false);
              handleSelectMethod(m);
            }}
            depositor={depositor}
            setDepositorAction={setDepositor}
            refundAccount={{
              holderName: payment.refundDepositor,
              bankName: payment.refundAccountBank,
              accountNumber: payment.refundAccountNumber
            }}

            os={os}
            appVersion={appVersion}
            titleOverride={
              payment.price == null
                ? getLocaleString({ locale, key: 'application_method' })
                // 정기결제 섹션이 따로 있으면 이 목록은 '일반결제' — 단건 경로임을 구분
                : canSubscribe
                  ? getLocaleString({ locale, key: 'regular_payment' })
                  : undefined
            }
          />

          <div className="mt-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 패스권 — 결제수단/할인과 같은 레벨의 별도 영역.
          methods에 'pass'가 활성이면 무조건 섹션 노출(passes 비어 있어도 안내 메시지 표시). */}
      {passMethodEnabled && (
        <>
          <PassesSection
            locale={locale}
            passes={availablePasses}
            selectedPass={selectedPass}
            onSelectPass={(pass) => {
              setSelectedPass(pass);
              setSelectedCoupon(undefined);
              if (!pass) {
                setSelectedDiscount(undefined);
                if (selectedMethod === 'pass') setSelectedMethod(fallbackMethod);
                return;
              }
              if (getPassDiscountRule(pass)) {
                // Discount 패스 — 결제수단은 일반 그대로 유지(pass였으면 fallback), 할인만 적용
                setSelectedDiscount(buildDiscountFromPass(pass));
                if (selectedMethod === 'pass') setSelectedMethod(fallbackMethod);
              } else {
                // FreeCount/Unlimited — use pass 흐름. selectedMethod='pass', 할인 없음.
                setSelectedMethod('pass');
                setSelectedDiscount(undefined);
              }
            }}
          />
          <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 할인 섹션 */}
      {!noPass && !priceNotAvailable && (
        <>
          <DiscountSection
            locale={locale}
            discounts={payment.discounts}
            coupons={payment.coupons}
            selectedCoupon={selectedCoupon}
            onSelectCoupon={setSelectedCoupon}
            selectedDiscount={selectedDiscount}
            onSelectDiscount={setSelectedDiscount}
          />
          <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 결제 정보 */}
      {priceAvailable && (
        <>
          <PurchaseInformation
            originalPrice={displayOriginalPrice}
            totalPrice={totalPrice}
            method={selectedMethod}
            titleResource={bundlePromotion ? 'original_price' : getTitleResource(type)}
            locale={locale}
            discounts={displayDiscounts}
            strikeOriginalPrice={!!bundlePromotion}
          />

          <div className="my-2 h-2 bg-[#F7F8F9]" />
        </>
      )}

      {priceNotAvailable && (
        <div className="px-6 py-8 text-center">
          <span className="text-[15px] text-[#85898C] font-medium">
            {type === 'practice-room'
              ? getLocaleString({ locale, key: 'practice_room_not_available' })
              : getLocaleString({ locale, key: 'no_available_payment_method' })}
          </span>
        </div>
      )}

      {priceAvailable && (
        <div className={`flex flex-col ${noPass ? 'gap-y-5' : 'space-y-4'} px-6 py-2`}>
          {/* 결제 유의사항 */}
          <div>
            <div className="font-medium text-[13px] text-[#999] mb-1.5">
              {getLocaleString({locale, key: 'payment_notice'})}
            </div>
            <div className="text-[12px] text-[#B0B3B8] font-medium leading-relaxed">
              • {getLocaleString({locale, key: 'apple_pay_domestic_only'})}
            </div>
            {type === 'pass-plan' && (
              <div className="text-[12px] text-[#B0B3B8] font-medium leading-relaxed">
                • {getLocaleString({locale, key: 'pass_plan_point_refund_notice'})}
              </div>
            )}
          </div>
          {/* 판매자 정보 */}
          {studio && <SellerInformation studio={studio} locale={locale}/>}
          {/* 환불 안내 — 대관(roomRefundDays 내려옴)이면 이용료 환불 기준 안내로 대체 */}
          <RefundInformation locale={locale} roomRefundDays={payment.roomRefundDays}/>
        </div>
      )}

      {/* 결제 버튼.
          - 기본(모바일/앱 웹뷰): full-width fixed bottom
          - buttonSlotId 지정(PC 폼): 우측 요약 카드 아래 슬롯으로 portal — 화면 하단 고정 아님.
            slot 노드를 찾기 전(첫 페인트)에는 잠깐 fixed로 렌더되지만 PC 인스턴스는 곧바로 이동한다. */}
      {(() => {
        // 버튼 비활성 사유 — 아래 disabled 식과 같은 순서로 첫 사유 하나만 (PC 웹 hover 툴팁용)
        const needMethod = type === 'practice-room' || totalPrice > 0;
        const disabledReason = selectedPolicy?.usable === false
          ? (selectedPolicy.reason ?? getLocaleString({locale, key: 'payment_disabled_policy_unusable'}))
          : priceNotAvailable
          ? getLocaleString({locale, key: 'payment_disabled_price_unavailable'})
          : (type === 'practice-room' && !practiceRoomInfo)
            ? getLocaleString({locale, key: 'payment_disabled_no_slot'})
            : (needMethod && !selectedMethod)
              ? getLocaleString({locale, key: 'payment_disabled_no_method'})
              : (selectedMethod === 'pass' && !selectedPass)
                ? getLocaleString({locale, key: 'payment_disabled_no_pass'})
                : (needMethod && selectedMethod === 'billing' && !selectedBillingCard?.billingKey)
                  ? getLocaleString({locale, key: 'payment_disabled_no_card'})
                  : undefined;
        const paymentButton = (
        <PaymentButton
          locale={locale}
          method={selectedMethod}
          appVersion={appVersion}
          selectedBilling={selectedBillingCard}
          selectedPass={selectedPass}
          selectedDiscounts={noPass ? undefined : activeDiscounts}
          type={selectedPolicy ? getPaymentType('lesson-group') : getPaymentType(type)}
          id={selectedPolicy ? selectedPolicy.id : getItemId(payment, type)}
          lessonId={payment.lesson?.id}
          price={priceAvailable ? totalPrice : null}
          title={getItemTitle(payment, type)}
          user={payment.user}
          depositor={depositor}
          disabled={
            selectedPolicy?.usable === false ||
            priceNotAvailable ||
            (type === 'practice-room' && !practiceRoomInfo) ||
            // 연습실은 서버가 총액을 나중에 계산해 totalPrice가 0일 수 있음 → 결제수단은 항상 필수
            (type === 'practice-room' && (
              !selectedMethod ||
              (selectedMethod === 'pass' && !selectedPass) ||
              (selectedMethod === 'billing' && !selectedBillingCard?.billingKey)
            )) ||
            (totalPrice > 0 && (
              !selectedMethod ||
              (selectedMethod === 'pass' && !selectedPass) ||
              (selectedMethod === 'billing' && !selectedBillingCard?.billingKey)
            )) ||
            (!priceAvailable && selectedMethod === 'pass' && !selectedPass)
          }
          // 정책을 고르면 그 정책의 결제 id로 결제한다 — 최상위 paymentId는 기본 정책의 것일 뿐이다
          disabledReason={disabledReason}
          paymentId={selectedPolicy?.paymentId ?? payment.paymentId}
          canSubscribe={subscribeSelected}
          subscriptionCycleLabel={subscriptionCycle.label}
          actualPayerUserId={noPass ? undefined : actualPayerUserId}
          hasRefundAccount={payment.refundAccountNumber != null && payment.refundAccountNumber.length > 0}
          onBillingCardsChange={(cards) => setCards(cards)}
          practiceRoomInfo={practiceRoomInfo}
        />
        );
        return buttonSlot
          ? createPortal(<div className="w-full">{paymentButton}</div>, buttonSlot)
          : <div className="fixed bottom-2 left-0 w-full px-6 z-30">{paymentButton}</div>;
      })()}
    </div>
  )
}
