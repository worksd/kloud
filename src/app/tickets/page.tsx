import { Props } from "@/app/studios/[id]/page";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { TicketItem } from "@/app/tickets/ticket.item";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { api } from "@/app/api.client";
import { NoItems } from "@/app/components/NoItem";

async function TicketList() {
  const res = await api.ticket.list({});

  if ('tickets' in res) {
    if (res.tickets.length as number === 0) {
      return <NoItems title={"구매 내역이 존재하지 않습니다"} description={"새로운 클래스를 수강해보세요!"} />;
    }

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

  return <NoItems title={"구매 내역이 존재하지 않습니다"} description={"새로운 클래스를 수강해보세요!"} />;

}

export default function TicketDetail({ params }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <TicketList />
    </Suspense>
  );
}