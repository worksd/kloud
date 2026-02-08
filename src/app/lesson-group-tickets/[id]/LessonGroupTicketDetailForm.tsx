'use client';

import { LessonGroupTicketResponse, LessonGroupTicketLessonResponse } from "@/app/endpoint/ticket.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { CircleImage } from "@/app/components/CircleImage";

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
    case 'Paid': return '결제완료';
    case 'Used': return '사용완료';
    case 'Pending': return '대기';
    default: return status;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'text-green-600 border-green-600';
    case 'Paid': return 'text-blue-600 border-blue-600';
    case 'Used': return 'text-[#86898C] border-[#86898C]';
    case 'Expired': return 'text-[#86898C] border-[#86898C]';
    case 'Cancelled': return 'text-[#E55B5B] border-[#E55B5B]';
    default: return 'text-[#86898C] border-[#86898C]';
  }
};

const ticketStatusColor = (status: string) => {
  switch (status) {
    case 'Paid': return 'bg-blue-50 text-blue-600';
    case 'Used': return 'bg-gray-100 text-[#86898C]';
    case 'Cancelled': return 'bg-red-50 text-[#E55B5B]';
    default: return 'bg-gray-100 text-[#86898C]';
  }
};

const formatStartDate = (startDate: string) => {
  // "2026-02-10 17:10" -> "02.10(화) 17:10"
  try {
    const date = new Date(startDate.replace(' ', 'T'));
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    const time = startDate.split(' ')[1];
    return `${month}.${day}(${weekday}) ${time}`;
  } catch {
    return startDate;
  }
};

export const LessonGroupTicketDetailForm = ({ticket, locale}: {
  ticket: LessonGroupTicketResponse,
  locale: Locale,
}) => {
  const lg = ticket.lessonGroup;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
      {/* 헤더 영역 */}
      <div className="px-6 pt-6 pb-4">
        {/* 상태 배지 */}
        <span className={`px-3 py-1 rounded-full border font-medium text-[13px] ${statusColor(ticket.status)}`}>
          {statusLabel(ticket.status)}
        </span>

        {/* 제목 */}
        <h1 className="text-[22px] font-bold text-black mt-4">{lg?.title}</h1>

        {/* 아티스트 */}
        {lg?.artist && (
          <div className="flex items-center gap-2 mt-3">
            {lg.artist.profileImageUrl && (
              <CircleImage size={28} imageUrl={lg.artist.profileImageUrl}/>
            )}
            <span className="text-[14px] text-[#86898c] font-medium">{lg.artist.nickName}</span>
          </div>
        )}
      </div>

      <div className="w-full h-3 bg-[#F7F8F9]" />

      {/* 이용 정보 */}
      <div className="px-6 py-5 flex flex-col gap-3">
        <h2 className="text-[16px] font-bold text-black">이용 정보</h2>

        <InfoRow label="기간" value={`${ticket.startDate ?? ''} ~ ${ticket.endDate ?? ''}`} />

        {lg?.days && (
          <InfoRow label="요일" value={formatDays(lg.days)} />
        )}

        {lg?.startTime && (
          <InfoRow
            label="시간"
            value={`${lg.startTime}${lg.duration ? ` (${lg.duration}${getLocaleString({locale, key: 'minutes'})})` : ''}`}
          />
        )}

        {ticket.usageLimit !== undefined && ticket.remainingCount !== undefined && (
          <InfoRow
            label="잔여 횟수"
            value={`${ticket.remainingCount} / ${ticket.usageLimit}회`}
          />
        )}

        {lg?.level && (
          <InfoRow label="레벨" value={lg.level} />
        )}
      </div>

      <div className="w-full h-3 bg-[#F7F8F9]" />

      {/* 수업 일정 목록 */}
      {ticket.tickets && ticket.tickets.length > 0 && (
        <div className="px-6 py-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-black">수업 일정</h2>
            <span className="text-[13px] text-[#86898c]">{ticket.tickets.length}회</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {ticket.tickets.map((t) => (
              <TicketLessonItem key={t.id} ticket={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TicketLessonItem = ({ticket}: { ticket: LessonGroupTicketLessonResponse }) => {
  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.TicketDetail(ticket.id, false)}>
      <div className="flex items-center justify-between py-3 px-4 rounded-[12px] bg-[#F7F8F9] active:scale-[0.98] active:bg-gray-200 transition-all duration-150">
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] text-black font-medium">
            {formatStartDate(ticket.startDate)}
          </span>
          <span className="text-[12px] text-[#86898c]">
            {ticket.lessonTitle}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${ticketStatusColor(ticket.status)}`}>
          {statusLabel(ticket.status)}
        </span>
      </div>
    </NavigateClickWrapper>
  );
};

const InfoRow = ({label, value}: { label: string, value: string }) => (
  <div className="flex items-start">
    <span className="w-[80px] text-[14px] text-[#86898c] font-medium flex-shrink-0">{label}</span>
    <span className="text-[14px] text-black font-medium">{value}</span>
  </div>
);
