import { notFound } from "next/navigation";
import { Thumbnail } from "@/app/components/Thumbnail";
import { getPaymentAction } from "@/app/payment/get.payment.action";
import { cookies } from "next/headers";
import { depositorKey, userIdKey } from "@/shared/cookies.key";
import React from "react";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { CircleImage } from "@/app/components/CircleImage";
import { getLocale, translate } from "@/utils/translate";
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import { BackButton } from "@/app/payment/BackButton";

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
  const { type, id, os, appVersion = '', targetUserId } = params;
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
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }
  if (type === 'lesson-group' && !res.lessonGroup) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }
  if (type === 'pass-plan' && !res.passPlan) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('pass_plan_not_found')}</div>
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
    <div className="relative w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto overscroll-none scrollbar-hide">
      <div className="flex flex-col">
        {appVersion === '' && (
          <BackButton />
        )}
        {/* lesson / lesson-group */}
        {(type === 'lesson' || type === 'lesson-group') && (
          <div className="px-5 pt-4 pb-3">
            <div className="flex gap-4">
              {/* 썸네일 9:16 */}
              <div className="relative w-[120px] aspect-[9/16] rounded-2xl overflow-hidden bg-[#F1F3F6] flex-shrink-0">
                {thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl}
                    alt={title ?? ''}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 메타 정보 */}
              <div className="flex flex-col justify-start gap-2 min-w-0 flex-1">
                <p className="text-[18px] font-bold text-black leading-snug break-words line-clamp-2">{title}</p>
                <div className="flex items-center gap-2">
                  {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
                  <span className="text-[14px] font-medium text-[#86898C]">{studioName}</span>
                </div>
                {type === 'lesson' && (res.lesson?.formattedDate || res.lesson?.date) && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="#999" strokeWidth="1.1"/>
                        <path d="M1.5 5.5H12.5" stroke="#999" strokeWidth="1.1"/>
                        <path d="M4.5 1V3" stroke="#999" strokeWidth="1.1" strokeLinecap="round"/>
                        <path d="M9.5 1V3" stroke="#999" strokeWidth="1.1" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[13px] font-medium text-[#666]">
                        {res.lesson?.formattedDate
                          ? `${res.lesson.formattedDate.date}${res.lesson.formattedDate.weekday ? ` (${res.lesson.formattedDate.weekday})` : ''}`
                          : res.lesson?.date}
                      </span>
                    </div>
                    {(res.lesson?.formattedDate?.startTime || res.lesson?.duration) && (
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="#999" strokeWidth="1.1"/>
                          <path d="M7 4V7L9 9" stroke="#999" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[13px] font-medium text-[#666]">
                          {res.lesson?.formattedDate
                            ? `${res.lesson.formattedDate.startTime} - ${res.lesson.formattedDate.endTime}`
                            : `${res.lesson?.duration}${await translate('minutes')}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {type === 'lesson-group' && res.lessonGroup?.description && (
                  <p className="text-[12px] font-medium text-[#999] mt-1">{res.lessonGroup.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* pass-plan: 기존 컴팩트 레이아웃 */}
        {type === 'pass-plan' && (
          <>
            <div className="flex gap-4 w-full px-6 items-center">
              <div className="w-[56px] h-[56px] rounded-2xl bg-[#F3F3F4] flex items-center justify-center flex-shrink-0">
                <TicketIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-base font-bold text-left text-[#131517] break-words">{title}</p>
                <div className="flex items-center gap-2">
                  {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
                  <span className="font-medium text-[14px] text-[#86898c]">{studioName}</span>
                </div>
                {res.passPlan && (
                  <div className="text-[13px] text-[#86898C] font-medium">
                    {res.passPlan.type === 'Unlimited' && <span>{await translate('pass_plan_unlimited_description')}</span>}
                    {res.passPlan.type === 'Count' && <span>{(await translate('pass_plan_count_description')).replace('{{count}}', `${res.passPlan.usageLimit}`)}</span>}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="py-1">
          <div className="w-full h-2 bg-[#F7F8F9]" />
        </div>

        <UnifiedPaymentInfo
          type={type}
          url={process.env.GUINNESS_API_SERVER ?? ''}
          appVersion={appVersion}
          os={os}
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
