'use client'

import DropdownDetails from "@/app/components/DropdownDetail";
import PaymentButton from "@/app/lessons/[id]/payment/payment.button";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { useEffect, useState } from "react";
import { isPastTime } from "@/app/lessons/[id]/time.util";
import { useLocale } from "@/hooks/useLocale";
import { StringResource, StringResourceKey } from "@/shared/StringResource";

const PaymentInfo = ({lesson, os, appVersion, userId}: { lesson: GetLessonResponse, os: string, appVersion: string, userId: string, }) => {
  const { t } = useLocale()
  const [selectedMethod, setSelectedMethod] = useState("credit_card");
  const [depositor, setDepositor] = useState("");
  const [mounted, setMounted] = useState(false);

  const paymentOptions: {id: string, label: StringResourceKey}[] = [
    { id: "credit", label: "credit_card" },
    { id: "bank", label: "account_transfer" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div>
      <div className="flex flex-col gap-y-4 px-6">
        <p className="text-base font-bold text-left text-black">{mounted ? t('payment_method') : ''}</p>
        {paymentOptions.map((option) => (
          <label
            key={option.id}
            className={`w-full flex items-center h-[52px] relative gap-2 pl-4 pr-2 py-2 rounded-lg border 
            ${selectedMethod === option.label ? "border-black bg-gray-100" : "border-gray-300"}
            cursor-pointer transition-all`}
          >
            <input
              type="checkbox"
              checked={selectedMethod === option.label}
              onChange={() => setSelectedMethod(option.label)}
              className="w-5 h-5 accent-black cursor-pointer"
            />
            <p className="flex-grow text-sm font-medium text-left text-black">
              {mounted ? t(option.label) : ''}
            </p>
          </label>
        ))}
      </div>

      {selectedMethod === 'account_transfer' &&
        <div className="flex flex-col space-y-3 p-4 text-black px-6">
          {/* 입력 필드 */}
          <div className="flex flex-col space-y-3 ">
            <label className="text-base text-left font-bold">
              {mounted ? t('depositor_name') : ''} <span className="text-[#E55B5B] text-[14px] font-medium">{mounted ? t('required') : ''}</span>
            </label>
            <input
              type="text"
              placeholder={mounted ? t('input_name_message') : ''}
              className="border border-gray-300 rounded-lg p-4 text-[14px] w-full disabled:bg-gray-100
             focus:border-black focus:text-black focus:outline-none"
              value={depositor}
              onChange={(e) => setDepositor(e.target.value)}
            />
          </div>
        </div>
      }

      <div className="py-5">
        <div className="w-full h-[1px] bg-[#F7F8F9] "/>
      </div>

      {/* 결제 정보 */}
      <div className="flex flex-col gap-y-4 px-6">
        <p className="text-base font-bold text-left text-black">{mounted ? t('payment_information') : ''}</p>

        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between text-sm font-medium text-center text-black">
            <p>{mounted ? t('lesson_price') : ''}</p>
            <p>{new Intl.NumberFormat("ko-KR").format(lesson.price ?? 0)} {mounted ? t('won') : ''}</p>
          </div>

          <div className="flex justify-between text-[10px] font-medium text-center text-[#86898c]">
            <p>{mounted ? t('one_ticket') : ''}</p>
            <p>{new Intl.NumberFormat("ko-KR").format(lesson.price ?? 0)} {mounted ? t('won') : ''}</p>
          </div>
        </div>

        <div className="w-full h-px bg-[#D7DADD]"/>

        <div className="flex justify-between text-base font-bold text-center text-black">
          <p>{mounted ? t('total_amount') : ''}</p>
          <p>{new Intl.NumberFormat("ko-KR").format(lesson.price ?? 0)} {mounted ? t('won') : ''}</p>
        </div>
      </div>

      <div className="py-5">
        <div className="w-full h-3 bg-[#F7F8F9] "/>
      </div>

      <div className="flex flex-col gap-y-5 px-6">
        {/* 판매자 정보 */}
        <DropdownDetails title={mounted ? t('seller_information') : ''}>
          <SellerInfoItem label={mounted ? t('business_name') : ''} value={lesson.studio?.businessName ?? ''}/>
          {lesson.studio?.businessRegistrationNumber &&
            <SellerInfoItem label={mounted ? t('business_registration_number') : ''} value={lesson.studio.businessRegistrationNumber}/>}
          {lesson.studio?.eCommerceRegNumber &&
            <SellerInfoItem label={mounted ? t('e_commerce_registration_number') : ''} value={lesson.studio.eCommerceRegNumber}/>}
          {lesson.studio?.representative && <SellerInfoItem label={mounted ? t('representative') : ''} value={lesson.studio.representative}/>}
          {lesson.studio?.educationOfficeRegNumber &&
            <SellerInfoItem label={mounted ? t('education_office_registration_number') : ''} value={lesson.studio.educationOfficeRegNumber}/>}
          {lesson.studio?.address && <SellerInfoItem label={mounted ? t('business_address'):'' } value={lesson.studio.address}/>}
        </DropdownDetails>

        {/* 환불 안내 */}
        <DropdownDetails title={mounted ? t('refund_information') : ''}>
          <div className="text-[#86898c] text-[12px] font-medium">
            <p className="pb-4">{mounted ? t('lesson_refund_message_1') : ''}</p>
            <p>{mounted ? t('lesson_refund_message_2') : ''}</p>
          </div>

          <div
            className="mt-10 text-center text-[#6b6e71] text-[10px] font-medium leading-[14px]">
            <p className="pb-4">{mounted ? t('lesson_refund_message_3') : ''}</p>
            <p>{mounted ? t('lesson_refund_message_4') : ''}</p>
            <p>{mounted ? t('lesson_refund_message_5') : ''}</p>
          </div>
        </DropdownDetails>
      </div>

      <div className="left-0 w-full h-fit fixed bottom-2 px-6">
        <PaymentButton
          method={selectedMethod}
          os={os}
          lessonId={lesson.id}
          appVersion={appVersion}
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

export function SellerInfoItem({label, value}: { label: string; value: string; }) {
  return <div className="self-stretch justify-start items-top inline-flex">
    <div className="w-[120px] text-[#86898c] text-[12px] font-medium leading-none">{label}</div>
    <div className="grow basis-0 text-black text-[12px] font-medium">
      {value}
    </div>
  </div>
}

export default PaymentInfo