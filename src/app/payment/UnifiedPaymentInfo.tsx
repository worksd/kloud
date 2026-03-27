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

type UnifiedPaymentType = 'lesson' | 'pass-plan' | 'lesson-group' | 'membership-plan';

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
  // TODO: 목 해제 — 서버에서 간편결제 타입이 내려오면 아래 mock 제거
  const mockPaymentMethods: GetPaymentMethodResponse[] = [
    ...payment.methods,
    { id: -903, type: 'naver_pay', name: '네이버페이' },
    { id: -904, type: 'kakao_pay', name: '카카오페이' },
    { id: -905, type: 'toss_pay', name: '토스페이' },
  ];

  const [cards, setCards] = useState<GetBillingResponse[]>(payment.cards ?? []);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(defaultMethod(type));
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
  const noPass = type === 'pass-plan' || type === 'membership-plan';

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

      {/* TODO: 목 해제 — mockPaymentMethods를 payment.methods로 원복 */}
      {mockPaymentMethods.length > 0 && payment.totalPrice > 0 && (
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
            paymentOptions={mockPaymentMethods}
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
          />

          <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 할인 섹션 */}
      {!noPass && (
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
      <PurchaseInformation
        originalPrice={payment.originalPrice}
        totalPrice={payment.totalPrice}
        method={noPass ? undefined : selectedMethod}
        titleResource={getTitleResource(type)}
        locale={locale}
        discounts={activeDiscounts}
      />

      <div className="my-2 h-2 bg-[#F7F8F9]" />

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
          price={payment.totalPrice}
          title={getItemTitle(payment, type)}
          user={payment.user}
          depositor={depositor}
          disabled={
            /* TODO: 목 해제 — mockPaymentMethods를 payment.methods로 원복 */
            mockPaymentMethods.length > 0 && (
              !selectedMethod ||
              (selectedMethod === 'pass' && !selectedPass) ||
              (selectedMethod === 'billing' && !selectedBillingCard?.billingKey)
            )
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
