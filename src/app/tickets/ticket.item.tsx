'use client';
import Image from "next/image"
import { KloudScreen } from "@/shared/kloud.screen";
import { Poster } from "@/app/components/Poster";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { Thumbnail } from "@/app/components/Thumbnail";
import { formatDateTime } from "@/app/lessons/[id]/lesson.info.section";

export const TicketItem = ({item} : {item: TicketResponse}) => {
  const onClickTicket = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.TicketDetail(item.id))
    }
  }

  const formattedTime = formatDateTime(item.lesson?.startTime ?? '')

  return (
    <div className="bg-white" onClick={onClickTicket}>
      {/* 상단 날짜와 상태 */}
      <div className="flex justify-between items-center px-6">
        <span className="text-[#86898C] text-lg text-[14px] font-semibold">{formattedTime.date}</span>
        <span className="text-[#86898C] px-2 py-1 rounded-full border border-[#86898C] text-[12px]">
          {}
        </span>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex gap-3 px-6 mb-3">
        {/* 이미지 */}
        <Thumbnail width={84} url={item.lesson?.thumbnailUrl ?? ''}/>

        {/* 텍스트 정보 */}
        <div className="flex flex-col justify-center">
          {/* 제목 */}
          <h2 className="text-[16px] font-bold mb-1 text-black">
            {item.lesson?.title}
          </h2>

          {/* 스튜디오 정보 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[18px] text-black">
              {item.lesson?.studio?.name}
            </span>
            <span className="text-[#86898C]">
              {item.lesson?.studio?.address} /{item.lesson?.room?.name}
            </span>
          </div>

          {/* 일시 */}
          <p className="text-[#86898C]">
            {formattedTime.date} {formattedTime.time} /{item.lesson?.duration}분
          </p>
        </div>
      </div>

      <div className="w-full h-[2px] bg-[#F7F8F9]"/>
    </div>
  );
}