import { GetPaymentRecordResponse, PaymentRecordStatus } from "@/app/endpoint/payment.record.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { StringResourceKey } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

const statusLabelMap: Record<PaymentRecordStatus, StringResourceKey> = {
  Completed: 'payment_record_completed',
  Cancelled: 'payment_record_cancelled',
  Pending: 'payment_record_pending',
  Settled: 'payment_record_completed',
};

export const PaymentRecordItem = async ({
                                          paymentRecord,
                                        }: {
  paymentRecord: GetPaymentRecordResponse;
}) => {
  return (
    <NavigateClickWrapper
      method="push"
      route={KloudScreen.PaymentRecordDetail(paymentRecord.paymentId)}
    >
      <div className="px-6 py-4 bg-white w-full max-w-screen-sm space-y-5 active:bg-gray-100 transition-all duration-150 select-none">
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
            className={`text-xs px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 font-bold font-paperlogy ${
              paymentRecord.status === PaymentRecordStatus.Completed ||
              paymentRecord.status === PaymentRecordStatus.Settled
                ? "bg-green-50 text-green-700"
                : paymentRecord.status === PaymentRecordStatus.Cancelled
                  ? "bg-red-50 text-red-600"
                  : paymentRecord.status === PaymentRecordStatus.Pending
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
            }`}
          >
            {await translate(statusLabelMap[paymentRecord.status])}
          </span>
        </div>

        {/* 디테일 */}
        <dl className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <dt className="text-gray-500">{await translate('payment_method')}</dt>
            <dd className="text-right font-medium">
              {paymentRecord.paymentMethodLabel}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-gray-500">{await translate('total_amount')}</dt>
            <dd className="text-right font-semibold text-gray-900">
              {paymentRecord.amount.toLocaleString() + await translate('won')}
            </dd>
          </div>

          {paymentRecord.depositor && (
            <div className="flex justify-between">
              <dt className="text-gray-500">{await translate('depositor_name')}</dt>
              <dd className="text-right font-medium">{paymentRecord.depositor}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* 하단 구분선 */}
      <div className="w-full h-1 bg-[#f7f8f9]" />
    </NavigateClickWrapper>
  );
};
