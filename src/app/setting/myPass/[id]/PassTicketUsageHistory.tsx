import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { TicketItem } from "@/app/tickets/ticket.item";

export const PassTicketUsageHistory = ({tickets}: { tickets: TicketResponse[] }) => {
  return (
    <div className="flex flex-col">
      {tickets.map((item) => (
        <TicketItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  )
}