import { notFound } from "next/navigation";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { Thumbnail } from "@/app/components/Thumbnail";
import { getLessonPaymentAction } from "@/app/lessons/[id]/payment/payment.detail.action";
import { cookies } from "next/headers";
import { accessTokenKey, depositorKey, userIdKey } from "@/shared/cookies.key";
import React from "react";
import { LessonPaymentInfo } from "@/app/lessons/[id]/payment/lesson.payment.info";
import { CircleImage } from "@/app/components/CircleImage";
import { translate } from "@/utils/translate";
import { MobileWebViewTopBar } from "@/app/components/MobileWebViewTopBar";
import { KloudScreen } from "@/shared/kloud.screen";
import { revalidateTag } from "next/cache";

export default async function LessonPaymentPage({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const { id } = await params
  const { appVersion, os } = await searchParams
  const res = await getLessonPaymentAction({id: id})
  if ('user' in res) {
    if (res.lesson?.status != '예약 중' && res.lesson?.status != '선예약 중') {
      return <div className="flex items-center justify-center p-4 text-black">예약 중인 수업이 아닙니다.</div>
    }
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
        {/* 백 헤더 */}

        {appVersion == '' &&
          <MobileWebViewTopBar
            os={os}
            isLogin={(await cookies()).get(accessTokenKey)?.value != undefined}
            returnUrl={KloudScreen.LessonPayment(id)}
          />}

        <div className="flex flex-col">
          {/* 수업 정보 */}
          <div className="flex gap-4 w-full px-6 items-center">
            <Thumbnail url={res.lesson?.thumbnailUrl ?? ''} width={86}
                       className="rounded-lg flex-shrink-0"/>

            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-base font-bold text-left text-[#131517] break-words">{res.lesson?.title}</p>
              <div className="flex items-top gap-2">
                {res.lesson?.studio?.profileImageUrl && <CircleImage size={20} imageUrl={res.lesson.studio.profileImageUrl}/>}
                <div className={"flex flex-col items-start"}>
                  <span className="font-medium text-[14px] text-[#86898c]">
                    {res.lesson?.studio?.name}
                  </span>
                  <span className="font-medium text-[12px] text-[#86898C]">
                    {res.lesson?.room?.name}
                  </span>
                </div>
              </div>
              <div className={"flex flex-row items-center mb-1"}>
                <p className="text-[#86898C] text-[14px] font-medium">{res.lesson.date}</p>
                <p className="text-[#86898C] text-[12px] font-medium">
                  /{res.lesson?.duration} {await translate('minutes')}
                </p>
              </div>

            </div>
          </div>

          <div className="py-5">
            <div className="w-full h-3 bg-[#F7F8F9] "/>
          </div>

          <LessonPaymentInfo
            url={process.env.GUINNESS_API_SERVER ?? ''}
            appVersion={appVersion}
            payment={res}
            beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
          />
        </div>
      </div>
    );
  } else {
    return notFound()
  }
}
