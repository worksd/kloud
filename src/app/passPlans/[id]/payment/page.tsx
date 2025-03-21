import React from "react";
import { PassPaymentInfo } from "@/app/passPlans/[id]/payment/PassPaymentInfo";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { CurrentPassPlan } from "@/app/passPlans/[id]/payment/CurrentPassPlan";

export default async function PassPayment({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  // API 나오면 작업하기
  return (
    <div>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource={'purchase_pass_title'}/>
      </div>
      <CurrentPassPlan/>
      <div className="w-full h-3 bg-[#F7F8F9] mb-5"/>
      <PassPaymentInfo studio={
        {
          id: 14,
          name: "서울 댄스 스튜디오",
          address: "서울특별시 강남구 테헤란로 123",
          roadAddress: "서울특별시 강남구 테헤란로 123",
          profileImageUrl: "https://via.placeholder.com/150",
          coverImageUrl: "https://via.placeholder.com/600x300",
          phone: "010-1234-5678",
          youtubeUrl: "https://youtube.com/@seouldance",
          businessName: "서울 댄스 스튜디오",
          bank: "국민은행",
          accountNumber: "123-45-67890",
          businessRegistrationNumber: "123-45-67890",
          eCommerceRegNumber: "제2024-서울강남-1234호",
          educationOfficeRegNumber: "서울교육청 제2024-001호",
        }} price={10000} os={(await searchParams).os}/>

    </div>

  )
}