import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { TicketItem } from "@/app/tickets/ticket.item";
import { TranslatableText } from "@/utils/TranslatableText";

export const PassTicketUsageHistory = ({tickets}: { tickets: TicketResponse[] }) => {
  return (
    <div className="flex flex-col">
      <TranslatableText className={'text-[16px] font-medium text-black ml-6'} titleResource={'usage_information'}/>
      {tickets.map((item) => (
        <TicketItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  )
}