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
    <div className="relative w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
      <div className="flex flex-col">
        {appVersion === '' && (
          <BackButton />
        )}
        {/* lesson / lesson-group: 큰 히어로 이미지 */}
        {(type === 'lesson' || type === 'lesson-group') && (
          <>
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F1F3F6]">
              {thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnailUrl}
                  alt={title ?? ''}
                  className="w-full h-full object-cover"
                />
              )}
              {/* 하단 그라데이션 */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              {/* 이미지 위 텍스트 */}
              <div className="absolute inset-x-0 bottom-0 px-6 pb-5">
                <p className="text-[18px] font-bold text-white leading-snug drop-shadow-sm">{title}</p>
                <div className="flex items-center gap-2 mt-2">
                  {studioImageUrl && <CircleImage size={22} imageUrl={studioImageUrl} />}
                  <span className="text-[14px] font-medium text-white/90 drop-shadow-sm">{studioName}</span>
                  {type === 'lesson' && res.lesson?.room?.name && (
                    <span className="text-[12px] text-white/70">· {res.lesson.room.name}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 날짜/시간 정보 바 */}
            {type === 'lesson' && (res.lesson?.formattedDate || res.lesson?.date) && (
              <div className="px-6 py-3 bg-[#F7F8F9] flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="#86898C" strokeWidth="1.2"/>
                  <path d="M2 6.5H14" stroke="#86898C" strokeWidth="1.2"/>
                  <path d="M5.5 1.5V3.5" stroke="#86898C" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M10.5 1.5V3.5" stroke="#86898C" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {res.lesson?.formattedDate ? (
                  <span className="text-[13px] font-medium text-[#555]">
                    {res.lesson.formattedDate.date}
                    {res.lesson.formattedDate.weekday && ` (${res.lesson.formattedDate.weekday})`}
                    {' '}
                    {res.lesson.formattedDate.startTime} - {res.lesson.formattedDate.endTime}
                  </span>
                ) : res.lesson?.date && (
                  <span className="text-[13px] font-medium text-[#555]">
                    {res.lesson.date}{res.lesson.duration ? ` · ${res.lesson.duration}${await translate('minutes')}` : ''}
                  </span>
                )}
              </div>
            )}

            {type === 'lesson-group' && res.lessonGroup?.description && (
              <div className="px-6 py-3 bg-[#F7F8F9]">
                <p className="text-[13px] font-medium text-[#555]">{res.lessonGroup.description}</p>
              </div>
            )}
          </>
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
