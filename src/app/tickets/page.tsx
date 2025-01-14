import { Props } from "@/app/studios/[id]/page";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { TicketItem } from "@/app/tickets/ticket.item";
import { Suspense } from "react";
import Loading from "@/app/loading";

export default async function StudioDetail({ params }: Props) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const tickets: TicketResponse[] = [
    {
      id: 0
    },
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
    {
      id: 4,
    }
  ]

  return (
    <Suspense fallback={<Loading/>}>
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader title="구매내역"/>
        </div>

        <div className="flex flex-col gap-4">  {/* gap-4로 간격 설정 */}
          {tickets.map((item, index) => (
            <TicketItem
              key={item.id}
            item={item}
            />
          ))}
        </div>
      </div>
    </Suspense>
  )
}

