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
import { KloudScreen } from "@/shared/kloud.screen";

export const LessonPaymentInfo = ({payment, os, appVersion}: { payment: GetPaymentResponse, os: string, appVersion: string }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(undefined);
  const [selectedPass, setSelectedPass] = useState<GetPassResponse | undefined>(
    payment.user.passes && payment.user.passes.length > 0 ? payment.user.passes[0] : undefined
  );
  const [selectedBillingCard, setSelectedBillingCard] = useState<GetBillingResponse | undefined>(
    payment.cards && payment.cards.length > 0 ? payment.cards[0] : undefined
  )
  const [depositor, setDepositor] = useState("");
  const [mounted, setMounted] = useState(false);

  const handleSelectMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
  }

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return;
  return (
    <div className={"flex flex-col"}>
      <div className="flex flex-col gap-y-4">
        <PaymentMethodComponent
          passes={payment.user.passes}
          cards={payment.cards}
          selectedPass={selectedPass}
          handleAddPaymentMethod={() => window.KloudEvent.showBottomSheet(KloudScreen.PaymentMethodAddSheet(KloudScreen.LessonPayment(payment.lesson?.id ?? 0)))}
          selectedBillingCard={selectedBillingCard}
          selectBillingCard={(card: GetBillingResponse) => setSelectedBillingCard(card)}
          selectPass={(pass: GetPassResponse) => setSelectedPass(pass)}
          paymentOptions={payment.methods}
          selectedMethod={selectedMethod}
          selectPaymentMethodAction={handleSelectMethod}
          depositor={depositor}
          setDepositorAction={setDepositor}/>
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

      <div className="left-0 w-full fixed bottom-2 px-6">
        <PaymentButton
          method={selectedMethod}
          os={os}
          appVersion={appVersion}
          selectedBilling={selectedBillingCard}
          selectedPass={selectedPass}
          type={{value: 'lesson', prefix: 'LT'}}
          id={payment.lesson?.id ?? 0}
          price={payment.totalPrice}
          title={payment.lesson?.title ?? ''}
          user={payment.user}
          depositor={depositor}
          disabled={selectedMethod == undefined}
          paymentId={payment.paymentId}
        />
      </div>
    </div>
  )
}