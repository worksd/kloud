import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { PassItem } from "@/app/setting/myPass/action/PassItem";
import { TicketItem } from "@/app/tickets/ticket.item";
import { ActivePassItem } from "@/app/setting/myPass/PassColumnList";
import { PaymentRecordPassItem } from "@/app/paymentRecords/PaymentRecordPassItem";

export default async function PaymentRecordsPage() {
  const res = await getPaymentRecordsAction({});

  if ('paymentRecords' in res) {
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="payment_records"/>
        </div>
        <div className={'text-black'}>
          {res.paymentRecords.map((paymentRecord, idx) => {
            if (paymentRecord.pass != null) {
              return <PaymentRecordPassItem pass={paymentRecord.pass} key={idx} />
            }

            if (paymentRecord.ticket != null) {
              return <TicketItem item={paymentRecord.ticket} key={idx} />
            }

            return null;
          })}

        </div>
      </div>
    );
  } else {
    return <div className="text-black">{res.message}</div>;
  }
}