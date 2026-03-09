import { notFound } from "next/navigation";
import { Thumbnail } from "@/app/components/Thumbnail";
import { getPaymentAction } from "@/app/payment/get.payment.action";
import { cookies } from "next/headers";
import { depositorKey, userIdKey } from "@/shared/cookies.key";
import React from "react";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { CircleImage } from "@/app/components/CircleImage";
import { getLocale, translate } from "@/utils/translate";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import { PassPlanBenefits } from "@/app/payment/PassPlanBenefits";

type PaymentPageType = 'lesson' | 'pass-plan' | 'lesson-group';

export default async function UnifiedPaymentPage({ searchParams }: {
  searchParams: Promise<{
    type: PaymentPageType
    id: string
    os?: string
    appVersion?: string
    targetUserId?: string
  }>
}) {
  const params = await searchParams;
  const { type, id, appVersion = '', targetUserId } = params;
  const itemId = parseInt(id);
  const parsedTargetUserId = targetUserId ? parseInt(targetUserId) : undefined;

  const res = await getPaymentAction({
    type,
    id: itemId,
    targetUserId: parsedTargetUserId
  });

  const cookieValue = (await cookies()).get(userIdKey)?.value;
  const actualPayerUserId = cookieValue ? Number(cookieValue) : undefined;

  if (!('user' in res)) {
    return notFound();
  }

  // 대리 결제 여부 확인
  const isProxyPayment = !!(actualPayerUserId && res.user.id !== actualPayerUserId);

  // 타입별로 데이터가 없는 경우 체크
  if (type === 'lesson' && !res.lesson) {
    return <div className="flex items-center justify-center p-4 text-black">예약 중인 수업이 아닙니다.</div>
  }
  if (type === 'lesson-group' && !res.lessonGroup) {
    return <div className="flex items-center justify-center p-4 text-black">예약 중인 수업이 아닙니다.</div>
  }
  if (type === 'pass-plan' && !res.passPlan) {
    return <div className="flex items-center justify-center p-4 text-black">패스권 정보를 찾을 수 없습니다.</div>
  }

  const getItemInfo = () => {
    switch (type) {
      case 'lesson':
        return {
          thumbnailUrl: res.lesson?.thumbnailUrl,
          title: res.lesson?.title,
          studioName: res.lesson?.studio?.name,
          studioImageUrl: res.lesson?.studio?.profileImageUrl,
        };
      case 'lesson-group':
        return {
          thumbnailUrl: res.lessonGroup?.thumbnailUrl,
          title: res.lessonGroup?.title,
          studioName: res.lessonGroup?.studioName,
          studioImageUrl: res.lessonGroup?.studioImageUrl,
        };
      case 'pass-plan':
        return {
          thumbnailUrl: res.passPlan?.studio?.profileImageUrl,
          title: res.passPlan?.name,
          studioName: res.passPlan?.studio?.name,
          studioImageUrl: res.passPlan?.studio?.profileImageUrl,
        };
    }
  };

  const { thumbnailUrl, title, studioName, studioImageUrl } = getItemInfo();

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
      {/* 공통 헤더: back arrow + 결제하기 */}
      {appVersion === '' && (
        <div className="mb-2">
          <SimpleHeader titleResource={'payment'} />
        </div>
      )}

      <div className="flex flex-col">
        {/* 공통 상단: 상품 정보 */}
        {type === 'pass-plan' && res.passPlan ? (
          <div className="flex items-center gap-3 px-6">
            <CircleImage size={40} imageUrl={studioImageUrl} />
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[16px] font-bold text-[#131517] break-words">{title}</p>
              <span className="text-[14px] font-medium text-[#86898c]">{studioName}</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 w-full px-6 items-center">
            <Thumbnail url={thumbnailUrl ?? ''} width={86} className="rounded-lg flex-shrink-0" />
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-base font-bold text-left text-[#131517] break-words">{title}</p>
              <div className="flex items-top gap-2">
                {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
                <div className="flex flex-col items-start">
                  <span className="font-medium text-[14px] text-[#86898c]">
                    {studioName}
                  </span>
                  {type === 'lesson' && res.lesson?.room?.name && (
                    <span className="font-medium text-[12px] text-[#86898C]">
                      {res.lesson.room.name}
                    </span>
                  )}
                </div>
              </div>

              {type === 'lesson' && res.lesson?.formattedDate && (
                <p className="text-[#86898C] text-[13px] font-medium">
                  {res.lesson.formattedDate.date}
                  {res.lesson.formattedDate.weekday && ` (${res.lesson.formattedDate.weekday})`}
                  {' '}
                  {res.lesson.formattedDate.startTime} - {res.lesson.formattedDate.endTime}
                </p>
              )}

              {type === 'lesson' && !res.lesson?.formattedDate && res.lesson?.date && (
                <p className="text-[#86898C] text-[13px] font-medium">
                  {res.lesson.date}{res.lesson.duration ? ` · ${res.lesson.duration}${await translate('minutes')}` : ''}
                </p>
              )}

              {type === 'lesson-group' && res.lessonGroup?.description && (
                <p className="text-[#86898C] text-[14px] font-medium">{res.lessonGroup.description}</p>
              )}
            </div>
          </div>
        )}

        {/* 패스권 혜택 */}
        {type === 'pass-plan' && res.passPlan && (
          <PassPlanBenefits passPlan={res.passPlan} />
        )}

        <div className="py-5">
          <div className="w-full h-3 bg-[#F7F8F9]" />
        </div>

        <UnifiedPaymentInfo
          type={type}
          url={process.env.GUINNESS_API_SERVER ?? ''}
          appVersion={appVersion}
          payment={res}
          beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
          locale={await getLocale()}
          actualPayerUserId={actualPayerUserId}
          isProxyPayment={isProxyPayment}
        />
      </div>
    </div>
  );
}
