import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { getLocale, translate } from "@/utils/translate";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export const PassTicketUsageHistory = async ({tickets}: { tickets?: TicketResponse[] }) => {
  return (
    <div className="flex flex-col">
      <div className="text-[16px] font-bold text-black px-6 mb-3">{await translate('usage_information')}</div>
      {tickets && tickets.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 px-4">
          {tickets.map((item) => (
            <NavigateClickWrapper key={item.id} method={'push'} route={KloudScreen.TicketDetail(item.id, false)}>
              <div className="flex flex-col active:scale-[0.96] transition-all duration-150">
                <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden bg-[#F1F3F6]">
                  {item.lesson?.thumbnailUrl ? (
                    <Image
                      src={item.lesson.thumbnailUrl}
                      alt={item.lesson?.title ?? ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[11px] text-[#AEAEAE]">No Image</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[#86898C] font-medium mt-1.5 line-clamp-1 px-0.5">
                  {item.lesson?.title}
                </p>
                {item.createdAt && (
                  <p className="text-[9px] text-[#AEAEAE] mt-0.5 px-0.5">
                    {new Date(item.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}에 사용됨
                  </p>
                )}
              </div>
            </NavigateClickWrapper>
          ))}
        </div>
      ) : (
        <div className="flex justify-center w-full">
          <div className="py-10 font-medium text-[14px] text-center text-[#86898C]">
            {await translate('no_used_pass')}
          </div>
        </div>
      )}
    </div>
  )
}
