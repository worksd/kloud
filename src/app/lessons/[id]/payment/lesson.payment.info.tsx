'use client'

import PaymentButton from "@/app/lessons/[id]/payment/payment.button";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { useState } from "react";
import { isPastTime } from "@/app/lessons/[id]/time.util";
import { StringResourceKey } from "@/shared/StringResource";
import { PaymentMethod } from "@/app/passPlans/[id]/payment/PassPaymentInfo";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";

export const LessonPaymentInfo = ({lesson, os, userId}: { lesson: GetLessonResponse, os: string, userId: string }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("credit");
  const [depositor, setDepositor] = useState("");

  const paymentOptions: { id: PaymentMethod, label: StringResourceKey }[] = [
    {id: "credit", label: "credit_card"},
    {id: "account_transfer", label: "account_transfer"},
  ];

  return (
    <div className={"flex flex-col "}>

      <PaymentMethodComponent paymentOptions={paymentOptions} selectedMethod={selectedMethod}
                              selectPaymentMethodAction={setSelectedMethod} depositor={depositor}
                              setDepositorAction={setDepositor}/>

      <div className="py-5">
        <div className="w-full h-[1px] bg-[#F7F8F9] "/>
      </div>

      {/* 결제 정보 */}
      <PurchaseInformation price={lesson.price ?? 0} titleResource={'lesson_price'}/>


      <div className="py-5">
        <div className="w-full h-3 bg-[#F7F8F9] "/>
      </div>

      <div className="flex flex-col px-6 space-y-4">
        {/* 판매자 정보 */}
        {lesson.studio && <SellerInformation studio={lesson.studio}/>}
        {/* 환불 안내 */}
        <RefundInformation/>
      </div>

      <div className="px-6 mt-4 bottom-0 sticky">
        <PaymentButton
          method={selectedMethod}
          os={os}
          type={{value: 'lesson', prefix: 'LT'}}
          lessonId={lesson.id}
          price={lesson.price ?? 0}
          title={lesson.title ?? ''}
          userId={userId}
          depositor={depositor}
          disabled={isPastTime(lesson.startTime)}
        />
      </div>
    </div>
  )
}