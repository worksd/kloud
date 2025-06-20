import Image from "next/image";
import { getPaymentRecordDetail } from "@/app/lessons/[id]/action/get.payment.record.detail";

export default async function PaymentRecordDetailPage({params}: { params: Promise<{ id: string }> }) {
  const paymentId = (await params).id
  const paymentRecord = (await getPaymentRecordDetail({paymentId}))

  if ('paymentId' in paymentRecord) {
    return (
      <div className={'flex flex-col'}>
        <div className={'text-black'}>Hello World </div>
        {paymentRecord.receiptUrl &&
          <iframe
            src="https://dashboard.tosspayments.com/receipt/sales-slip?transactionId=a5J9nJezoqMozwksvH3HbnsSoNWToINGHI1nNe1lPhcA8Bn5tKLyOTv4uDTW%2BVBC&ref=PX"
            style={{
              width: '100%',
              height: '1000px',
              border: 'none',
              overflow: 'hidden',
            }}
            scrolling="no"
          />
        }
      </div>
    )
  }
}