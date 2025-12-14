import React from "react";
import { PaymentRecordRefundForm } from "@/app/paymentRecords/[id]/refund/PaymentRecordRefundForm";
import { getLocale, translate } from "@/utils/translate";
import { getRefundPreview } from "@/app/paymentRecords/[id]/refund/get.refund.preview.action";
import { getPaymentRecordDetail } from "@/app/lessons/[id]/action/get.payment.record.detail";

export default async function PaymentRecordRefundPage({params}: { params: Promise<{ id: string }> }) {
  const paymentId = (await params).id;
  const [refundPreview, paymentRecord] = await Promise.all([
    getRefundPreview({paymentId}),
    getPaymentRecordDetail({paymentId}),
  ]);

  if ('paymentId' in refundPreview) {
    return (
      <div>
        <PaymentRecordRefundForm 
          refundPreview={refundPreview} 
          studio={('studio' in paymentRecord) ? paymentRecord.studio : undefined}
          locale={await getLocale()}
        />
      </div>
    );
  } else {
    return <div className="text-center mt-10 text-gray-500">{await translate('payment_not_found')}</div>;
  }
}

