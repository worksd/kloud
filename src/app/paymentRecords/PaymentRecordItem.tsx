'use client';

import Image from "next/image";
import { GetPaymentRecordResponse, PaymentRecordStatus } from "@/app/endpoint/payment.record.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { parsePaymentDate } from "@/app/paymentRecords/payment.date";
import { PaymentMethodIcon } from "@/app/components/PaymentMethodIcon";
import { ReceiptFlatIcon } from "@/app/profile/ActivityIcons";

export const statusLabelMap: Record<PaymentRecordStatus, StringResourceKey> = {
  Completed: 'payment_record_completed',
  Cancelled: 'payment_record_cancelled',
  Pending: 'payment_record_pending',
  Settled: 'payment_record_completed',
  Failed: 'payment_record_failed',
  CancelPending: 'payment_record_cancel_pending'
};

// 상태 칩 — 수강 내역/패스권 목록과 같은 톤. 완료는 연회색(기본), 대기 노랑, 취소·실패 빨강
export const statusBadgeStyle: Record<PaymentRecordStatus | "default", string> = {
  [PaymentRecordStatus.Completed]: "bg-[#F2F4F6] text-[#4E5968]",
  [PaymentRecordStatus.Settled]: "bg-[#F2F4F6] text-[#4E5968]",
  [PaymentRecordStatus.Cancelled]: "bg-[#FDECEC] text-[#E55B5B]",
  [PaymentRecordStatus.Pending]: "bg-[#FFF8EC] text-[#A05A00]",
  [PaymentRecordStatus.Failed]: "bg-[#FDECEC] text-[#E55B5B]",
  [PaymentRecordStatus.CancelPending]: "bg-[#FFF3E8] text-[#E67E22]",
  default: "bg-[#F2F4F6] text-[#8B95A1]",
};

export const PaymentStatusBadge = ({status, locale}: { status: PaymentRecordStatus, locale: Locale }) => {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px]",
        "whitespace-nowrap shrink-0",
        statusBadgeStyle[status] ?? statusBadgeStyle.default,
      ].join(" ")}
    >
      {getLocaleString({locale, key: statusLabelMap[status]})}
    </span>
  );
};

// 결제내역 행 — [썸네일] [상품명 / 카드사 로고+결제수단 (+비정상 상태 칩)] [금액 / 결제 시각].
// 날짜는 리스트의 날짜 헤더가 담당하고, 시각은 금액 아래 오른쪽에 작게. 정상 완료엔 상태 칩을 안 그려 소음을 줄인다.
export const PaymentRecordItem = ({
  paymentRecord,
  locale,
}: {
  paymentRecord: GetPaymentRecordResponse;
  locale: Locale;
}) => {
  const isCancelled = paymentRecord.status === PaymentRecordStatus.Cancelled || paymentRecord.status === PaymentRecordStatus.Failed;
  const isCompleted = paymentRecord.status === PaymentRecordStatus.Completed || paymentRecord.status === PaymentRecordStatus.Settled;
  const parsed = parsePaymentDate(paymentRecord.createdAt, locale);
  const imageUrl = paymentRecord.productImageUrl || paymentRecord.studio?.profileImageUrl;
  const amount = `${new Intl.NumberFormat('ko-KR').format(paymentRecord.amount)}${getLocaleString({ locale, key: 'won' })}`;

  return (
    <NavigateClickWrapper method="push" route={KloudScreen.PaymentRecordDetail(paymentRecord.paymentId)}>
      <div className="px-5 py-3.5 flex items-center gap-3.5 active:bg-[#F9FAFB] transition-colors select-none cursor-pointer">
        <div className={`relative w-[48px] h-[48px] rounded-[14px] overflow-hidden bg-[#F2F4F6] shrink-0 ${isCancelled ? 'grayscale opacity-60' : ''}`}>
          {imageUrl ? (
            <Image src={imageUrl} alt={''} fill sizes={'48px'} quality={50} className="object-cover"/>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center"><ReceiptFlatIcon size={22}/></span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <p className={`text-[15px] font-semibold leading-snug truncate tracking-[-0.3px] ${isCancelled ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>
            {paymentRecord.productName}
          </p>
          <div className="flex items-center gap-1.5 min-w-0">
            {paymentRecord.paymentMethodLabel && (
              <span className="flex items-center gap-1 min-w-0 text-[13px] text-[#8B95A1] tracking-[-0.2px]">
                <PaymentMethodIcon methodType={paymentRecord.methodType} label={paymentRecord.paymentMethodLabel} size={16}/>
                <span className="truncate">{paymentRecord.paymentMethodLabel}</span>
              </span>
            )}
            {/* 정상 완료(Completed/Settled)는 칩 생략 — 대기·취소·실패만 표시 */}
            {!isCompleted && <PaymentStatusBadge status={paymentRecord.status} locale={locale}/>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[15px] font-bold tracking-[-0.3px] ${isCancelled ? 'text-[#B0B8C1] line-through' : 'text-[#191F28]'}`}>
            {amount}
          </span>
          {parsed?.timeLabel && (
            <span className="text-[12px] text-[#B0B8C1] tracking-[-0.2px]">{parsed.timeLabel}</span>
          )}
        </div>
      </div>
    </NavigateClickWrapper>
  );
};
