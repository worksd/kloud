import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Image from "next/image";
import { Thumbnail } from "@/app/components/Thumbnail";
import StampCancel from "../../../../public/assets/stamp_cancel.svg";
import StampUsed from "../../../../public/assets/stamp_used.svg";
import StampNotPaid from "../../../../public/assets/stamp_not_paid.svg";
import Logo from "../../../../public/assets/logo_white.svg";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { translate } from "@/utils/translate";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";

export async function TicketForm({ticket, isJustPaid, inviteCode}: {
  ticket: TicketResponse,
  isJustPaid: string,
  inviteCode: string
}) {
  return (
    <div className="flex flex-col bg-white">
      {/* Header */}
      {!inviteCode &&
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="ticket"/>
        </div>
      }

      <div className="flex flex-col p-6">
        <div className="flex flex-col mt-5 rounded-[16px] bg-black p-6 items-start">

          {(ticket.status == 'Cancelled' || ticket.status == 'Used' || ticket.status == 'Expired') &&
            <div className="absolute inset-0 bg-white/65 rounded-[16px]"/>}
          {ticket.status === 'Pending' && <div className={'flex flex-col mb-5'}><AccountTransferComponent
            title={ticket.lesson?.title}
            depositor={ticket.lesson?.studio?.depositor}
            bank={ticket.lesson?.studio?.bank}
            accountNumber={ticket.lesson?.studio?.accountNumber}
            price={ticket.lesson?.price}
          /></div>}
          <div className={"flex flex-row items-center"}>
            <Image
              className="w-[42px] h-[42px] rounded-full overflow-hidden flex-shrink-0 border border-[#F7F8F9]"
              src={ticket.user?.profileImageUrl ?? ''}
              alt={'로고 URL'}
              width={42}
              height={42}
            />
            <div className="flex flex-col ml-3">
              <div className="font-bold text-[18px]">
                {ticket.user?.nickName}
                {ticket.user?.name ? ` (${ticket.user.name})` : ""}
              </div>
              <div className="font-medium text-[14px]">
                {ticket.user?.email}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-0.5 relative">
          <Thumbnail url={ticket.lesson?.thumbnailUrl ?? ''}/>
          <div className="absolute inset-0 bg-black/65 rounded-[16px]"/>
          {ticket.status != 'Paid' && <div className="absolute inset-0 bg-white/65 rounded-[16px]"/>}

          <div className={"absolute inset-x-0 px-6"}>
            {ticket.rank &&
              <div className={"mt-3 text-[24px] text-white font-bold font-paperlogy"}>
                {ticket.rank}
              </div>
            }
            <div className={"text-[26px] text-white font-bold"}>
              {ticket.lesson?.title}
            </div>
            <div className={"text-[12px] text-white font-bold font-paperlogy"}>
              {ticket.paymentId}
            </div>
            <div className="mt-3 w-full h-[1px] bg-[#f7f8f9]"/>
            <div className="mt-3 space-y-2 gap-y-2">
              <div>
                <p className="text-[#D9D9E3] font-medium text-[12px]">{await translate('date')}</p>
                <p className="text-white font-medium text-[18px]">{ticket.lesson?.date}</p>
              </div>
              <div>
                <p className="text-[#D9D9E3] font-medium text-[12px]">{await translate('lesson_duration')}</p>
                <p
                  className="text-white font-medium text-[18px]">{ticket.lesson?.duration} {await translate('minutes')}</p>
              </div>
              <div>
                <p className="text-[#D9D9E3] font-medium text-[12px]">{await translate('studio')}</p>
                <p className="text-white font-medium text-[18px]">{ticket.lesson?.studio?.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#D9D9E3] font-medium text-[12px]">{await translate('lesson_room')}</p>
                <p className="text-white font-medium text-[18px]">{ticket.lesson?.room?.name}</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 top-0 w-8 h-8 bg-white rounded-full -translate-y-1/2"/>
          <div className="absolute -left-4 top-0 w-8 h-8 bg-white rounded-full -translate-y-1/2"/>
          <div className={"absolute right-0 bottom-0 text-red-400"}>
            {ticket.status == 'Paid' && <div>
              <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0 m-6">
                <Image
                  src={ticket.lesson?.studio?.profileImageUrl ?? ''}
                  alt="studio logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>}
            {ticket.status == 'Cancelled' &&
              <div className="overflow-hidden flex-shrink-0">
                <StampCancel className="scale-75"/>
              </div>
            }
            {(ticket.status == 'Used' || ticket.status == 'Expired') &&
              <div className="overflow-hidden flex-shrink-0">
                <StampUsed className="scale-75"/>
              </div>
            }
            {ticket.status == 'Pending' &&
              <div className="overflow-hidden flex-shrink-0">
                <StampNotPaid className="scale-75"/>
              </div>
            }
          </div>
        </div>

      </div>
      {ticket.status === 'Paid' &&
        <div className="left-0 w-full fixed bottom-0 px-6 bg-black">
          <div className="flex animate-scroll-reverse">
            <div className="flex shrink-0">
              {Array(2)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="flex">
                    {Array(50).fill(null).map((_, i) => (
                      <div key={`logo-${index}-${i}`}>
                        <Logo className={"scale-50"}/>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      }
    </div>
  );
}