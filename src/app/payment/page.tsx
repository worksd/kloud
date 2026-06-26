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
import { PassPlanBenefits } from "@/app/payment/PassPlanBenefits";
import { PracticeRoomPaymentWrapper } from "@/app/payment/PracticeRoomPaymentWrapper";
import { PushAndBackRedirect } from "@/app/components/PushAndBackRedirect";
import { LessonTags } from "@/app/components/LessonTags";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { PaymentErrorView, PaymentErrorLesson } from "@/app/payment/PaymentErrorView";

type PaymentPageType = 'lesson' | 'pass-plan' | 'lesson-group' | 'practice-room' | 'bundle';

// 번들 판매기간 — "2026.06.16 05:52" → "2026.06.16" 형태로 시작~종료 표시. (구) closeDate는 종료일 폴백.
const bundleSalesPeriod = (start?: string, end?: string, close?: string): string | null => {
  const day = (raw?: string) => raw?.match(/^\d{4}\.\d{1,2}\.\d{1,2}/)?.[0] ?? null;
  const s = day(start);
  const e = day(end) ?? day(close);
  if (s && e) return `${s} ~ ${e}`;
  if (e) return `~ ${e}`;
  if (s) return `${s} ~`;
  return null;
};

export default async function UnifiedPaymentPage({ searchParams }: {
  searchParams: Promise<{
    type?: PaymentPageType
    item?: PaymentPageType
    id: string
    os?: string
    appVersion?: string
    targetUserId?: string
    date?: string
  }>
}) {
  const params = await searchParams;
  const { type, item, id, os, appVersion = '', targetUserId, date } = params;
  const paymentItem = item ?? type ?? 'lesson';
  const itemId = parseInt(id);
  const parsedTargetUserId = targetUserId ? parseInt(targetUserId) : undefined;

  const res = await getPaymentAction({
    item: paymentItem,
    id: itemId,
    targetUserId: parsedTargetUserId,
    date: paymentItem === 'practice-room' ? date : undefined,
  });

  // BE가 redirectUrl을 내려주면 결제 폼 진입 없이 그 route로 push 후 결제 페이지를 back.
  if ('redirectUrl' in res && res.redirectUrl) {
    return <PushAndBackRedirect route={res.redirectUrl}/>;
  }

  const cookieValue = (await cookies()).get(userIdKey)?.value;
  const actualPayerUserId = cookieValue ? Number(cookieValue) : undefined;

  if (!('user' in res)) {
    // 에러 응답(code+message)이면 notFound('페이지를 찾을 수 없습니다') 대신 서버 메시지를 노출.
    // 예: BUNDLE_DUPLICATE_REGISTRATION(이미 신청한 묶음) 등 도메인 에러.
    if (isGuinnessErrorCase(res)) {
      // 일부 에러는 충돌 수업 목록을 함께 내려줌 (예: BUNDLE_DUPLICATE_REGISTRATION)
      const errorLessons = (res as { lessons?: PaymentErrorLesson[] }).lessons ?? [];
      return (
        <PaymentErrorView
          title={await translate('payment_error_title')}
          message={res.message || await translate('unknown_error_message')}
          backLabel={await translate('back')}
          lessons={errorLessons}
        />
      );
    }
    return notFound();
  }

  // 대리 결제 여부 확인
  const isProxyPayment = !!(actualPayerUserId && res.user.id !== actualPayerUserId);

  // 타입별로 데이터가 없는 경우 체크
  if (paymentItem === 'lesson' && !res.lesson) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }
  if (paymentItem === 'lesson-group' && !res.lessonGroup) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }
  if (paymentItem === 'pass-plan' && !res.passPlan) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('pass_plan_not_found')}</div>
  }
  if (paymentItem === 'bundle' && !res.bundle) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }

  const getItemInfo = () => {
    switch (paymentItem) {
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
      case 'bundle':
        // 번들 응답엔 studio 정보가 따로 안 옴 — title만 표기, studio는 비움.
        return {
          thumbnailUrl: undefined,
          title: res.bundle?.name,
          studioName: undefined,
          studioImageUrl: undefined,
        };
      default:
        return {
          thumbnailUrl: undefined,
          title: undefined,
          studioName: undefined,
          studioImageUrl: undefined,
        };
    }
  };

  const { thumbnailUrl, title, studioName, studioImageUrl } = getItemInfo();
  const timeText = await translate('time');

  return (
    <div className="relative w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto overscroll-none scrollbar-hide">
      <div className="flex flex-col">
        {appVersion === '' && (
          <BackButton />
        )}
        {/* lesson / lesson-group */}
        {(paymentItem === 'lesson' || paymentItem === 'lesson-group') && (
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
                {paymentItem === 'lesson' && res.lesson?.tags && (
                  <LessonTags tags={res.lesson.tags} />
                )}
                <div className="flex items-center gap-2">
                  {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
                  <span className="text-[14px] font-medium text-[#86898C]">{studioName}</span>
                </div>
                {paymentItem === 'lesson' && (res.lesson?.formattedDate || res.lesson?.date) && (
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
                {paymentItem === 'lesson-group' && res.lessonGroup?.description && (
                  <p className="text-[12px] font-medium text-[#999] mt-1">{res.lessonGroup.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* bundle — 묶음 결제. 번들명 + 원가 strike + 판매 마감 + 구성 수업 리스트. */}
        {paymentItem === 'bundle' && res.bundle && (
          <div className="px-5 pt-4 pb-3">
            <p className="text-[20px] font-bold text-black mb-1">{res.bundle.name}</p>
            {res.bundle.description && (
              <p className="text-[13px] text-[#86898C] font-medium mb-2">{res.bundle.description}</p>
            )}
            {/* 원가 strike + 마감일 */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {res.bundle.originalPrice != null && res.price != null && res.bundle.originalPrice > res.price && (
                <span className="text-[13px] text-[#BFC2C5] line-through">
                  {new Intl.NumberFormat('ko-KR').format(res.bundle.originalPrice)}{await translate('won')}
                </span>
              )}
              {bundleSalesPeriod(res.bundle.startDate, res.bundle.endDate, res.bundle.closeDate) && (
                <span className="text-[12px] text-[#EF4444] font-medium">
                  {await translate('sales_period')} {bundleSalesPeriod(res.bundle.startDate, res.bundle.endDate, res.bundle.closeDate)}
                </span>
              )}
            </div>
            {/* 구성 수업 리스트 */}
            {res.bundle.items.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TicketIcon className="w-[14px] h-[14px]"/>
                  <span className="text-[13px] font-bold text-black">
                    {(await translate('bundle_total_lessons')).replace('{count}', String(res.bundle.items.length))}
                  </span>
                </div>
                {res.bundle.items.map((item) => {
                  const thumb = item.imageUrl ?? item.thumbnailUrl;
                  return (
                  <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-3 bg-[#F7F8F9] rounded-xl">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F1F3F6] shrink-0">
                      {thumb && (
                        <Thumbnail url={thumb} className="w-full h-full" aspectRatio={1}/>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[14px] font-medium text-black truncate">{item.title}</span>
                      {item.startDate && (
                        <span className="text-[12px] text-[#86898C]">{item.startDate}</span>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* pass-plan */}
        {paymentItem === 'pass-plan' && res.passPlan && (
          <div className="px-5 pt-4 pb-3">
            {/* 이미지 */}
            {res.passPlan.imageUrl && (
              <div className="w-full aspect-[1/1] rounded-2xl overflow-hidden bg-[#F1F3F6] mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={res.passPlan.imageUrl} alt={title ?? ''} className="w-full h-full object-cover" />
              </div>
            )}

            {/* 헤더 */}
            <div className="flex items-center gap-2.5 mb-3">
              {studioImageUrl && <CircleImage size={24} imageUrl={studioImageUrl} />}
              <span className="text-[13px] font-medium text-[#86898C]">{studioName}</span>
            </div>
            <p className="text-[20px] font-bold text-black mb-1">{title}</p>
            {res.passPlan.expireDateStamp && (
              <p className="text-[13px] text-[#86898C] font-medium mb-4">{res.passPlan.expireDateStamp}</p>
            )}

            {/* 이용 혜택 */}
            <PassPlanBenefits passPlan={res.passPlan} locale={await getLocale()} />
          </div>
        )}

        {paymentItem === 'practice-room' ? (
          <PracticeRoomPaymentWrapper
            payment={res}
            studioRoomId={itemId}
            url={process.env.GUINNESS_API_SERVER ?? ''}
            appVersion={appVersion}
            os={os}
            beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
            locale={await getLocale()}
            actualPayerUserId={actualPayerUserId}
            isProxyPayment={isProxyPayment}
          />
        ) : (
          <>
            <div className="py-1">
              <div className="w-full h-2 bg-[#F7F8F9]" />
            </div>

            <UnifiedPaymentInfo
              type={paymentItem}
              url={process.env.GUINNESS_API_SERVER ?? ''}
              appVersion={appVersion}
              os={os}
              payment={res}
              beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
              locale={await getLocale()}
              actualPayerUserId={actualPayerUserId}
              isProxyPayment={isProxyPayment}
            />
          </>
        )}
      </div>
    </div>
  );
}
