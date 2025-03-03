import React from "react";
import { PassPaymentInfo } from "@/app/pass/[id]/payment/PassPaymentInfo";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import TicketIcon from "../../../../../public/assets/ic_ticket.svg";
import ArrowDownIcon from "../../../../../public/assets/arrow-down.svg"

export default async function PassPayment({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title={undefined}/>
      </div>
      <div className={"px-6"}>
        <div className={"text-[16px] text-black  font-medium"}>
          서울 댄스 스튜디오
        </div>
        <div className={"flex flex-row justify-between items-center"}>
          <div className={"flex flex-row items-center space-x-3"}>
            <div
              className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0 bg-[#F3F3F4] flex items-center justify-center my-5">
              <TicketIcon/>
            </div>
            <div className={"text-[16px] text-black font-medium"}>
              1 Class
            </div>
          </div>

          <ArrowDownIcon/>
        </div>

      </div>
      <div className="pb-5">
        <div className="w-full h-3 bg-[#F7F8F9] "/>
      </div>
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
        }} price={10000}/>

    </div>

  )
}