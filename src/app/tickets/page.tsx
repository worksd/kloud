import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { TicketItem } from "@/app/tickets/ticket.item";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { api } from "@/app/api.client";
import { translate } from "@/utils/translate";

export default async function TicketListPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <TicketList/>
    </Suspense>
  );
}

async function TicketList() {
  const res = await api.ticket.list({});

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="payment_records"/>
      </div>

      {('tickets' in res && res.tickets.length > 0) ? (
        <div className="flex flex-col">
          {res.tickets.map((item) => (
            <div className={'flex flex-col'} key={item.id}>
              <TicketItem item={item}/>
              <div className="w-full h-[2px] bg-[#F7F8F9]"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-[400px] flex flex-col items-center justify-center bg-white p-4">
          {/* 메시지 */}
          <h2 className="text-[20px] font-bold text-black mb-2">
            {await translate('no_payment_records_title')}
          </h2>

          <p className="text-[16px] text-[#86898C] text-center mb-8">
            {await translate('no_payment_records_message')}
          </p>
        </div>
      )}
    </div>
  );
}

