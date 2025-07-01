import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import React from "react";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";
import { CardInformation } from "@/app/paymentRecords/[id]/CardInformation";
import { useLocale } from "@/hooks/useLocale";
import { translate } from "@/utils/translate";

export const PaymentRecordDetailForm = async ({paymentRecord}: { paymentRecord: GetPaymentRecordResponse }) => {
  return <div className="p-5 bg-white min-h-screen text-gray-900">
    <section className="mb-6">
      <h2 className="text-sm font-semibold mb-2">{await translate('purchase_history')}</h2>
      <NavigateClickWrapper method={'push'} route={paymentRecord.productRoute}>
        <div className="text-sm text-gray-900 border border-gray-100 rounded-xl p-4 shadow-sm bg-white">

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
    {/* 결제내역 */}
    <section className="mb-6">
      <h2 className="text-sm font-semibold mb-2">{await translate('payment_records')}</h2>
      <div className="flex justify-between text-base font-medium">
        <span>{await translate('purchase_amount')}</span>
        <span>{new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}{await translate('won')} </span>
      </div>
    </section>

    <hr className="my-4"/>

    {/* 결제요금 */}
    <section className="space-y-3">
      <div className="flex justify-between text-base font-bold text-emerald-600">
        <span>{await translate('total_amount')}</span>
        <span>{new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}{await translate('won')}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>{await translate('payment_method')}</span>
        <span>{paymentRecord.paymentMethodLabel}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>{await translate('payment_datetime')}</span>
        <span>{paymentRecord.createdAt}</span>
      </div>
    </section>

    <hr className="my-4"/>

    <div className={'py-5 space-y-6'}>
      {paymentRecord.studio && <SellerInformation studio={paymentRecord.studio}/>}
      <RefundInformation/>
      {paymentRecord.receiptUrl && (
        <CardInformation receiptUrl={paymentRecord.receiptUrl}/>
      )}
    </div>

  </div>
}