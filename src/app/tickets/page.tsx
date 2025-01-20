import { Props } from "@/app/studios/[id]/page";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { TicketItem } from "@/app/tickets/ticket.item";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { api } from "@/app/api.client";

async function TicketList() {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const res = await api.ticket.list({});

  if ('tickets' in res) {
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader title="구매내역"/>
        </div>

        <div className="flex flex-col gap-4">
          {res.tickets.map((item) => (
            <TicketItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>
    );
  }

  return <div className="text-black">아직 구매내역이 없습니다.</div>;
}

export default function TicketDetail({ params }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <TicketList />
    </Suspense>
  );
}