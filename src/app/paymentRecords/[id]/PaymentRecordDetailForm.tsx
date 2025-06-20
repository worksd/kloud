'use client'

import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import React from "react";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";
import { CardInformation } from "@/app/paymentRecords/[id]/CardInformation";
import { useLocale } from "@/hooks/useLocale";

export const PaymentRecordDetailForm = ({paymentRecord}: { paymentRecord: GetPaymentRecordResponse }) => {
  const {t} = useLocale()
  return <div className="p-5 bg-white min-h-screen text-gray-900">
    {/* Header */}
    <section className="mb-6">
      <h2 className="text-sm font-semibold mb-2">구매내역</h2>
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
            결제번호 <span className="text-gray-400 font-medium">{paymentRecord.paymentId}</span>
          </div>
        </div>
      </NavigateClickWrapper>
    </section>
    {/* 결제내역 */}
    <section className="mb-6">
      <h2 className="text-sm font-semibold mb-2">결제내역</h2>
      <div className="flex justify-between text-base font-medium">
        <span>이용요금</span>
        <span>{new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}{t('won')} </span>
      </div>
    </section>

    <hr className="my-4"/>

    {/* 결제요금 */}
    <section className="space-y-3">
      <div className="flex justify-between text-base font-bold text-emerald-600">
        <span>결제요금</span>
        <span>{new Intl.NumberFormat("ko-KR").format(paymentRecord.amount)}{t('won')}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>결제수단</span>
        <span>{paymentRecord.paymentMethodLabel}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>결제일시</span>
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