import { notFound } from "next/navigation";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { Thumbnail } from "@/app/components/Thumbnail";
import { getPaymentDetail } from "@/app/lessons/[id]/payment/payment.detail.action";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import React from "react";
import { FormattedDate } from "@/app/lessons/[id]/payment/FormattedDate";
import { LessonPaymentInfo } from "@/app/lessons/[id]/payment/lesson.payment.info";
import { CircleImage } from "@/app/components/CircleImage";
import { translate } from "@/utils/translate";

export default async function LessonPaymentPage({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const lesson = await getPaymentDetail({id: (await params).id})

  if ('id' in lesson) {
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
        {/* 백 헤더 */}
        <div className="flex justify-between items-center mb-14 px-6">
          <SimpleHeader titleResource="payment"/>
        </div>

        <div className="flex flex-col">
          {/* 수업 정보 */}
          <div className="flex gap-4 w-full px-6 items-center">
            <Thumbnail url={lesson.thumbnailUrl ?? ''} width={86}
                       className="rounded-lg flex-shrink-0"/>

            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-base font-bold text-left text-[#131517] break-words">{lesson.title}</p>
              <div className="flex items-top gap-2">
                {lesson?.studio?.profileImageUrl && <CircleImage size={20} imageUrl={lesson.studio.profileImageUrl}/>}
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
                <FormattedDate startTime={lesson.startTime ?? ''}/>
                <p className="text-[#86898C] text-[12px] font-medium">
                  /{lesson?.duration} {await translate('minutes')}
                </p>
              </div>

            </div>
          </div>

          <div className="py-5">
            <div className="w-full h-3 bg-[#F7F8F9] "/>
          </div>

          <LessonPaymentInfo
            os={(await searchParams).os}
            lesson={lesson}
            userId={(await cookies()).get(userIdKey)?.value ?? ''}
          />
        </div>
      </div>
    );
  } else {
    return notFound()
  }
}
