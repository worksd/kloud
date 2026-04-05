'use client'

import PaymentButton, { PaymentType } from "@/app/lessons/[id]/payment/payment.button";
import { useEffect, useState } from "react";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { DiscountSection } from "@/app/lessons/[id]/payment/DiscountSection";
import { CouponResponse, DiscountResponse, GetPaymentMethodResponse, GetPaymentResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type UnifiedPaymentType = 'lesson' | 'pass-plan' | 'lesson-group' | 'membership-plan' | 'practice-room';

const getPaymentType = (type: UnifiedPaymentType): PaymentType => {
  switch (type) {
    case 'lesson':
      return { value: 'lesson', prefix: 'LT', apiValue: 'lesson' };
    case 'pass-plan':
      return { value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan' };
    case 'lesson-group':
      return { value: 'lessonGroup', prefix: 'LGT', apiValue: 'lesson-group' };
    case 'membership-plan':
      return { value: 'membershipPlan', prefix: 'SM', apiValue: 'membership-plan' };
    case 'practice-room':
      return { value: 'practiceRoom', prefix: 'PR', apiValue: 'practice-room' };
  }
}

const getTitleResource = (type: UnifiedPaymentType): StringResourceKey => {
  return (type === 'pass-plan' || type === 'membership-plan') ? 'pass_plan_price' : 'lesson_price';
}

const getItemId = (payment: GetPaymentResponse, type: UnifiedPaymentType): number => {
  switch (type) {
    case 'lesson':
      return payment.lesson?.id ?? 0;
    case 'pass-plan':
      return payment.passPlan?.id ?? 0;
    case 'lesson-group':
      return payment.lessonGroup?.id ?? 0;
    case 'membership-plan':
      return payment.membershipPlan?.id ?? payment.passPlan?.id ?? 0;
    case 'practice-room':
      return 0;
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
    case 'membership-plan':
      return payment.membershipPlan?.name ?? '';
    case 'practice-room':
      return payment.studioRoom?.name ?? '';
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
    case 'membership-plan':
      return payment.membershipPlan?.price ?? 0;
    case 'practice-room':
      return payment.price ?? payment.studioRoom?.hourlyPrice ?? 0;
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
    case 'membership-plan':
      return payment.membershipPlan?.studio ?? payment.passPlan?.studio ?? null;
  }
}

const needsMountCheck = (type: UnifiedPaymentType) =>
  type === 'pass-plan' || type === 'membership-plan';

const defaultMethod = (type: UnifiedPaymentType): PaymentMethodType | undefined =>
  (type === 'pass-plan' || type === 'membership-plan') ? 'credit' : undefined;

export const UnifiedPaymentInfo = ({
  payment,
  type,
  url,
  appVersion,
  os,
  locale,
  beforeDepositor,
  actualPayerUserId,
  isProxyPayment
}: {
  payment: GetPaymentResponse,
  type: UnifiedPaymentType,
  url: string,
  appVersion: string,
  os?: string,
  beforeDepositor: string,
  actualPayerUserId?: number,
  isProxyPayment?: boolean,
  locale: Locale
}) => {
  // easy_pay의 providers를 개별 메서드로 풀어서 사용
  const easyPayLabel: Record<string, string> = {
    naver_pay: getLocaleString({ locale, key: 'naver_pay' }),
    kakao_pay: getLocaleString({ locale, key: 'kakao_pay' }),
    toss_pay: getLocaleString({ locale, key: 'toss_pay' }),
  };
  const paymentMethods: GetPaymentMethodResponse[] = payment.methods.flatMap(m => {
    if (m.type === 'easy_pay' && m.providers && m.providers.length > 0) {
      return m.providers.map((p, i) => ({ id: m.id * -100 - i, type: p, name: easyPayLabel[p] ?? p }));
    }
    return [m];
  });

  const [cards, setCards] = useState<GetBillingResponse[]>(payment.cards ?? []);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(
    defaultMethod(type) ?? (paymentMethods.length > 0 ? paymentMethods[0].type : undefined)
  );
  const [selectedPass, setSelectedPass] = useState<GetPassResponse | undefined>(
    payment.user.passes?.find(p => p.usable)
  );
  const [selectedBillingCard, setSelectedBillingCard] = useState<GetBillingResponse | undefined>(
    payment.cards && payment.cards.length > 0 ? payment.cards[0] : undefined
  );
  const [depositor, setDepositor] = useState(beforeDepositor);
  const [mounted, setMounted] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponResponse | undefined>(undefined);

  const handleSelectMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // lesson만 캐시 무효화
  useEffect(() => {
    if (type === 'lesson') {
      fetch('/api/cache/purge-lesson', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lessonId: payment.lesson?.id }),
      })
    }
  }, [payment, type])

  if (needsMountCheck(type) && !mounted) return null;

  const studio = getStudio(payment, type);
  const noPass = type === 'pass-plan' || type === 'membership-plan' || type === 'practice-room';
  const itemPrice = getItemPrice(payment, type);
  const priceNotAvailable = payment.price == null && payment.methods.length === 0;

  // 쿠폰 선택 시 Pass 타입 할인 제외, 쿠폰 할인 적용
  const activeDiscounts = (() => {
    if (selectedCoupon) {
      const couponDiscount: DiscountResponse = {
        key: selectedCoupon.name,
        value: String(selectedCoupon.discountAmount),
        amount: selectedCoupon.discountAmount,
        type: 'Coupon',
        itemId: selectedCoupon.id,
      };
      const nonPassDiscounts = (payment.discounts ?? []).filter(d => d.type !== 'Pass');
      return [...nonPassDiscounts, couponDiscount];
    }
    return payment.discounts;
  })();

  const totalDiscount = (activeDiscounts ?? []).reduce((sum, d) => sum + d.amount, 0);
  const totalPrice = Math.max(0, itemPrice - totalDiscount);

  return (
    <div className={"flex flex-col"}>
      {/* 대리 결제 안내 배너 */}
      {isProxyPayment && (
        <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            📢 {payment.user.name}님의 대리 결제 페이지입니다
          </p>
        </div>
      )}

      {paymentMethods.length > 0 && (
        <>
          <PaymentMethodComponent
            locale={locale}
            passes={payment.user.passes}
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
          />
          <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 결제 정보 */}
      {payment.price != null && (
        <>
          <PurchaseInformation
            originalPrice={itemPrice}
            totalPrice={totalPrice}
            method={noPass ? undefined : selectedMethod}
            titleResource={getTitleResource(type)}
            locale={locale}
            discounts={activeDiscounts}
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
          </div>
          {/* 판매자 정보 - lesson-group은 표시 안 함 */}
          {studio && <SellerInformation studio={studio} locale={locale}/>}
          {/* 환불 안내 */}
          <RefundInformation locale={locale}/>
        </div>
      )}

      <div className="fixed bottom-2 left-0 w-full px-6">
        <PaymentButton
          locale={locale}
          method={selectedMethod}
          appVersion={appVersion}
          selectedBilling={selectedBillingCard}
          selectedPass={noPass ? undefined : selectedPass}
          selectedDiscounts={noPass ? undefined : activeDiscounts}
          type={getPaymentType(type)}
          id={getItemId(payment, type)}
          price={payment.price != null ? totalPrice : null}
          title={getItemTitle(payment, type)}
          user={payment.user}
          depositor={depositor}
          disabled={
            priceNotAvailable ||
            (paymentMethods.length > 0 && (
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
        />
      </div>
    </div>
  )
}
