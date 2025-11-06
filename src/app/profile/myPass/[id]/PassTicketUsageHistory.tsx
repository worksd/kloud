import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { TicketItem } from "@/app/tickets/ticket.item";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";

export const PassTicketUsageHistory = ({tickets, locale}: { tickets?: TicketResponse[], locale: Locale }) => {
  return (
    <div className="flex flex-col">
      <div className={'text-[16px] font-medium text-black ml-6'}>{getLocaleString({
        locale,
        key: 'usage_information'
      })}</div>
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
          >{getLocaleString({locale, key: 'no_used_pass'})}</div>
        </div>
      }
    </div>
  )
}