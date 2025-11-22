import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {SellerInformation} from "@/app/lessons/[id]/payment/SellerInformation";
import {RefundInformation} from "@/app/lessons/[id]/payment/RefundInformation";
import React from "react";
import {GetPaymentRecordResponse, PaymentRecordStatus} from "@/app/endpoint/payment.record.endpoint";
import {translate} from "@/utils/translate";
import {statusLabelMap} from "@/app/paymentRecords/PaymentRecordItem";
import {BankOrCardIcon} from "@/app/components/Bank";
import {PaymentMethodLabel} from "@/app/components/PaymentMethodLabel";
import {Locale} from "@/shared/StringResource";

const badgeClassByStatus: Record<PaymentRecordStatus | "default", string> = {
  [PaymentRecordStatus.Completed]: "bg-green-50 text-green-700",
  [PaymentRecordStatus.Settled]: "bg-green-50 text-green-700",
  [PaymentRecordStatus.Cancelled]: "bg-red-50 text-red-600",
  [PaymentRecordStatus.Pending]: "bg-yellow-50 text-yellow-700",
  [PaymentRecordStatus.Failed]: "bg-rose-50 text-rose-700",
  default: "bg-gray-100 text-gray-500",
};

export const PaymentRecordDetailForm = async ({paymentRecord, locale}: {
  paymentRecord: GetPaymentRecordResponse,
  locale: Locale
}) => {

  return <div className="px-5 bg-white min-h-screen text-gray-900">
    <section className="mb-2">
      <NavigateClickWrapper method={'push'} route={paymentRecord.productRoute}>
        <div className="flex flex-col text-sm text-gray-900 border border-gray-100 rounded-xl p-4 shadow-sm bg-white">
          <span
              className={[
                "inline-flex w-fit items-center px-1 py-0.5 mb-2 rounded-md font-bold font-paperlogy",
                badgeClassByStatus[paymentRecord.status] ?? badgeClassByStatus.default,
              ].join(" ")}
          >
  {await translate(statusLabelMap[paymentRecord.status])}
</span>
          <div className="flex items-start gap-4">
            {paymentRecord.productImageUrl && (
                <img
                    src={paymentRecord.productImageUrl}
                    alt={paymentRecord.productName}
                    className="w-16 h-16 rounded-lg object-cover"
                />
            )}
            <div className="flex-1">
              <div className="text-base font-semibold">{paymentRecord.productName}</div>
              {paymentRecord.productDescription &&
                  <div className="text-xs text-gray-500 mt-1">{paymentRecord.productDescription}</div>
              }
            </div>
          </div>


          <div className="mt-4 border-t pt-3 text-xs text-gray-500">
            {await translate('payment_id')} <span className="text-gray-400 font-medium">{paymentRecord.paymentId}</span>
          </div>
        </div>
      </NavigateClickWrapper>
    </section>
    {paymentRecord.status === PaymentRecordStatus.Pending && (
        <div className="rounded-xl border border-gray-100 bg-white/80 shadow-sm p-1 flex flex-col">
          <div className={'ml-4 mt-2 text-[13px] font-bold'}>{await translate('account_transfer_information')}</div>
          <div className="flex items-center gap-1">
            {/* 아이콘 배지 */}
            <div className="pl-4 pt-2 pr-2 pb-2">
              <BankOrCardIcon name={paymentRecord.studio?.bank ?? ''} scale={100}/>
            </div>

            {/* 텍스트 영역 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-500 truncate">{paymentRecord.studio?.bank || '은행'}</span>
              </div>

              <div className="mt-0.5 text-[15px] font-semibold text-black tracking-wider tabular-nums">
                {paymentRecord.studio?.accountNumber || '—'}({paymentRecord.studio?.depositor})
              </div>
            </div>
          </div>
        </div>
    )}
    {/* 결제내역 */}
    {(paymentRecord.status === PaymentRecordStatus.Completed || paymentRecord.status === PaymentRecordStatus.Cancelled) && (
        <div>
          <hr className="my-4"/>

          {/* 결제요금 */}
          <section className="space-y-3">
            <div className="flex justify-between text-base font-bold text-emerald-600">
              <span>{await translate('total_amount')}</span>
              <span>{new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}{await translate('won')}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{await translate('payment_method')}</span>

              <span className="flex items-center gap-1.5 text-gray-600">
              <PaymentMethodLabel paymentMethod={paymentRecord.paymentMethodLabel}/>
            </span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{await translate('payment_datetime')}</span>
              <span>{paymentRecord.createdAt}</span>
            </div>
          </section>
        </div>
    )}


    <hr className="my-4"/>

    <div className={'py-5 space-y-6'}>
      {paymentRecord.studio && <SellerInformation studio={paymentRecord.studio} locale={locale}/>}
      <RefundInformation locale={locale}/>
    </div>

  </div>
}