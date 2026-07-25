'use client'

import PaymentButton, { PaymentType } from "@/app/lessons/[id]/payment/payment.button";
import { useEffect, useState } from "react";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { DiscountSection } from "@/app/lessons/[id]/payment/DiscountSection";
import { PassesSection } from "@/app/payment/PassesSection";
import { CouponResponse, DiscountResponse, GetPaymentMethodResponse, GetPaymentResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type UnifiedPaymentType = 'lesson' | 'pass-plan' | 'lesson-group' | 'practice-room' | 'bundle';

const getPaymentType = (type: UnifiedPaymentType): PaymentType => {
  switch (type) {
    case 'lesson':
      return { value: 'lesson', prefix: 'LT', apiValue: 'lesson' };
    case 'pass-plan':
      return { value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan' };
    case 'lesson-group':
      return { value: 'lessonGroup', prefix: 'LGT', apiValue: 'lesson-group' };
    case 'practice-room':
      return { value: 'practiceRoom', prefix: 'PR', apiValue: 'practice-room' };
    case 'bundle':
      return { value: 'bundle', prefix: 'BD', apiValue: 'bundle' };
  }
}

const getTitleResource = (type: UnifiedPaymentType): StringResourceKey => {
  if (type === 'pass-plan') return 'pass_plan_price';
  if (type === 'bundle') return 'promotion_price';
  return 'lesson_price';
}

const getItemId = (payment: GetPaymentResponse, type: UnifiedPaymentType): number => {
  switch (type) {
    case 'lesson':
      return payment.lesson?.id ?? 0;
    case 'pass-plan':
      return payment.passPlan?.id ?? 0;
    case 'lesson-group':
      return payment.lessonGroup?.id ?? 0;
    case 'practice-room':
      return payment.studioRoom?.id ?? 0;
    case 'bundle':
      return payment.bundle?.id ?? 0;
  }
}

const getItemTitle = (payment: GetPaymentResponse, type: UnifiedPaymentType): string => {
  switch (type) {
    case 'lesson':
      return payment.lesson?.title ?? '';
    case 'pass-plan':
      return payment.passPlan?.name ?? '';
    case 'lesson-group':
      return payment.lessonGroup?.title ?? '';
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
      return payment.lesson?.price ?? 0;
    case 'pass-plan':
      return payment.passPlan?.price ?? 0;
    case 'lesson-group':
      return payment.lessonGroup?.price ?? 0;
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
    case 'lesson-group':
      return null;
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
  layout = 'mobile',
  detailsSlot,
}: {
  payment: GetPaymentResponse,
  type: UnifiedPaymentType,
  url: string,
  appVersion: string,
  os?: string,
  beforeDepositor: string,
  actualPayerUserId?: number,
  isProxyPayment?: boolean,
  /** 'pc'면 2열로 — 좌: 상품 상세(detailsSlot) + 결제수단/패스권/할인, 우(sticky): 결제 정보 + 결제 버튼 */
  layout?: 'mobile' | 'pc',
  /** PC 레이아웃에서 좌측 최상단에 놓을 상품 상세 영역 (서버 컴포넌트에서 렌더해 전달) */
  detailsSlot?: React.ReactNode,
  locale: Locale,
  practiceRoomInfo?: { studioRoomId: number; startDate: string; endDate: string },
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (needsMountCheck(type) && !mounted) return null;

  const studio = getStudio(payment, type);
  const noPass = type === 'pass-plan' || type === 'practice-room';
  const itemPrice = getItemPrice(payment, type);
  const priceNotAvailable = payment.price == null && payment.methods.length === 0;

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

  // 섹션 조각 — 모바일은 한 줄로, PC는 '결제 정보 + 결제 버튼'만 우측 sticky 카드로 분리한다.
  const sectionsAbove = (
    <>
      {/* 대리 결제 안내 배너 */}
      {isProxyPayment && (
        <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            📢 {payment.user?.name}{getLocaleString({ locale, key: 'proxy_payment_notice' })}
          </p>
        </div>
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
            selectedMethod={selectedMethod}
            selectPaymentMethodAction={handleSelectMethod}
            depositor={depositor}
            setDepositorAction={setDepositor}
            refundAccount={{
              holderName: payment.refundDepositor,
              bankName: payment.refundAccountBank,
              accountNumber: payment.refundAccountNumber
            }}

            os={os}
            appVersion={appVersion}
            titleOverride={payment.price == null ? getLocaleString({ locale, key: 'application_method' }) : undefined}
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
    </>
  );
  const purchaseInfoBlock = (
    <>
      {/* 결제 정보 */}
      {payment.price != null && (
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

          {layout !== 'pc' && <div className="my-2 h-2 bg-[#F7F8F9]" />}
        </>
      )}
    </>
  );
  const sectionsBelow = (
    <>
      {priceNotAvailable && (
        <div className="px-6 py-8 text-center">
          <span className="text-[15px] text-[#85898C] font-medium">
            {type === 'practice-room'
              ? getLocaleString({ locale, key: 'practice_room_not_available' })
              : getLocaleString({ locale, key: 'no_available_payment_method' })}
          </span>
        </div>
      )}

      {payment.price != null && (
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
          {/* 판매자 정보 - lesson-group은 표시 안 함 */}
          {studio && <SellerInformation studio={studio} locale={locale}/>}
          {/* 환불 안내 */}
          <RefundInformation locale={locale}/>
        </div>
      )}
    </>
  );
  const ctaBlock = (
    <>
      {/* 결제 버튼 — 모바일은 화면 하단 고정, PC는 결제 정보 아래 인라인 */}
      <div className={layout === 'pc'
        ? 'px-6 pt-4 pb-2'
        // 좁은 웹/앱 웹뷰는 하단 고정. 태블릿급 폭에서는 버튼이 과하게 늘어나지 않게 가운데 정렬 + 폭 제한.
        : 'fixed bottom-2 left-0 w-full px-6 md:left-1/2 md:-translate-x-1/2 md:max-w-[560px]'}>
        <PaymentButton
          locale={locale}
          method={selectedMethod}
          appVersion={appVersion}
          selectedBilling={selectedBillingCard}
          selectedPass={selectedPass}
          selectedDiscounts={noPass ? undefined : activeDiscounts}
          type={getPaymentType(type)}
          id={getItemId(payment, type)}
          price={payment.price != null ? totalPrice : null}
          title={getItemTitle(payment, type)}
          user={payment.user}
          depositor={depositor}
          disabled={
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
            (payment.price == null && selectedMethod === 'pass' && !selectedPass)
          }
          paymentId={payment.paymentId}
          actualPayerUserId={noPass ? undefined : actualPayerUserId}
          hasRefundAccount={payment.refundAccountNumber != null && payment.refundAccountNumber.length > 0}
          onBillingCardsChange={(cards) => setCards(cards)}
          practiceRoomInfo={practiceRoomInfo}
        />
      </div>
    </>
  );

  // PC — 좌: 상품 상세 + 결제수단/패스권/할인/유의사항(카드), 우(sticky): 결제 정보 + 결제 버튼
  if (layout === 'pc') {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-x-10 items-start">
        <div className="col-start-1 row-start-1 flex flex-col min-w-0">
          {detailsSlot}
          {/* 결제수단·패스권·할인·유의사항 — 한 장의 카드로 묶어 문서처럼 보이지 않게 */}
          <div className="rounded-3xl border border-[#F0F1F3] bg-white py-5">
            {sectionsAbove}
            {sectionsBelow}
          </div>
        </div>
        <aside className="col-start-2 row-start-1 sticky top-8 self-start">
          <div className="rounded-3xl border border-[#F0F1F3] bg-white shadow-[0_8px_24px_rgba(20,23,28,0.06)] flex flex-col py-4">
            {purchaseInfoBlock}
            {ctaBlock}
            {/* 버튼이 비활성인 이유를 바로 알려준다 — PC는 하단 고정 CTA가 없어 원인을 놓치기 쉬움 */}
            {!priceNotAvailable && totalPrice > 0 && !selectedMethod && (
              <p className="px-6 pt-1 text-[12px] font-medium text-[#E08A1E]">
                {getLocaleString({ locale, key: 'payment_select_method_hint' })}
              </p>
            )}
            {/* PC는 하단 고정 버튼이 없어 결제 직전 안내를 버튼 아래에 둔다 */}
            <p className="px-6 pt-1.5 text-[11px] leading-relaxed text-[#B0B3B8]">
              {getLocaleString({ locale, key: 'apple_pay_domestic_only' })}
            </p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className={"flex flex-col"}>
      {sectionsAbove}
      {purchaseInfoBlock}
      {sectionsBelow}
      {ctaBlock}
    </div>
  )
}
