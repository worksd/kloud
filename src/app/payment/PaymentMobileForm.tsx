// 모바일 웹뷰 + 좁은 웹에서 사용하는 결제 페이지 렌더. PC는 PaymentPcForm.
// page.tsx에서 추출 — 기존 UI 그대로.

import { Thumbnail } from "@/app/components/Thumbnail";
import React from "react";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { CircleImage } from "@/app/components/CircleImage";
import { translate } from "@/utils/translate";
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import { BackButton } from "@/app/payment/BackButton";
import { PassPlanBenefits } from "@/app/payment/PassPlanBenefits";
import { PracticeRoomPaymentWrapper } from "@/app/payment/PracticeRoomPaymentWrapper";
import { LessonTags } from "@/app/components/LessonTags";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";

type PaymentPageType = 'lesson' | 'pass-plan' | 'lesson-group' | 'practice-room' | 'bundle';

export default async function PaymentMobileForm({
  payment,
  paymentItem,
  itemId,
  thumbnailUrl,
  title,
  studioName,
  studioImageUrl,
  os,
  appVersion,
  beforeDepositor,
  actualPayerUserId,
  isProxyPayment,
  locale,
  apiUrl,
  showBackButton,
}: {
  payment: GetPaymentResponse;
  paymentItem: PaymentPageType;
  itemId: number;
  thumbnailUrl?: string;
  title?: string;
  studioName?: string;
  studioImageUrl?: string;
  os?: string;
  appVersion: string;
  beforeDepositor: string;
  actualPayerUserId?: number;
  isProxyPayment: boolean;
  locale: Locale;
  apiUrl: string;
  showBackButton: boolean;
}) {

  return (
    <div className="relative w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto overscroll-none scrollbar-hide">
      <div className="flex flex-col">
        {showBackButton && <BackButton />}
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
                {paymentItem === 'lesson' && payment.lesson?.tags && (
                  <LessonTags tags={payment.lesson.tags} />
                )}
                <div className="flex items-center gap-2">
                  {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
                  <span className="text-[14px] font-medium text-[#86898C]">{studioName}</span>
                </div>
                {paymentItem === 'lesson' && (payment.lesson?.formattedDate || payment.lesson?.date) && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="#999" strokeWidth="1.1"/>
                        <path d="M1.5 5.5H12.5" stroke="#999" strokeWidth="1.1"/>
                        <path d="M4.5 1V3" stroke="#999" strokeWidth="1.1" strokeLinecap="round"/>
                        <path d="M9.5 1V3" stroke="#999" strokeWidth="1.1" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[13px] font-medium text-[#666]">
                        {payment.lesson?.formattedDate
                          ? `${payment.lesson.formattedDate.date}${payment.lesson.formattedDate.weekday ? ` (${payment.lesson.formattedDate.weekday})` : ''}`
                          : payment.lesson?.date}
                      </span>
                    </div>
                    {(payment.lesson?.formattedDate?.startTime || payment.lesson?.duration) && (
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="#999" strokeWidth="1.1"/>
                          <path d="M7 4V7L9 9" stroke="#999" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[13px] font-medium text-[#666]">
                          {payment.lesson?.formattedDate
                            ? `${payment.lesson.formattedDate.startTime} - ${payment.lesson.formattedDate.endTime}`
                            : `${payment.lesson?.duration}${await translate('minutes')}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {paymentItem === 'lesson-group' && payment.lessonGroup?.description && (
                  <p className="text-[12px] font-medium text-[#999] mt-1">{payment.lessonGroup.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* bundle */}
        {paymentItem === 'bundle' && payment.bundle && (
          <div className="px-5 pt-4 pb-3">
            <p className="text-[20px] font-bold text-black mb-1">{payment.bundle.name}</p>
            {payment.bundle.description && (
              <p className="text-[13px] text-[#86898C] font-medium mb-2">{payment.bundle.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {payment.bundle.originalPrice != null && payment.price != null && payment.bundle.originalPrice > payment.price && (
                <span className="text-[13px] text-[#BFC2C5] line-through">
                  {new Intl.NumberFormat('ko-KR').format(payment.bundle.originalPrice)}{await translate('won')}
                </span>
              )}
              {payment.bundle.closeDate && (
                <span className="text-[12px] text-[#EF4444] font-medium">
                  ~ {payment.bundle.closeDate}
                </span>
              )}
            </div>
            {payment.bundle.items.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TicketIcon className="w-[14px] h-[14px]"/>
                  <span className="text-[13px] font-bold text-black">
                    {(await translate('bundle_total_lessons')).replace('{count}', String(payment.bundle.items.length))}
                  </span>
                </div>
                {payment.bundle.items.map((item) => {
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
        {paymentItem === 'pass-plan' && payment.passPlan && (
          <div className="px-5 pt-4 pb-3">
            {payment.passPlan.imageUrl && (
              <div className="w-full aspect-[1/1] rounded-2xl overflow-hidden bg-[#F1F3F6] mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={payment.passPlan.imageUrl} alt={title ?? ''} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-2.5 mb-3">
              {studioImageUrl && <CircleImage size={24} imageUrl={studioImageUrl} />}
              <span className="text-[13px] font-medium text-[#86898C]">{studioName}</span>
            </div>
            <p className="text-[20px] font-bold text-black mb-1">{title}</p>
            {payment.passPlan.expireDateStamp && (
              <p className="text-[13px] text-[#86898C] font-medium mb-4">{payment.passPlan.expireDateStamp}</p>
            )}
            <PassPlanBenefits passPlan={payment.passPlan} locale={locale} />
          </div>
        )}

        {paymentItem === 'practice-room' ? (
          <PracticeRoomPaymentWrapper
            payment={payment}
            studioRoomId={itemId}
            url={apiUrl}
            appVersion={appVersion}
            os={os}
            beforeDepositor={beforeDepositor}
            locale={locale}
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
              url={apiUrl}
              appVersion={appVersion}
              os={os}
              payment={payment}
              beforeDepositor={beforeDepositor}
              locale={locale}
              actualPayerUserId={actualPayerUserId}
              isProxyPayment={isProxyPayment}
            />
          </>
        )}
      </div>
    </div>
  );
}
