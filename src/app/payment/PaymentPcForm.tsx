// PC 웹 전용 결제 페이지 — 모바일(앱 웹뷰/좁은 웹)은 PaymentMobileForm 사용.
//  좌측: 상품 상세(큰 썸네일 + 메타) + 결제수단/패스권/할인/유의사항
//  우측(sticky): 결제 정보 + 그 아래 결제 버튼
// 2열 배치는 UnifiedPaymentInfo(layout='pc')가 담당하고, 이 폼은 좌측 최상단 상품 상세를
// detailsSlot으로 넘긴다. 결제 로직(payment.button)은 모바일과 완전히 동일한 컴포넌트를 쓴다.

import React from "react";
import { Thumbnail } from "@/app/components/Thumbnail";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { CircleImage } from "@/app/components/CircleImage";
import { translate } from "@/utils/translate";
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import { PassPlanBenefits } from "@/app/payment/PassPlanBenefits";
import { PracticeRoomPaymentWrapper } from "@/app/payment/PracticeRoomPaymentWrapper";
import { PaymentProfileButton } from "@/app/payment/PaymentProfileButton";
import { LessonTags } from "@/app/components/LessonTags";
import { bundleSalesPeriod } from "@/app/payment/payment.format";
import { PaymentFormProps } from "@/app/payment/payment.form.props";
import { PcBackLink } from "@/app/payment/PcBackLink";

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
  preStartTime,
  preEndTime,
}: PaymentFormProps) {
  const isLessonLike = paymentItem === 'lesson' || paymentItem === 'lesson-group';
  const salesPeriod = payment.bundle
    ? bundleSalesPeriod(payment.bundle.startDate, payment.bundle.endDate, payment.bundle.closeDate)
    : null;

  // 상단 와이드 히어로 — 좌우 컬럼 위, 컨텐츠 전체 폭(16:9)
  // 연습실은 PracticeRoomPaymentWrapper가 자체 히어로를 좌측에 렌더하므로 제외 (중복 방지)
  const heroImageUrl = isLessonLike
    ? thumbnailUrl
    : paymentItem === 'pass-plan'
      ? payment.passPlan?.imageUrl
      : undefined;

  // 좌측 최상단 상품 상세 — 결제 섹션들 위에 놓인다 (UnifiedPaymentInfo의 detailsSlot)
  const productDetails = (
    <div className="flex flex-col gap-6 pb-7">

      {/* lesson / lesson-group — 히어로는 위에서 이미 노출, 여기선 메타만 */}
      {isLessonLike && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 min-w-0">
            <p className="text-[22px] font-bold text-black leading-snug break-words">{title}</p>
            {paymentItem === 'lesson' && payment.lesson?.tags && (
              <LessonTags tags={payment.lesson.tags} />
            )}
            <div className="flex items-center gap-2">
              {studioImageUrl && <CircleImage size={24} imageUrl={studioImageUrl} />}
              <span className="text-[15px] font-medium text-[#86898C]">{studioName}</span>
            </div>
            {paymentItem === 'lesson' && (payment.lesson?.formattedDate || payment.lesson?.date) && (
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                    <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="#999" strokeWidth="1.1"/>
                    <path d="M1.5 5.5H12.5" stroke="#999" strokeWidth="1.1"/>
                    <path d="M4.5 1V3" stroke="#999" strokeWidth="1.1" strokeLinecap="round"/>
                    <path d="M9.5 1V3" stroke="#999" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[14px] font-medium text-[#666]">
                    {payment.lesson?.formattedDate
                      ? `${payment.lesson.formattedDate.date}${payment.lesson.formattedDate.weekday ? ` (${payment.lesson.formattedDate.weekday})` : ''}`
                      : payment.lesson?.date}
                  </span>
                </div>
                {(payment.lesson?.formattedDate?.startTime || payment.lesson?.duration) && (
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="#999" strokeWidth="1.1"/>
                      <path d="M7 4V7L9 9" stroke="#999" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[14px] font-medium text-[#666]">
                      {payment.lesson?.formattedDate
                        ? `${payment.lesson.formattedDate.startTime} - ${payment.lesson.formattedDate.endTime}`
                        : `${payment.lesson?.duration}${await translate('minutes')}`}
                    </span>
                  </div>
                )}
              </div>
            )}
            {paymentItem === 'lesson-group' && payment.lessonGroup?.description && (
              <p className="text-[13px] font-medium text-[#999] mt-1">{payment.lessonGroup.description}</p>
            )}
          </div>
        </div>
      )}

      {/* pass-plan — 히어로는 위에서 노출, 여기선 이용 혜택 */}
      {paymentItem === 'pass-plan' && payment.passPlan && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2">
              {studioImageUrl && <CircleImage size={24} imageUrl={studioImageUrl} />}
              <span className="text-[15px] font-medium text-[#86898C]">{studioName}</span>
            </div>
            <p className="text-[22px] font-bold text-black">{title}</p>
            {payment.passPlan.expireDateStamp && (
              <p className="text-[14px] text-[#86898C] font-medium mb-1">{payment.passPlan.expireDateStamp}</p>
            )}
            <PassPlanBenefits passPlan={payment.passPlan} locale={locale} />
          </div>
        </div>
      )}

      {/* bundle — 번들명 + 판매기간 + 구성 수업 */}
      {paymentItem === 'bundle' && payment.bundle && (
        <div className="flex flex-col gap-3">
          <p className="text-[22px] font-bold text-black">{payment.bundle.name}</p>
          {payment.bundle.description && (
            <p className="text-[14px] text-[#86898C] font-medium">{payment.bundle.description}</p>
          )}
          {salesPeriod && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2.5 py-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
                <circle cx="12" cy="12" r="8.5" stroke="#EF4444" strokeWidth="1.6"/>
                <path d="M12 8v4.2l2.6 2" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[11px] font-semibold text-[#EF4444]">{await translate('sales_period')}</span>
              <span className="text-[11px] font-medium text-[#F87171]">{salesPeriod}</span>
            </span>
          )}
          {payment.bundle.items.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="col-span-2 flex items-center gap-1.5">
                <TicketIcon className="w-[14px] h-[14px]"/>
                <span className="text-[14px] font-bold text-black">
                  {(await translate('bundle_total_lessons')).replace('{count}', String(payment.bundle.items.length))}
                </span>
              </div>
              {payment.bundle.items.map((item) => {
                const thumb = item.imageUrl ?? item.thumbnailUrl;
                return (
                  <div key={`${item.itemType}-${item.itemId}`} className="flex items-center gap-3 p-3 bg-[#F7F8F9] rounded-2xl">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F1F3F6] shrink-0">
                      {thumb && <Thumbnail url={thumb} className="w-full h-full" aspectRatio={1}/>}
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
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-white pt-16 pb-24">
      {/* 우측 상단 프로필(로그인/로그아웃) — 웹 전용 */}
      {payment.user && (
        <PaymentProfileButton
          name={payment.user.name ?? payment.user.nickName ?? undefined}
          profileImageUrl={payment.user.profileImageUrl ?? undefined}
          locale={locale}
        />
      )}

      <div className="mx-auto w-full max-w-[1120px] px-8">
        {/* 뒤로 — PC는 앱 헤더가 없어 페이지 안에 두어야 이탈 경로가 생긴다 */}
        <PcBackLink label={await translate('back')} />
        <h1 className="text-[26px] font-bold text-black mb-6">{await translate('payment')}</h1>

        {/* 와이드 히어로 — 컨텐츠 전체 폭 16:9 */}
        {heroImageUrl && (
          <div className="relative w-full aspect-[16/9] max-h-[420px] rounded-3xl overflow-hidden bg-[#F1F3F6] mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImageUrl} alt={title ?? ''} className="w-full h-full object-cover" />
          </div>
        )}

        {/* 2열 배치(좌: 상세+결제섹션 / 우: 결제 정보+버튼)는 UnifiedPaymentInfo가 처리 */}
        {paymentItem === 'practice-room' ? (
          <PracticeRoomPaymentWrapper
            payment={payment}
            studioRoomId={itemId}
            description={payment.studioRoom?.description}
            url={apiUrl}
            appVersion={appVersion}
            os={os}
            beforeDepositor={beforeDepositor}
            locale={locale}
            actualPayerUserId={actualPayerUserId}
            isProxyPayment={isProxyPayment}
            preStartTime={preStartTime}
            preEndTime={preEndTime}
            layout="pc"
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
            layout="pc"
            detailsSlot={productDetails}
          />
        )}
      </div>
    </div>
  );
}
