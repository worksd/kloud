import { getPaymentRecordDetail } from "@/app/lessons/[id]/action/get.payment.record.detail";
import React from "react";
import { PaymentRecordDetailForm } from "@/app/paymentRecords/[id]/PaymentRecordDetailForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { translate } from "@/utils/translate";

export default async function PaymentRecordDetailPage({params}: { params: Promise<{ id: string }> }) {
  const paymentId = (await params).id;
  const paymentRecord = await getPaymentRecordDetail({paymentId});

  if (!('paymentId' in paymentRecord)) {
    return <div className="text-center mt-10 text-gray-500">{await translate('payment_not_found')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-14 px-6">
        <SimpleHeader titleResource="payment_records"/>
      </div>
      <PaymentRecordDetailForm paymentRecord={paymentRecord}/>
    </div>
  );
}
