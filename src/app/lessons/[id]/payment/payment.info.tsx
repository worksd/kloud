'use client'

import DropdownDetails from "@/app/components/DropdownDetail";
import PaymentButton from "@/app/lessons/[id]/payment/payment.button";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { useState } from "react";
import { isPastTime } from "@/app/lessons/[id]/time.util";

const PaymentInfo = ({lesson, os, appVersion, userId}: { lesson: GetLessonResponse, os: string, appVersion: string, userId: string, }) => {
  const [selectedMethod, setSelectedMethod] = useState("신용카드");
  const [depositor, setDepositor] = useState("");

  const paymentOptions = [
    { id: "credit", label: "신용카드" },
    { id: "bank", label: "계좌이체" },
  ];
  return (
    <div>
      <div className="flex flex-col gap-y-4 px-6">
        <p className="text-base font-bold text-left text-black">결제 수단</p>
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
              {option.label}
            </p>
          </label>
        ))}
      </div>

      {selectedMethod === '계좌이체' &&
        <div className="flex flex-col space-y-3 p-4 text-black px-6">
          {/* 입력 필드 */}
          <div className="flex flex-col space-y-3 ">
            <label className="text-base text-left font-bold">
              입금자명 <span className="text-[#E55B5B] text-[14px] font-medium">필수</span>
            </label>
            <input
              type="text"
              placeholder="이름을 입력해 주세요"
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
        <p className="text-base font-bold text-left text-black">결제 정보</p>

        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between text-sm font-medium text-center text-black">
            <p>수강권 금액</p>
            <p>{new Intl.NumberFormat("ko-KR").format(lesson.price ?? 0)}원</p>
          </div>

          <div className="flex justify-between text-[10px] font-medium text-center text-[#86898c]">
            <p>1회 수업권</p>
            <p>{new Intl.NumberFormat("ko-KR").format(lesson.price ?? 0)}원</p>
          </div>
        </div>

        <div className="w-full h-px bg-[#D7DADD]"/>

        <div className="flex justify-between text-base font-bold text-center text-black">
          <p>총 결제 금액</p>
          <p>{new Intl.NumberFormat("ko-KR").format(lesson.price ?? 0)}원</p>
        </div>
      </div>

      <div className="py-5">
        <div className="w-full h-3 bg-[#F7F8F9] "/>
      </div>

      <div className="flex flex-col gap-y-5 px-6">
        {/* 판매자 정보 */}
        <DropdownDetails title="판매자 정보">
          <SellerInfoItem label="사업자명" value={lesson.studio?.businessName ?? ''}/>
          {lesson.studio?.businessRegistrationNumber &&
            <SellerInfoItem label="사업자번호" value={lesson.studio.businessRegistrationNumber}/>}
          {lesson.studio?.eCommerceRegNumber &&
            <SellerInfoItem label="통신판매업 신고번호" value={lesson.studio.eCommerceRegNumber}/>}
          {lesson.studio?.representative && <SellerInfoItem label="대표자명" value={lesson.studio.representative}/>}
          {lesson.studio?.educationOfficeRegNumber &&
            <SellerInfoItem label="교육청 등록번호" value={lesson.studio.educationOfficeRegNumber}/>}
          {lesson.studio?.address && <SellerInfoItem label={"사업자소재지"} value={lesson.studio.address}/>}
        </DropdownDetails>

        {/* 환불 안내 */}
        <DropdownDetails title="환불 안내">
          <div className="text-[#86898c] text-[12px] font-medium">
            <p className="pb-4">수강료 환불은 학원의 설립 및 과외교습에 관한 법률 시행령 제18조 제3항 별표 4에 의거 진행됩니다.</p>
            <p>다만, 입점사별로 환불정책이 다를 경우 입점사의 환불 정책에 따라 환불이 진행됩니다.</p>
          </div>

          <div
            className="mt-10 text-center text-[#6b6e71] text-[10px] font-medium leading-[14px]">
            <p className="pb-4">본 주문 내용 및 약관 내용을 확인하였으며, 예약에 동의합니다.</p>
            <p>로우그래피(주)는 통신판매중개자이며, 통신판매의 당사자가 아닙니다.</p>
            <p>상품, 상품 정보, 거래, 이용에 관한 의무와 책임은 판매자에게 있습니다.</p>
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

function SellerInfoItem({label, value}: { label: string; value: string; }) {
  return <div className="self-stretch justify-start items-top inline-flex">
    <div className="w-[120px] text-[#86898c] text-[12px] font-medium leading-none">{label}</div>
    <div className="grow basis-0 text-black text-[12px] font-medium">
      {value}
    </div>
  </div>
}

export default PaymentInfo