'use client'
import { useEffect, useState } from "react";
import { StringResourceKey } from "@/shared/StringResource";
import PaymentButton from "@/app/lessons/[id]/payment/payment.button";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";

export type PaymentMethod = 'credit' | 'account_transfer' | 'pass'

export const PassPaymentInfo = ({payment, price, os, appVersion}: {
  payment: GetPaymentResponse,
  price: number,
  os: string,
  appVersion: string
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("credit");
  const [depositor, setDepositor] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const paymentOptions: { id: PaymentMethod, label: StringResourceKey }[] = [
    {id: "credit", label: "credit_card"},
    {id: "account_transfer", label: "account_transfer"},
  ];

  if (!mounted) return;

  return (
    <div className={"flex flex-col justify-between"}>
      <PaymentMethodComponent
        paymentOptions={paymentOptions}
        selectedMethod={selectedMethod}
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
                       method={selectedMethod} depositor={depositor} userId={payment.user.id}/>
      </div>
    </div>
  )
}