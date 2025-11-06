import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { translate } from "@/utils/translate";
import { PaymentRecordItem } from "@/app/paymentRecords/PaymentRecordItem";

export default async function PaymentRecordsPage() {
  const res = await getPaymentRecordsAction({});

  if ('paymentRecords' in res) {
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
        <div className={'flex flex-col'}>
          {res.paymentRecords && res.paymentRecords.length > 0 ?

            res.paymentRecords.map((paymentRecord, idx) => {
              return <PaymentRecordItem paymentRecord={paymentRecord} key={idx}/>
            })
            : <div className={'text-black items-center text-center mt-40 font-medium'}>
              {await translate('no_purchase_history')}
            </div>
          }
        </div>
      </div>
    );
  } else {
    return <div className="text-black">{res.message}</div>;
  }
}