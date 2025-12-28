import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {SellerInformation} from "@/app/lessons/[id]/payment/SellerInformation";
import {RefundInformation} from "@/app/lessons/[id]/payment/RefundInformation";
import React from "react";
import {RippleEffect} from "./RippleEffect";
import {PaymentRecordDetailMoreButton} from "./PaymentRecordDetailMoreButton";
import {GetPaymentRecordResponse, PaymentRecordStatus} from "@/app/endpoint/payment.record.endpoint";
import {translate} from "@/utils/translate";
import {statusLabelMap} from "@/app/paymentRecords/PaymentRecordItem";
import {BankOrCardIcon} from "@/app/components/Bank";
import {PaymentMethodLabel} from "@/app/components/PaymentMethodLabel";
import {Locale} from "@/shared/StringResource";
import Image from "next/image";
import GrayRightArrow from "../../../../public/assets/gray_right_arrow.svg";
import PassPlanIcon from "../../../../public/assets/ic_pass_plan.svg";

const statusColorMap: Record<PaymentRecordStatus, string> = {
  [PaymentRecordStatus.Completed]: "text-[#3d9442]",
  [PaymentRecordStatus.Settled]: "text-[#3d9442]",
  [PaymentRecordStatus.Cancelled]: "text-[#e55b5b]",
  [PaymentRecordStatus.Pending]: "text-[#e5aa00]",
  [PaymentRecordStatus.Failed]: "text-[#e55b5b]",
};

export const PaymentRecordDetailForm = async ({paymentRecord, locale}: {
  paymentRecord: GetPaymentRecordResponse,
  locale: Locale
}) => {
  const statusColor = statusColorMap[paymentRecord.status] || "text-gray-500";

  // paymentId의 마지막 부분 확인 (예: "ABC-123-LP" -> "LP")
  const parts = paymentRecord.paymentId.split('-');
  const displayPaymentId = parts[parts.length - 1]; // 마지막 부분만 표시
  const isPassPlan = paymentRecord.paymentId.startsWith('LP');
  const isLessonTicket = paymentRecord.paymentId.startsWith('LT');
  const informationTitle = isPassPlan
      ? await translate('pass_plan_information')
      : isLessonTicket
          ? await translate('lesson_ticket_information')
          : await translate('pass_plan_information');

  return (
      <div className="bg-white min-h-screen">
        <div className="px-5 py-5">
          <p className={`text-[16px] font-bold ${statusColor} mb-3`}>
            {await translate(statusLabelMap[paymentRecord.status])}
          </p>
          <div className="flex items-center gap-2 text-[12px] text-[#6d7882] font-medium">
            <span>{await translate('payment_id')}</span>
            <span>{displayPaymentId}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

         {/* 패스권/수강권 정보 */}
         <div className="px-5 py-5">
           <p className="text-[16px] font-bold text-black mb-5">
             {informationTitle}
           </p>
           <NavigateClickWrapper method={'push'} route={paymentRecord.productRoute || ''}>
             <RippleEffect className="flex items-center justify-between h-14 active:bg-gray-100 transition-colors -mx-5 px-5">
              <div className="flex items-center gap-2">
                {isLessonTicket ? (
                    <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                          src={paymentRecord.productImageUrl ?? ''}
                          alt={paymentRecord.productName}
                          width={48}
                          height={64}
                          className="w-full h-full object-cover"
                      />
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
             </RippleEffect>
           </NavigateClickWrapper>
        </div>

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 결제 정보 */}
        <div className="px-5 py-5">
          <p className="text-[16px] font-bold text-black mb-4">{await translate('payment_information_title')}</p>
          <div className="flex flex-col gap-4">
            {/* 결제 금액 */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-black">{await translate('payment_amount')}</span>
              <span className="text-[14px] font-bold text-black">
              {new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}원
            </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e6e8ea]"/>

            {/* 결제 일시 */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-black">{await translate('payment_datetime')}</span>
              <span className="text-[14px] font-medium text-black">
              {paymentRecord.createdAt}
            </span>
            </div>

            {/* 확인 일시 (환불 대기/취소일 때만) */}
            {paymentRecord.confirmedAt &&
                <div className="flex items-center justify-between">
                    <span
                        className="text-[14px] font-medium text-black">{await translate('confirmation_datetime')}</span>
                    <span className="text-[14px] font-medium text-black">
                {paymentRecord.confirmedAt}
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
                  <div className="flex items-center gap-2">
                    <BankOrCardIcon name={paymentRecord.paymentMethodLabel} scale={100}/>
                    <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.paymentMethodLabel}</span>
                    <span className="text-[14px] font-medium text-[#191f28] text-right">1000-1000-1010-1010</span>
                  </div>
                </div>
            ) : paymentRecord.depositor && (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-black">{await translate('depositor_name')}</span>
                  <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.depositor}</span>
                </div>
            )}
          </div>
        </div>

        {/* 취소 정보 (환불 대기/취소일 때만) */}
        {(paymentRecord.status === PaymentRecordStatus.Pending || paymentRecord.status === PaymentRecordStatus.Cancelled) && (
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
                  {new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}원
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
                <p className="text-[12px] font-medium text-[#6d7882] mt-4">
                  {await translate('refund_notice_studio')}
                </p>
              </div>
            </>
        )}

        {/* Spacer */}
        <div className="h-3 bg-[#f9f9fb]"/>

        {/* 판매자 정보 및 환불안내 */}
               <div className="px-5 py-5">
                 <div className="py-5 space-y-6">
                   {paymentRecord.studio && <SellerInformation studio={paymentRecord.studio} locale={locale}/>}
                   <RefundInformation locale={locale} paymentId={paymentRecord.paymentId} isRefundable={paymentRecord.isRefundable}/>
                 </div>
               </div>
      </div>
  );
}
