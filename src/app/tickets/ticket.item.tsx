'use client';

import Image from "next/image"
import { KloudScreen } from "@/shared/kloud.screen";
import { convertStatusToMessage, TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { LessonTags } from "@/app/components/LessonTags";

// 상태 칩 — 토스톤. 결제 완료(활성)만 검정, 나머지는 연회색/연빨강으로 낮춘다.
const statusChip = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-[#191F28] text-white';
    case 'Cancelled':
      return 'bg-[#FDECEC] text-[#E55B5B]';
    case 'Pending':
      return 'bg-[#FFF8EC] text-[#A05A00]';
    case 'Used':
    case 'Expired':
    default:
      return 'bg-[#F2F4F6] text-[#8B95A1]';
  }
};

// 수강 내역 행 — 흰 배경 리스트. 세로 썸네일(3:4) + 수업명/일시/스튜디오 + 상태 칩.
// 지난 수업(사용·만료·취소)은 썸네일 흑백 + 글자 톤 다운으로 한눈에 구분.
export const TicketItem = ({item, locale}: { item: TicketResponse, locale: Locale }) => {
  const isInactive = item.status === 'Used' || item.status === 'Expired' || item.status === 'Cancelled';
  const lesson = item.lesson;
  const studioName = lesson?.studio?.name;
  const dday = item.status === 'Paid' ? lesson?.dday : undefined;

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.TicketDetail(item.id, false)}>
      <div className={'px-5 py-4 flex items-center gap-4 active:bg-[#F9FAFB] transition-colors'}>
        {/* 썸네일 */}
        <div className={`relative w-[64px] aspect-[3/4] rounded-[12px] overflow-hidden bg-[#F2F4F6] shrink-0 ${isInactive ? 'grayscale opacity-60' : ''}`}>
          {lesson?.thumbnailUrl && (
            <Image src={lesson.thumbnailUrl} alt={''} fill sizes={'64px'} quality={50} className={'object-cover'}/>
          )}
          {/* 다가오는 수업 D-day — 썸네일 상단에 검정 배지로 강조 */}
          {dday && (
            <span className={'absolute top-0 left-0 right-0 h-[20px] bg-[#191F28] text-white text-[11px] font-bold font-paperlogy flex items-center justify-center tracking-wide'}>
              {dday}
            </span>
          )}
        </div>

        {/* 정보 */}
        <div className={'flex-1 min-w-0 flex flex-col gap-1'}>
          {item.ticketTypeLabel && item.ticketType !== 'default' && (
            <LessonTags tags={item.ticketTypeLabel} className={'shrink-0'}/>
          )}
          <p className={`text-[15px] font-semibold leading-snug line-clamp-2 tracking-[-0.3px] ${isInactive ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>
            {lesson?.title ?? ''}
          </p>
          <p className={`text-[13px] truncate tracking-[-0.2px] ${isInactive ? 'text-[#B0B8C1]' : 'text-[#4E5968]'}`}>
            {[lesson?.date, studioName].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* 상태 칩 */}
        <span className={`shrink-0 self-start mt-0.5 px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px] ${statusChip(item.status)}`}>
          {getLocaleString({locale, key: convertStatusToMessage({status: item.status})})}
        </span>
      </div>
    </NavigateClickWrapper>
  );
}
