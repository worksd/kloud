'use client';

import { GetPaymentRecordResponse, PaymentRecordStatus } from "@/app/endpoint/payment.record.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { PaymentMethodLabel } from "@/app/components/PaymentMethodLabel";

export const statusLabelMap: Record<PaymentRecordStatus, StringResourceKey> = {
  Completed: 'payment_record_completed',
  Cancelled: 'payment_record_cancelled',
  Pending: 'payment_record_pending',
  Settled: 'payment_record_completed',
  Failed: 'payment_record_failed',
  CancelPending: 'payment_record_cancel_pending'
};

const statusBadgeStyle: Record<PaymentRecordStatus | "default", string> = {
  [PaymentRecordStatus.Completed]: "bg-green-50 text-green-700 ring-1 ring-green-200",
  [PaymentRecordStatus.Settled]: "bg-green-50 text-green-700 ring-1 ring-green-200",
  [PaymentRecordStatus.Cancelled]: "bg-red-50 text-red-700 ring-1 ring-red-200",
  [PaymentRecordStatus.Pending]: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  [PaymentRecordStatus.Failed]: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  [PaymentRecordStatus.CancelPending]: "bg-orange-50 text-[#E67E22] ring-1 ring-orange-200",
  default: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

export const PaymentRecordItem = ({
  paymentRecord,
  locale,
}: {
  paymentRecord: GetPaymentRecordResponse;
  locale: Locale;
}) => {
  return (
    <NavigateClickWrapper
      method="push"
      route={KloudScreen.PaymentRecordDetail(paymentRecord.paymentId)}
    >
      <div
        className="px-6 py-4 bg-white w-full max-w-screen-sm space-y-5 active:bg-gray-100 transition-all duration-150 select-none">
        {/* 헤더 */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <h2 className="text-[16px] font-semibold text-gray-900 truncate">
              {paymentRecord.productName}
            </h2>
            <p className="text-xs text-gray-400 tracking-tight truncate">
              {paymentRecord.paymentId}
            </p>
            <p className="text-sm text-gray-500">{paymentRecord.createdAt}</p>
          </div>

          <span
            className={[
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md",
              "whitespace-nowrap shrink-0 font-bold font-paperlogy",
              statusBadgeStyle[paymentRecord.status] ?? statusBadgeStyle.default,
            ].join(" ")}
          >
            {/* 작은 상태 점(더 예쁘게) */}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"/>
            {getLocaleString({ locale, key: statusLabelMap[paymentRecord.status] })}
          </span>
        </div>

        {/* 디테일 */}
        <dl className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <dt className="text-gray-500">{getLocaleString({ locale, key: 'payment_method' })}</dt>
            <dd className="text-right font-medium">
              <PaymentMethodLabel paymentMethod={paymentRecord.paymentMethodLabel}/>
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-gray-500">{getLocaleString({ locale, key: 'total_amount' })}</dt>
            <dd className="text-right font-semibold text-gray-900">
              {paymentRecord.amount.toLocaleString() + getLocaleString({ locale, key: 'won' })}
            </dd>
          </div>

          {paymentRecord.depositor && (
            <div className="flex justify-between">
              <dt className="text-gray-500">{getLocaleString({ locale, key: 'depositor_name' })}</dt>
              <dd className="text-right font-medium">{paymentRecord.depositor}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* 하단 구분선 */}
      <div className="w-full h-1 bg-[#f7f8f9]"/>
    </NavigateClickWrapper>
  );
};
