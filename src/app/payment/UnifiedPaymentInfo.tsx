'use client'

import PaymentButton, { PaymentType } from "@/app/lessons/[id]/payment/payment.button";
import { useEffect, useState } from "react";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { GetPaymentResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type UnifiedPaymentType = 'lesson' | 'pass-plan' | 'lesson-group';

const getPaymentType = (type: UnifiedPaymentType): PaymentType => {
  switch (type) {
    case 'lesson':
      return { value: 'lesson', prefix: 'LT', apiValue: 'lesson' };
    case 'pass-plan':
      return { value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan' };
    case 'lesson-group':
      return { value: 'lessonGroup', prefix: 'LGT', apiValue: 'lesson-group' };
  }
}

const getTitleResource = (type: UnifiedPaymentType): StringResourceKey => {
  return type === 'pass-plan' ? 'pass_plan_price' : 'lesson_price';
}

const getItemId = (payment: GetPaymentResponse, type: UnifiedPaymentType): number => {
  switch (type) {
    case 'lesson':
      return payment.lesson?.id ?? 0;
    case 'pass-plan':
      return payment.passPlan?.id ?? 0;
    case 'lesson-group':
      return payment.lessonGroup?.id ?? 0;
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
  }
}

const getStudio = (payment: GetPaymentResponse, type: UnifiedPaymentType) => {
  switch (type) {
    case 'lesson':
      return payment.lesson?.studio;
    case 'pass-plan':
      return payment.passPlan?.studio;
    case 'lesson-group':
      return null; // lesson-group은 스튜디오 정보를 표시하지 않음
  }
}

export const UnifiedPaymentInfo = ({
  payment,
  type,
  url,
  appVersion,
  locale,
  beforeDepositor,
  actualPayerUserId,
  isProxyPayment
}: {
  payment: GetPaymentResponse,
  type: UnifiedPaymentType,
  url: string,
  appVersion: string,
  beforeDepositor: string,
  actualPayerUserId?: number,
  isProxyPayment?: boolean,
  locale: Locale
}) => {
  const [cards, setCards] = useState<GetBillingResponse[]>(payment.cards ?? []);
  // pass-plan만 초기값을 'credit'으로, 나머지는 undefined
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(
    type === 'pass-plan' ? 'credit' : undefined
  );
  const [selectedPass, setSelectedPass] = useState<GetPassResponse | undefined>(
    payment.user.passes && payment.user.passes.length > 0 ? payment.user.passes[0] : undefined
  );
  const [selectedBillingCard, setSelectedBillingCard] = useState<GetBillingResponse | undefined>(
    payment.cards && payment.cards.length > 0 ? payment.cards[0] : undefined
  );
  const [depositor, setDepositor] = useState(beforeDepositor);
  const [mounted, setMounted] = useState(false);

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

  // pass-plan은 mounted 체크
  if (type === 'pass-plan' && !mounted) return null;

  const studio = getStudio(payment, type);
  const buttonPositionClass = 'fixed bottom-2 left-0 w-full px-6';

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

      <div className="flex flex-col gap-y-4">
        <PaymentMethodComponent
          locale={locale}
          passes={payment.user.passes}
          cards={cards ?? []}
          onCardsChangeAction={(cards) => setCards(cards)}
          selectedPass={selectedPass}
          selectedBillingCard={selectedBillingCard}
          selectBillingCard={(card: GetBillingResponse) => setSelectedBillingCard(card)}
          selectPass={(pass: GetPassResponse) => setSelectedPass(pass)}
          paymentOptions={payment.methods}
          selectedMethod={selectedMethod}
          selectPaymentMethodAction={handleSelectMethod}
          depositor={depositor}
          setDepositorAction={setDepositor}
          refundAccount={{
            holderName: payment.refundAccountDepositor,
            bankName: payment.refundAccountBank,
            accountNumber: payment.refundAccountNumber
          }}
        />
      </div>

      <div className="py-5">
        <div className="w-full h-[1px] bg-[#F7F8F9] "/>
      </div>

      {/* 결제 정보 */}
      <PurchaseInformation
        originalPrice={payment.originalPrice}
        totalPrice={payment.totalPrice}
        method={type === 'pass-plan' ? undefined : selectedMethod}
        titleResource={getTitleResource(type)}
        locale={locale}
        discounts={payment.discounts}
      />

      <div className="py-5">
        <div className="w-full h-3 bg-[#F7F8F9] "/>
      </div>

      <div className={`flex flex-col ${type === 'pass-plan' ? 'gap-y-5' : 'space-y-4'} px-6`}>
        {/* 결제 유의사항 */}
        <div>
          <div className="font-medium text-[14px] text-black mb-2">
            {getLocaleString({locale, key: 'payment_notice'})}
          </div>
          <div className="text-[12px] text-[#86898c] font-medium leading-relaxed">
            • {getLocaleString({locale, key: 'apple_pay_domestic_only'})}
          </div>
        </div>
        {/* 판매자 정보 - lesson-group은 표시 안 함 */}
        {studio && <SellerInformation studio={studio} locale={locale}/>}
        {/* 환불 안내 */}
        <RefundInformation locale={locale}/>
      </div>

      <div className={buttonPositionClass}>
        <PaymentButton
          locale={locale}
          method={selectedMethod}
          appVersion={appVersion}
          selectedBilling={selectedBillingCard}
          selectedPass={type === 'pass-plan' ? undefined : selectedPass}
          selectedDiscounts={type === 'pass-plan' ? undefined : payment.discounts}
          type={getPaymentType(type)}
          id={getItemId(payment, type)}
          price={payment.totalPrice}
          title={getItemTitle(payment, type)}
          user={payment.user}
          depositor={depositor}
          disabled={
            payment.methods.length > 0 && (
              !selectedMethod ||
              (selectedMethod === 'pass' && !selectedPass)
            )
          }
          paymentId={payment.paymentId}
          actualPayerUserId={type === 'pass-plan' ? undefined : actualPayerUserId}
        />
      </div>
    </div>
  )
}
