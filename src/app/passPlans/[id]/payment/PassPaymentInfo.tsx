'use client'
import { useEffect, useState } from "react";
import PaymentButton from "@/app/lessons/[id]/payment/payment.button";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { GetPaymentResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";

export const PassPaymentInfo = ({payment, price, os, appVersion}: {
  payment: GetPaymentResponse,
  price: number,
  os: string,
  appVersion: string
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("credit");
  const [depositor, setDepositor] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selectedBillingCard, setSelectedBillingCard] = useState<GetBillingResponse | undefined>(
    payment.cards && payment.cards.length > 0 ? payment.cards[0] : undefined
  )
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;

  return (
    <div className={"flex flex-col justify-between"}>
      <PaymentMethodComponent
        paymentOptions={payment.methods}
        cards={payment.cards}
        selectedMethod={selectedMethod}
        selectedBillingCard={selectedBillingCard}
        selectBillingCard={(card: GetBillingResponse) => setSelectedBillingCard(card)}
        selectPaymentMethodAction={setSelectedMethod}
        depositor={depositor}
        setDepositorAction={setDepositor}
      />

      <div className="py-5">
        <div className="w-full h-[1px] bg-[#F7F8F9] "/>
      </div>

      <PurchaseInformation price={price} titleResource={'pass_plan_price'}/>

      <div className="py-5">
        <div className="w-full h-3 bg-[#F7F8F9] "/>
      </div>

      <div className="flex flex-col gap-y-5 px-6">
        {/* 판매자 정보 */}
        {payment.passPlan?.studio && <SellerInformation studio={payment.passPlan.studio}/>}

        {/* 환불 안내 */}
        <RefundInformation/>
      </div>


      <div className="px-6 mt-4 bottom-0 sticky">
        <PaymentButton type={{value: 'passPlan', prefix: 'LP'}} os={os} title={payment.passPlan?.name ?? ''}
                       price={price}
                       id={payment.passPlan?.id ?? 0}
                       disabled={false}
                       appVersion={appVersion}
                       method={selectedMethod}
                       depositor={depositor}
                       user={payment.user}
                       selectedBilling={selectedBillingCard}
                       paymentId={payment.paymentId}/>
      </div>
    </div>
  )
}