import { Props } from "@/app/studios/[id]/page";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { TicketItem } from "@/app/tickets/ticket.item";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { api } from "@/app/api.client";
import { NoItems } from "@/app/components/NoItem";

async function TicketList() {
  const res = await api.ticket.list({});

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="구매내역"/>
      </div>

      {('tickets' in res && res.tickets.length > 0) ? (
        <div className="flex flex-col">
          {res.tickets.map((item) => (
            <TicketItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      ) : (
        <NoItems
          title="구매 내역이 존재하지 않습니다"
          description="새로운 클래스를 수강해보세요!"
        />
      )}
    </div>
  );
}

export default function TicketDetail({params}: Props) {
  return (
    <Suspense fallback={<Loading/>}>
      <TicketList/>
    </Suspense>
  );
}