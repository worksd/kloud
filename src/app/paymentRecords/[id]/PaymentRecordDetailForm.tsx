import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {SellerInformation} from "@/app/lessons/[id]/payment/SellerInformation";
import {RefundInformation} from "@/app/lessons/[id]/payment/RefundInformation";
import React from "react";
import {RippleEffect} from "./RippleEffect";
import {PaymentRecordDetailMoreButton} from "./PaymentRecordDetailMoreButton";
import {GetPaymentRecordResponse, PaymentRecordStatus} from "@/app/endpoint/payment.record.endpoint";
import {translate} from "@/utils/translate";
import {statusLabelMap, statusBadgeStyle, PaymentStatusBadge} from "@/app/paymentRecords/PaymentRecordItem";
import {BankOrCardIcon} from "@/app/components/Bank";
import {PaymentMethodLabel} from "@/app/components/PaymentMethodLabel";
import {Locale} from "@/shared/StringResource";
import Image from "next/image";
import GrayRightArrow from "../../../../public/assets/gray_right_arrow.svg";
import PassPlanIcon from "../../../../public/assets/ic_pass_plan.svg";
import {formatAccountNumber} from "@/utils/format.account";

const formatCardNumber = (cardNumber?: string | null) => {
  if (!cardNumber) return '';
  const chars = cardNumber.replace(/[\s-]/g, '');
  return chars.replace(/(.{4})(?=.)/g, '$1-');
};


export const PaymentRecordDetailForm = async ({paymentRecord, locale}: {
  paymentRecord: GetPaymentRecordResponse,
  locale: Locale
}) => {
  // paymentId의 마지막 부분 확인 (예: "ABC-123-LP" -> "LP")
  const parts = paymentRecord.paymentId.split('-');
  const displayPaymentId = parts[parts.length - 1]; // 마지막 부분만 표시
  const isPassPlan = paymentRecord.paymentId.startsWith('LP');
  const isLessonTicket = paymentRecord.paymentId.startsWith('LT');
  const isMembership = paymentRecord.paymentId.startsWith('SM');
  const informationTitle = isPassPlan
      ? await translate('pass_plan_information')
      : isLessonTicket
          ? await translate('lesson_ticket_information')
          : await translate('pass_plan_information');
  
  // 금액 라벨 결정
  const amountLabel = isPassPlan
      ? await translate('pass_plan_price')
      : isLessonTicket
          ? await translate('lesson_price')
          : isMembership
              ? await translate('membership_price')
              : await translate('payment_amount');
  
  // 원래 가격 계산 (amount + discounts 합계)
  const totalDiscountAmount = paymentRecord.discounts?.reduce((sum, discount) => sum + discount.amount, 0) ?? 0;
  const originalAmount = paymentRecord.amount + totalDiscountAmount;
  
  // translate 미리 처리
  const wonText = await translate('won');
  const totalAmountText = await translate('total_amount');

  return (
      <div className="bg-white min-h-screen ">
        <div className="px-5 py-5 flex flex-col gap-3 items-start">
          <PaymentStatusBadge status={paymentRecord.status} locale={locale}/>
          <div className="flex items-center gap-2 text-[12px] text-[#6d7882] font-medium">
            <span>{await translate('payment_id')}</span>
            <span>{displayPaymentId}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

         {/* 패스권/수강권 정보 */}
         <NavigateClickWrapper method={'push'} route={paymentRecord.productRoute || ''}>
           <RippleEffect className="px-5 py-5 active:bg-gray-50 transition-colors">
             <p className="text-[16px] font-bold text-black mb-5">
               {informationTitle}
             </p>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isLessonTicket ? (
                    <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                      {paymentRecord.productImageUrl ? (
                        <Image
                            src={paymentRecord.productImageUrl}
                            alt={paymentRecord.productName}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F1F3F6] flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#C5C8CB" strokeWidth="1.5"/>
                            <circle cx="8.5" cy="10.5" r="1.5" stroke="#C5C8CB" strokeWidth="1.5"/>
                            <path d="M3 16l4.793-4.793a1 1 0 011.414 0L13 15l2.793-2.793a1 1 0 011.414 0L21 16" stroke="#C5C8CB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                 ) : (
                     <div className="w-6 h-6 flex-shrink-0">
                       <PassPlanIcon className="w-full h-full text-[#b1b8be]" />
                     </div>
                 )}
                <div className="flex flex-col">
                  <p className="text-[14px] font-medium text-black">{paymentRecord.productName}</p>
                  {paymentRecord.productDescription && (
                      <p className="text-[12px] text-[#6d7882]">{paymentRecord.productDescription}</p>
                  )}
                </div>
              </div>
               <GrayRightArrow className="w-6 h-6 text-[#b1b8be]"/>
             </div>
           </RippleEffect>
         </NavigateClickWrapper>

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 결제 정보 */}
        <div className="px-5 py-5">
          <p className="text-[16px] font-bold text-black mb-4">{await translate('payment_information_title')}</p>
          <div className="flex flex-col gap-4">
            {/* 결제 금액 (원래 가격 = amount + discounts 합계) */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#6d7882]">{amountLabel}</span>
              <span className="text-[14px] font-medium text-[#6d7882]">
                {new Intl.NumberFormat("ko-KR").format(originalAmount)}{wonText}
              </span>
            </div>

            {/* 할인 정보 */}
            {paymentRecord.discounts && paymentRecord.discounts.length > 0 && (
              <>
                {paymentRecord.discounts.map((discount, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-black">{discount.key}</span>
                    <span className="text-[14px] font-medium text-[#e55b5b]">
                      -{new Intl.NumberFormat("ko-KR").format(discount.amount)}{wonText}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* 총 결제 금액 */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-black">{totalAmountText}</span>
              <span className="text-[16px] font-bold text-black">
                {new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}{wonText}
              </span>
            </div>

            {/* Divider */}
            <div className="flex flex-col items-center justify-center py-[4px]">
              <div className="w-full h-px bg-[#d7dadd]"/>
            </div>

            {/* 결제 일시 */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-black">{await translate('payment_datetime')}</span>
              <span className="text-[14px] font-medium text-black">
              {paymentRecord.createdAt}
            </span>
            </div>

            {/* 확인 일시 (환불 대기/취소일 때만) */}
            {(paymentRecord.confirmedAt || paymentRecord.accountTransferConfirmDate) &&
                <div className="flex items-center justify-between">
                    <span
                        className="text-[14px] font-medium text-black">{await translate('confirmation_datetime')}</span>
                    <span className="text-[14px] font-medium text-black">
                {paymentRecord.accountTransferConfirmDate || paymentRecord.confirmedAt}
              </span>
                </div>
            }

            {/* 결제 수단 */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-black">{await translate('payment_method')}</span>
              <span className="text-[14px] font-medium text-[#191f28]">
              <PaymentMethodLabel paymentMethod={paymentRecord.paymentMethodLabel}/>
            </span>
            </div>

            {/* 카드 정보 또는 입금자명 */}
            {paymentRecord.methodType === 'credit' ? (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-black">{await translate('card_information')}</span>
                  <div className="flex items-center">
                    <span className="text-[14px] font-medium text-[#191f28] text-right">{formatCardNumber(paymentRecord.cardNumber)}</span>
                  </div>
                </div>
            ) : paymentRecord.depositor && (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-black">{await translate('depositor_name')}</span>
                  <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.depositor}</span>
                </div>
            )}

            {/* 입금할 계좌 정보 (계좌이체일 때만) */}
            {paymentRecord.methodType === 'account_transfer' && paymentRecord.studio?.bank && (
                <>
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium text-black">{await translate('deposit_account_information')}</span>
                        <div className="flex items-center gap-1">
                            <BankOrCardIcon name={paymentRecord.studio.bank} scale={75}/>
                            <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.studio.bank}</span>
                            <span className="text-[14px] font-medium text-[#191f28]">{formatAccountNumber(paymentRecord.studio.accountNumber, paymentRecord.studio.bank)}</span>
                        </div>
                    </div>
                    {paymentRecord.studio.depositor && (
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-black">{await translate('account_holder')}</span>
                            <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.studio.depositor}</span>
                        </div>
                    )}
                </>
            )}
          </div>
        </div>

        {/* 취소 정보 (환불 대기/취소일 때만) */}
        {(paymentRecord.status === PaymentRecordStatus.Cancelled || paymentRecord.status === PaymentRecordStatus.CancelPending) && (
            <>
              {/* Spacer */}
              <div className="h-3 bg-[#f9f9fb]"/>

              <div className="px-5 py-5">
                <p className="text-[16px] font-bold text-black mb-4">{await translate('cancellation_information')}</p>
                <div className="flex flex-col gap-4">
                  {/* 환불 금액 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-black">{await translate('refund_amount')}</span>
                    <span className="text-[14px] font-bold text-[#191f28]">
                  {new Intl.NumberFormat("ko-KR").format(paymentRecord.refundAmount ?? paymentRecord.amount)}원
                </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-[#e6e8ea]"/>

                  {/* 취소 일시 */}
                  {paymentRecord.cancelledAt && (
                      <div className="flex items-center justify-between">
                        <span
                            className="text-[14px] font-medium text-black">{await translate('cancellation_datetime')}</span>
                        <span className="text-[14px] font-medium text-[#191f28]">
                    {paymentRecord.cancelledAt}
                  </span>
                      </div>
                  )}

                  {/* 취소 사유 */}
                  {paymentRecord.cancelReason &&
                      <div className="flex items-center justify-between">
                          <span
                              className="text-[14px] font-medium text-black">{await translate('cancellation_reason')}</span>
                          <span
                              className="text-[14px] font-medium text-[#191f28]">{paymentRecord.cancelReason}</span>
                      </div>
                  }

                  {/* 환불 계좌 */}
                  {paymentRecord.refundAccountBank && (
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium text-black">{await translate('refund_account')}</span>
                        <div className="flex items-center gap-1">
                          <BankOrCardIcon name={paymentRecord.refundAccountBank} scale={100}/>
                          <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.refundAccountBank}</span>
                          <span
                              className="text-[14px] font-medium text-[#191f28]">{paymentRecord.refoundAccountNumber}</span>
                        </div>
                      </div>
                  )}
                </div>
                {paymentRecord.methodType === 'credit' ? (
                    <p className="text-[12px] font-medium text-[#6d7882] mt-4">
                      {await translate('refund_processing_time_note')}
                    </p>
                ) : (paymentRecord.methodType === 'admin' || paymentRecord.methodType === 'account_transfer') ? (
                    <p className="text-[12px] font-medium text-[#6d7882] mt-4">
                      {await translate('refund_notice_studio')}
                    </p>
                ) : null}
              </div>
            </>
        )}

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 판매자 정보 및 환불안내 */}
        <div className="px-5 py-5">
          <p className="text-[16px] font-bold text-black mb-5">{await translate('seller_information')}</p>
          <div className="space-y-6">
            {paymentRecord.studio && <SellerInformation studio={paymentRecord.studio} locale={locale}/>}
            <RefundInformation locale={locale} paymentId={paymentRecord.paymentId} isRefundable={paymentRecord.isRefundable}/>
          </div>
        </div>
      </div>
  );
}
