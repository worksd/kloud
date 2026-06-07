// PC 전용 결제 페이지 — 모바일은 PaymentMobileForm 사용.
// 2-column 레이아웃 + 우측 sticky 아이템 요약 카드 (모바일 대비 썸네일 크기/비율 차별화).

import { Thumbnail } from "@/app/components/Thumbnail";
import React from "react";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { CircleImage } from "@/app/components/CircleImage";
import { translate } from "@/utils/translate";
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import { PassPlanBenefits } from "@/app/payment/PassPlanBenefits";
import { PracticeRoomPaymentWrapper } from "@/app/payment/PracticeRoomPaymentWrapper";
import { LessonTags } from "@/app/components/LessonTags";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";

type PaymentPageType = 'lesson' | 'pass-plan' | 'lesson-group' | 'practice-room' | 'bundle';

export default async function PaymentPcForm({
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
}) {

  const isLessonLike = paymentItem === 'lesson' || paymentItem === 'lesson-group';

  return (
    <div className="w-full min-h-screen bg-white pt-24 pb-32">
      {/* pt-24: layout WebTopNav(h-16) 아래 여백 확보 */}
      <div className="mx-auto w-full max-w-5xl px-8 grid grid-cols-[minmax(0,1fr)_360px] gap-x-12">

        {/* 좌측: 결제 폼 (UnifiedPaymentInfo) */}
        <div className="col-start-1 row-start-1">
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
          )}
        </div>

        {/* 우측: 아이템 요약 카드 (sticky) — 썸네일 크기 모바일과 차별화 */}
        <aside className="col-start-2 row-start-1 sticky top-24 self-start">
          <div className="rounded-2xl border border-[#f0f1f3] bg-white p-5 shadow-sm flex flex-col gap-4">

            {/* lesson / lesson-group — PC에서는 큰 썸네일 위 + 메타 아래 세로 배치 */}
            {isLessonLike && (
              <>
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#F1F3F6]">
                  {thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl}
                      alt={title ?? ''}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[17px] font-bold text-black leading-snug line-clamp-2">{title}</p>
                  {paymentItem === 'lesson' && payment.lesson?.tags && (
                    <LessonTags tags={payment.lesson.tags} />
                  )}
                  <div className="flex items-center gap-2">
                    {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
                    <span className="text-[13px] font-medium text-[#86898C]">{studioName}</span>
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
              </>
            )}

            {/* pass-plan — PC에서는 작은 정사각 썸네일 (모바일은 풀와이드 1:1, PC는 240×240) */}
            {paymentItem === 'pass-plan' && payment.passPlan && (
              <>
                {payment.passPlan.imageUrl && (
                  <div className="w-full aspect-[1/1] max-w-[260px] mx-auto rounded-xl overflow-hidden bg-[#F1F3F6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={payment.passPlan.imageUrl} alt={title ?? ''} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    {studioImageUrl && <CircleImage size={20} imageUrl={studioImageUrl} />}
                    <span className="text-[13px] font-medium text-[#86898C]">{studioName}</span>
                  </div>
                  <p className="text-[17px] font-bold text-black">{title}</p>
                  {payment.passPlan.expireDateStamp && (
                    <p className="text-[12px] text-[#86898C] font-medium">{payment.passPlan.expireDateStamp}</p>
                  )}
                  <PassPlanBenefits passPlan={payment.passPlan} locale={locale} />
                </div>
              </>
            )}

            {/* bundle — 썸네일 없음, 번들명 + 구성 */}
            {paymentItem === 'bundle' && payment.bundle && (
              <div className="flex flex-col gap-2">
                <p className="text-[17px] font-bold text-black">{payment.bundle.name}</p>
                {payment.bundle.description && (
                  <p className="text-[13px] text-[#86898C] font-medium">{payment.bundle.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap mt-1">
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
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-1.5">
                      <TicketIcon className="w-[14px] h-[14px]"/>
                      <span className="text-[13px] font-bold text-black">
                        {(await translate('bundle_total_lessons')).replace('{count}', String(payment.bundle.items.length))}
                      </span>
                    </div>
                    {payment.bundle.items.map((item) => {
                      const thumb = item.imageUrl ?? item.thumbnailUrl;
                      return (
                        <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-2.5 bg-[#F7F8F9] rounded-lg">
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#F1F3F6] shrink-0">
                            {thumb && <Thumbnail url={thumb} className="w-full h-full" aspectRatio={1}/>}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-[13px] font-medium text-black truncate">{item.title}</span>
                            {item.startDate && (
                              <span className="text-[11px] text-[#86898C]">{item.startDate}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* practice-room — 룸 이름 + 날짜 (썸네일 아이콘만) */}
            {paymentItem === 'practice-room' && payment.studioRoom && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F1F3F6] flex items-center justify-center flex-shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#333" strokeWidth="1.5"/>
                      <path d="M8 5V3" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M16 5V3" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3 9H21" stroke="#333" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <span className="text-[16px] font-bold text-black">{payment.studioRoom.name}</span>
                </div>
                {payment.studioRoom.date && (
                  <div className="flex items-center justify-between bg-[#F7F8F9] rounded-lg px-3 py-2 mt-1">
                    <span className="text-[12px] text-[#86898C]">{await translate('date')}</span>
                    <span className="text-[13px] font-medium text-black">{payment.studioRoom.date}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
