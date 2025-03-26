'use client'

import PaymentButton from "@/app/lessons/[id]/payment/payment.button";
import { useEffect, useMemo, useState } from "react";
import { isPastTime } from "@/app/lessons/[id]/time.util";
import { StringResourceKey } from "@/shared/StringResource";
import { PaymentMethod } from "@/app/passPlans/[id]/payment/PassPaymentInfo";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

export const LessonPaymentInfo = ({payment, os, appVersion}: { payment: GetPaymentResponse, os: string, appVersion: string }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("credit");
  const [selectedPass, setSelectedPass] = useState<GetPassResponse | undefined>(
    payment.user.passes && payment.user.passes.length > 0 ? payment.user.passes[0] : undefined
  );  const [depositor, setDepositor] = useState("");
  const [mounted, setMounted] = useState(false);

  const paymentOptions = useMemo(() => {
    const options: { id: PaymentMethod, label: StringResourceKey }[] = [];

    // 패스가 있을 때만 패스 결제 옵션 추가
    if (payment.user.passes && payment.user.passes.length > 0) {
      options.push({id: 'pass', label: 'my_pass'});
    }

    // 기본 결제 옵션 추가
    options.push(
      {id: "credit", label: "credit_card"},
      {id: "account_transfer", label: "account_transfer"}
    );

    return options;
  }, [payment.user.passes]);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return;
  return (
    <div className={"flex flex-col"}>
      <div className="flex flex-col gap-y-4">
        <PaymentMethodComponent
          passes={payment.user.passes}
          selectedPass={selectedPass}
          selectPass={(pass: GetPassResponse) => setSelectedPass(pass)}
          paymentOptions={paymentOptions}
          selectedMethod={selectedMethod}
          selectPaymentMethodAction={setSelectedMethod}
          depositor={depositor}
          setDepositorAction={setDepositor}/>
      </div>

      <div className="py-5">
        <div className="w-full h-[1px] bg-[#F7F8F9] "/>
      </div>

      {/* 결제 정보 */}
      <PurchaseInformation price={payment.totalPrice} titleResource={'lesson_price'}/>


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
          selectedPass={selectedPass}
          type={{value: 'lesson', prefix: 'LT'}}
          id={payment.lesson?.id ?? 0}
          price={payment.totalPrice}
          title={payment.lesson?.title ?? ''}
          userId={payment.user.id}
          depositor={depositor}
          disabled={isPastTime(payment.lesson?.startTime)}
        />
      </div>
    </div>
  )
}