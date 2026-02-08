import {notFound} from "next/navigation";
import {Thumbnail} from "@/app/components/Thumbnail";
import {getLessonGroupPaymentAction} from "@/app/lesson-groups/[id]/payment/payment.detail.action";
import {cookies} from "next/headers";
import {depositorKey, userIdKey} from "@/shared/cookies.key";
import React from "react";
import {LessonGroupPaymentInfo} from "@/app/lesson-groups/[id]/payment/lesson-group.payment.info";
import {CircleImage} from "@/app/components/CircleImage";
import {getLocale} from "@/utils/translate";

export default async function LessonGroupPaymentPage({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string, targetUserId?: number }>
}) {
  const {id} = await params
  const {appVersion, targetUserId} = await searchParams
  const res = await getLessonGroupPaymentAction({id: id, targetUserId})
  const cookieValue = (await cookies()).get(userIdKey)?.value;
  const actualPayerUserId = cookieValue ? Number(cookieValue) : undefined;

  if ('user' in res) {
    if (!res.lessonGroup) {
      return <div className="flex items-center justify-center p-4 text-black">예약 중인 수업이 아닙니다.</div>
    }
    return (
        <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
          <div className={`flex flex-col ${appVersion === "" ? "p-4" : ""}`}>
            {/* 수업 정보 */}
            <div className="flex gap-4 w-full px-6 items-center">
              <Thumbnail url={res.lessonGroup.thumbnailUrl ?? ''} width={86}
                         className="rounded-lg flex-shrink-0"/>

              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-base font-bold text-left text-[#131517] break-words">{res.lessonGroup.title}</p>
                <div className="flex items-top gap-2">
                  {res.lessonGroup.studioImageUrl &&
                      <CircleImage size={20} imageUrl={res.lessonGroup.studioImageUrl}/>}
                  <div className={"flex flex-col items-start"}>
                    <span className="font-medium text-[14px] text-[#86898c]">
                      {res.lessonGroup.studioName}
                    </span>
                  </div>
                </div>
                {res.lessonGroup.description && (
                  <div className={"flex flex-row items-center mb-1"}>
                    <p className="text-[#86898C] text-[14px] font-medium">{res.lessonGroup.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="py-5">
              <div className="w-full h-3 bg-[#F7F8F9] "/>
            </div>

            <LessonGroupPaymentInfo
                url={process.env.GUINNESS_API_SERVER ?? ''}
                appVersion={appVersion}
                payment={res}
                beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
                locale={await getLocale()}
                actualPayerUserId={actualPayerUserId}
            />
          </div>
        </div>
    );
  } else {
    return notFound()
  }
}
