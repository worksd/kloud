import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { TicketItem } from "@/app/tickets/ticket.item";
import { PaymentRecordPassItem } from "@/app/paymentRecords/PaymentRecordPassItem";
import { translate } from "@/utils/translate";

export default async function PaymentRecordsPage() {
  const res = await getPaymentRecordsAction({});

  if ('paymentRecords' in res) {
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="payment_records"/>
        </div>
        <div className={'text-black'}>
          {res.paymentRecords && res.paymentRecords.length > 0 ?

            res.paymentRecords.map((paymentRecord, idx) => {
              if (paymentRecord.pass != null) {
                return <PaymentRecordPassItem pass={paymentRecord.pass} key={idx}/>
              }

              if (paymentRecord.ticket != null) {
                return <TicketItem item={paymentRecord.ticket} key={idx}/>
              }

              return null;
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