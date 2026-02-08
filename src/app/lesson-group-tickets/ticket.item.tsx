'use client';

import { KloudScreen } from "@/shared/kloud.screen";
import { LessonGroupTicketResponse } from "@/app/endpoint/ticket.endpoint";
import { Thumbnail } from "@/app/components/Thumbnail";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const DAY_LABELS: Record<string, string> = {
  MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일',
};

const formatDays = (days?: string[]) => {
  if (!days || days.length === 0) return '';
  return days.map(d => DAY_LABELS[d] ?? d).join(', ');
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'Active': return '이용중';
    case 'Expired': return '만료';
    case 'Cancelled': return '취소';
    default: return status;
  }
};

export const LessonGroupTicketItem = ({item, locale}: { item: LessonGroupTicketResponse, locale: Locale }) => {
  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.LessonGroupTicketDetail(item.id, false)}>
      <div className="bg-white active:scale-[0.98] active:bg-gray-100 transition-all duration-150 py-2">
        {/* 상단 기간과 상태 */}
        <div className="flex justify-between items-center px-6 mb-3 mt-2">
          <span className="text-[#86898C] text-[14px] font-medium">
            {item.startDate} ~ {item.endDate}
          </span>
          <span className="text-[#86898C] px-2 py-1 rounded-full border border-[#86898C] font-medium text-[12px]">
            {statusLabel(item.status)}
          </span>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex gap-3 pl-6 mb-3">
          <div className="w-[84px] flex-shrink-0">
            <Thumbnail width={84} url={item.lessonGroup?.thumbnailUrl ?? ''}/>
          </div>
          <div className="flex flex-col justify-center">
            {/* 제목 */}
            <h2 className="text-[16px] font-bold mb-1 text-black">
              {item.lessonGroup?.title ?? ''}
            </h2>

            {/* 아티스트 */}
            {item.lessonGroup?.artist && (
              <p className="font-medium text-[14px] text-[#86898c] mb-1">
                {item.lessonGroup.artist.nickName}
              </p>
            )}

            {/* 요일/시간 */}
            <div className="flex flex-row items-center mb-1">
              {item.lessonGroup?.days && (
                <p className="text-[#86898C] text-[14px] font-medium">
                  {formatDays(item.lessonGroup.days)}
                </p>
              )}
              {item.lessonGroup?.startTime && (
                <p className="text-[#86898C] text-[12px] font-medium ml-1">
                  {item.lessonGroup.startTime}
                </p>
              )}
              {item.lessonGroup?.duration && (
                <p className="text-[#86898C] text-[12px] font-medium">
                  /{item.lessonGroup.duration}{getLocaleString({locale, key: 'minutes'})}
                </p>
              )}
            </div>

            {/* 잔여 횟수 */}
            {item.remainingCount !== undefined && item.usageLimit !== undefined && (
              <p className="text-[#131517] text-[13px] font-medium">
                {item.remainingCount}/{item.usageLimit}{getLocaleString({locale, key: 'remaining_count'})}
              </p>
            )}
          </div>
        </div>
      </div>
    </NavigateClickWrapper>
  );
}
