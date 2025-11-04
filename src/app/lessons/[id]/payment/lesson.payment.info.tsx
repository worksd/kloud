'use client'

import PaymentButton from "@/app/lessons/[id]/payment/payment.button";
import { useEffect, useState } from "react";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { GetPaymentResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { Locale } from "@/shared/StringResource";

export const LessonPaymentInfo = ({payment, url, appVersion, locale, beforeDepositor}: {
  payment: GetPaymentResponse,
  url: string,
  appVersion: string,
  beforeDepositor: string,
  locale: Locale
}) => {
  const [cards, setCards] = useState<GetBillingResponse[]>(payment.cards ?? []);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(undefined);
  const [selectedPass, setSelectedPass] = useState<GetPassResponse | undefined>(
    payment.user.passes && payment.user.passes.length > 0 ? payment.user.passes[0] : undefined
  );
  const [selectedBillingCard, setSelectedBillingCard] = useState<GetBillingResponse | undefined>(
    payment.cards && payment.cards.length > 0 ? payment.cards[0] : undefined
  )
  const [depositor, setDepositor] = useState(beforeDepositor);

  const handleSelectMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
  }
  useEffect(() => {
    fetch('/api/cache/purge-lesson', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({lessonId: payment.lesson?.id}),
    })
  }, [payment])

  return (
    <div className={"flex flex-col"}>
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
            holderName: payment.user.refundAccountDepositor,
            bankName: payment.user.refundAccountBank,
            accountNumber: payment.user.refundAccountNumber
          }}
        />
      </div>

      <div className="py-5">
        <div className="w-full h-[1px] bg-[#F7F8F9] "/>
      </div>

      {/* 결제 정보 */}
      <PurchaseInformation price={payment.totalPrice} method={selectedMethod} titleResource={'lesson_price'}/>

      <div className="py-5">
        <div className="w-full h-3 bg-[#F7F8F9] "/>
      </div>

      <div className="flex flex-col px-6 space-y-4">
        {/* 판매자 정보 */}
        {payment.lesson?.studio && <SellerInformation studio={payment.lesson.studio}/>}
        {/* 환불 안내 */}
        <RefundInformation/>
      </div>

      <div className="left-0 w-full fixed bottom-6 px-6">
        <PaymentButton
          url={url}
          method={selectedMethod}
          appVersion={appVersion}
          selectedBilling={selectedBillingCard}
          selectedPass={selectedPass}
          type={{value: 'lesson', prefix: 'LT', apiValue: 'lesson'}}
          id={payment.lesson?.id ?? 0}
          price={payment.totalPrice}
          title={payment.lesson?.title ?? ''}
          user={payment.user}
          depositor={depositor}
          disabled={
            !selectedMethod ||
            (selectedMethod === 'pass' && !selectedPass)
          }
          paymentId={payment.paymentId}
        />
      </div>
    </div>
  )
}