import {SellerInformation} from "@/app/lessons/[id]/payment/SellerInformation";
import {RefundInformation} from "@/app/lessons/[id]/payment/RefundInformation";
import React from "react";
import {GetRefundPreviewResponse} from "@/app/endpoint/payment.record.endpoint";
import {translate} from "@/utils/translate";
import {BankOrCardIcon} from "@/app/components/Bank";
import {Locale} from "@/shared/StringResource";
import {GetStudioResponse} from "@/app/endpoint/studio.endpoint";
import Image from "next/image";
import {RefundDialog} from "./RefundDialog";
import {RefundFormActions} from "./RefundFormActions";
import {RefundAccountSection} from "./RefundAccountSection";
import {RefundMethodTitle} from "./RefundMethodTitle";

export const PaymentRecordRefundForm = async ({refundPreview, studio, locale}: {
  refundPreview: GetRefundPreviewResponse,
  studio?: GetStudioResponse,
  locale: Locale
}) => {
  const refundAmount = refundPreview.refundAmount;
  const totalAmount = refundPreview.amount;
  const deductedAmount = refundPreview.amount - refundPreview.refundAmount;
  const usedCount = refundPreview.pass?.usedCount || 0;
  const usedLessons = refundPreview.pass?.usedLessons || [];

  // 카드 번호 포맷팅: 4자리마다 "-" 추가 (모든 문자 포함)
  const formatCardNumber = (cardNumber: string) => {
    // 기존 하이픈 제거 후 모든 문자를 4자리씩 그룹화
    const withoutHyphens = cardNumber.replace(/-/g, '');
    return withoutHyphens.match(/.{1,4}/g)?.join('-') || withoutHyphens;
  };

  return (
      <div className="bg-white min-h-screen">
        <RefundDialog refundReconsiderMessage={refundPreview.refundReconsiderMessage}/>

        {/* 환불 예상 금액 */}
        <div className="px-5 pt-3 pb-5">
          <div className="flex flex-col gap-0">
            <p className="text-[24px] font-bold text-black leading-[1.5]">
              <span
                  className="text-[#e55b5b]">{new Intl.NumberFormat("ko-KR").format(refundAmount)}{await translate('won')}</span>이
            </p>
            <p className="text-[24px] font-bold text-black leading-[1.5]">
              {await translate('refund_will_be_processed')}
            </p>
          </div>
        </div>

        {/* 사용한 수강권 목록 */}
        {refundPreview.pass && usedCount > 0 && (
            <>
              {/* Spacer */}
              <div className="h-3 bg-[#f9f9fb]"/>

              <div className="px-5 py-5">
                <p className="text-[16px] font-medium text-black mb-4">
                  {(await translate('total_used_count')).replace('{count}', usedCount.toString())}
                </p>
                <div className="flex flex-col gap-4">
                  {usedLessons.map((lesson, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                            {lesson.imageUrl ? (
                                <Image
                                    src={lesson.imageUrl}
                                    alt={lesson.name}
                                    width={48}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200"/>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-[14px] font-medium text-black">{lesson.name}</p>
                            {lesson.date && (
                                <p className="text-[12px] text-[#6d7882]">{lesson.date}</p>
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </>
        )}

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 환불 정보 */}
        <div className="px-5 py-5">
          <p className="text-[16px] font-bold text-black mb-4">{await translate('refund_information_title')}</p>
          <div className="flex flex-col gap-4">
            {/* 결제 금액 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-black">{await translate('payment_amount')}</span>
                <span className="text-[14px] font-medium text-black text-right">
                {new Intl.NumberFormat("ko-KR").format(totalAmount)}{await translate('won')}
              </span>
              </div>
              <p className="text-[12px] text-[#6d7882]">{refundPreview.productName}</p>
            </div>

            {/* 차감 금액 */}
            <div className="flex flex-col gap-2">
              {deductedAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-black">{await translate('deducted_amount')}</span>
                    <span className="text-[14px] font-medium text-black text-right">
                      {deductedAmount > 0 ? '-' : ''}{new Intl.NumberFormat("ko-KR").format(deductedAmount)}{await translate('won')}
                    </span>
                  </div>
              )}
              {/* 환불 기준 */}
              <div className="bg-[#f9f9fb] rounded-[8px] p-3">
                <p className="text-[12px] font-bold text-[#6d7882] mb-2">{await translate('refund_criteria')}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center pb-1 border-b border-[#e6e8ea]">
                    <div className="w-[150px]">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('refund_reason_date')}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('refund_amount_label')}</p>
                    </div>
                  </div>
                  <div className="flex items-center h-[18px]">
                    <div className="w-[150px]">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('lesson_time_one_third_before')}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('refund_two_thirds_after_deduction')}</p>
                    </div>
                  </div>
                  <div className="flex items-center h-[18px]">
                    <div className="w-[150px]">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('lesson_time_one_half_before')}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('refund_one_half_after_deduction')}</p>
                    </div>
                  </div>
                  <div className="flex items-center h-[18px]">
                    <div className="w-[150px]">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('lesson_time_one_half_after')}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#6d7882]">{await translate('refund_not_available')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <ul className="text-[12px] font-medium text-[#6d7882] list-disc list-inside">
                    <li>{await translate('lesson_time_calculation_note')}</li>
                    <li>{await translate('pass_refund_note')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e6e8ea]"/>

            {/* 환불 예상 금액 */}
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-bold text-[#e55b5b]">{await translate('expected_refund_amount')}</span>
              <span className="text-[16px] font-bold text-[#e55b5b] text-right">
              {new Intl.NumberFormat("ko-KR").format(refundAmount)}{await translate('won')}
            </span>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 환불 수단 */}
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[16px] font-bold text-black">{await translate('refund_method')}</p>
            <RefundMethodTitle refundPreview={refundPreview} locale={locale} />
          </div>
          <div className="flex flex-col gap-4 mt-6">
            {refundPreview.methodType === 'credit' && refundPreview.methodLabel && (
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-black">{await translate('refund_method')}</span>
                <div className="flex items-center gap-1">
                  <BankOrCardIcon name={refundPreview.methodLabel} scale={75} />
                  <span className="text-[14px] font-medium text-[#191f28]">{refundPreview.methodLabel}</span>
                </div>
              </div>
            )}
            {refundPreview.cardNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-black">{await translate('card_information')}</span>
                  <span className="text-[14px] font-medium text-[#191f28] text-right">
                    {formatCardNumber(refundPreview.cardNumber)}
                  </span>
                </div>
            )}
            {(refundPreview.methodType === 'account_transfer' || refundPreview.methodType === 'admin') && (
                <RefundAccountSection
                    refundPreview={refundPreview}
                    locale={locale}
                />
            )}
          </div>
          {refundPreview.methodType === 'credit' ? (
              <p className="text-[12px] font-medium text-[#6d7882] mt-4">
                {await translate('refund_processing_time_note')}
              </p>
          ) : (refundPreview.methodType === 'admin' || refundPreview.methodType === 'account_transfer') ? (
              <p className="text-[12px] font-medium text-[#6d7882] mt-4">
                {await translate('refund_notice_studio')}
              </p>
          ) : null}
        </div>

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 환불 사유 및 환불하기 버튼 */}
        <RefundFormActions locale={locale} />

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 판매자 정보 및 환불안내 */}
        <div className="px-5 py-5 pb-32">
          <div className="py-5 space-y-6">
            {studio && <SellerInformation studio={studio} locale={locale}/>}
            <RefundInformation locale={locale} paymentId={refundPreview.paymentId} isRefundable={false}/>
          </div>
        </div>
      </div>
  );
}

