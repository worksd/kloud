'use client';

import Image from "next/image"
import { KloudScreen } from "@/shared/kloud.screen";
import { convertStatusToMessage, TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const statusStyle = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-black text-white';
    case 'Used':
    case 'Expired':
      return 'bg-[#E8E8E8] text-[#999]';
    case 'Cancelled':
      return 'bg-red-100 text-red-600';
    case 'Pending':
      return 'bg-[#F1F3F6] text-[#86898C]';
    default:
      return 'bg-[#E8E8E8] text-[#999]';
  }
};

export const TicketItem = ({item, locale}: { item: TicketResponse, locale: Locale }) => {
  const isInactive = item.status === 'Used' || item.status === 'Expired' || item.status === 'Cancelled';

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.TicketDetail(item.id, false)}>
      <div className={`mx-4 my-2 flex rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-150
        ${isInactive ? 'bg-[#F5F5F5]' : 'bg-black'}`}>

        {/* 왼쪽: 세로 썸네일 */}
        <div className={`relative w-[110px] flex-shrink-0 aspect-[3/4] m-3 rounded-xl overflow-hidden ${isInactive ? 'opacity-40' : ''}`}>
          {item.lesson?.thumbnailUrl ? (
            <Image
              src={item.lesson.thumbnailUrl}
              alt={item.lesson?.title ?? ''}
              fill
              className="object-cover"
              sizes="110px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200"/>
          )}
          {/* 스튜디오 로고 */}
          {item.lesson?.studio?.profileImageUrl && (
            <div className="absolute bottom-2 left-2">
              <Image
                className="w-6 h-6 rounded-full border-2 border-white/80"
                src={item.lesson.studio.profileImageUrl}
                alt=""
                width={24}
                height={24}
              />
            </div>
          )}
        </div>

        {/* 오른쪽: 정보 */}
        <div className="flex-1 flex flex-col justify-between py-3 pr-4 pl-2 min-w-0">
          <div>
            <h2 className={`text-[15px] font-bold line-clamp-2
              ${isInactive ? 'text-[#999]' : 'text-white'}`}>
              {item.lesson?.title ?? ''}
            </h2>
            <div className={`text-[12px] mt-1
              ${isInactive ? 'text-[#CACACA]' : 'text-white/60'}`}>
              {item.lesson?.date ?? ''}
            </div>
          </div>

          <div className={`self-start text-[13px] font-extrabold tracking-wide mt-2
            ${item.status === 'Paid' ? 'text-emerald-400' :
              item.status === 'Cancelled' ? 'text-red-400' :
              item.status === 'Pending' ? 'text-[#BEBEBE]' :
              isInactive ? 'text-[#BEBEBE]' : 'text-white/40'}`}>
            {getLocaleString({locale, key: convertStatusToMessage({status: item.status})})}
          </div>
        </div>
      </div>
    </NavigateClickWrapper>
  );
}
