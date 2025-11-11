import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { TicketItem } from "@/app/tickets/ticket.item";
import { translate } from "@/utils/translate";

export const PassTicketUsageHistory = async ({tickets}: { tickets?: TicketResponse[] }) => {
  return (
    <div className="flex flex-col">
      <div className={'text-[16px] font-medium text-black ml-6'}>{await translate('usage_information')}</div>
      {tickets && tickets.length > 0 ?
        tickets.map((item) => (
          <TicketItem
            key={item.id}
            item={item}
          />
        )) :
        <div className="flex justify-center w-full">
          <div
            className="py-10 font-medium text-[14px] text-center text-[#86898C]"
          >{await translate('no_used_pass')}</div>
        </div>
      }
    </div>
  )
}