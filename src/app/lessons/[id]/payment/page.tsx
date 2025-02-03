import { notFound } from "next/navigation";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { Thumbnail } from "@/app/components/Thumbnail";
import { getPaymentDetail } from "@/app/lessons/[id]/payment/payment.detail.action";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import Image from "next/image";
import { formatDateTime } from "@/utils/date.format";
import React from "react";
import PaymentInfo from "@/app/lessons/[id]/payment/payment.info";


export default async function LessonPaymentPage({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string }>
}) {
  const lesson = await getPaymentDetail({id: (await params).id})

  if ('id' in lesson) {
    const formattedTime = formatDateTime(lesson?.startTime ?? '')
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
        {/* 백 헤더 */}
        <div className="flex justify-between items-center mb-14 px-6">
          <SimpleHeader title="결제하기"/>
        </div>

        <div className="flex flex-col">
          {/* 수업 정보 */}
          <div className="flex gap-4 w-full px-6 items-center">
            <Thumbnail url={lesson.thumbnailUrl ?? ''} width={86}
                       className="rounded-lg flex-shrink-0"/>

            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-base font-bold text-left text-[#131517] break-words">{lesson.title}</p>
              <div className="flex items-top gap-2">
                {lesson?.studio?.profileImageUrl && <Image
                  className="w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0"
                  src={lesson?.studio?.profileImageUrl}
                  alt={'로고 URL'}
                  width={20}
                  height={20}
                />}
                <div className={"flex flex-col items-start"}>
                  <span className="font-medium text-[14px] text-[#86898c]">
                    {lesson?.studio?.name}
                  </span>
                  <span className="font-medium text-[12px] text-[#86898C]">
                    {lesson?.room?.name}
                  </span>
                </div>
              </div>
              <div className={"flex flex-row items-center mb-1"}>
                <p className="text-[#86898C] text-[14px] font-medium">
                  `{formattedTime.date} ({formattedTime.dayOfWeek}) {formattedTime.time}`
                </p>
                <p className="text-[#86898C] text-[12px] font-medium">
                  /{lesson?.duration}분
                </p>
              </div>

            </div>
          </div>

          <div className="py-5">
            <div className="w-full h-3 bg-[#F7F8F9] "/>
          </div>

          <PaymentInfo os={(await searchParams).os} lesson={lesson}
                       userId={(await cookies()).get(userIdKey)?.value ?? ''}/>
        </div>
      </div>
    );
  } else {
    return notFound()
  }
}
