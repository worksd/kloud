import React from "react";
import { getRoomBookingsAction } from "@/app/roomBookings/get.room.bookings.action";
import { getLocale, translate } from "@/utils/translate";
import { BackButton } from "@/app/payment/BackButton";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { RoomBookingDetailResponse } from "@/app/endpoint/room.booking.endpoint";
import { StringResourceKey } from "@/shared/StringResource";

const STATUS: Record<RoomBookingDetailResponse['status'], { key: StringResourceKey; cls: string }> = {
  Active: { key: 'room_booking_status_active', cls: 'bg-[#EAF7F4] text-[#2AA894]' },
  Pending: { key: 'room_booking_status_pending', cls: 'bg-[#FFF4E5] text-[#E09400]' },
  Used: { key: 'room_booking_status_used', cls: 'bg-[#F1F3F6] text-[#6d7882]' },
  Cancelled: { key: 'room_booking_status_cancelled', cls: 'bg-[#FDECEC] text-[#E5484D]' },
};

// 'yyyy.MM.dd HH:mm' (KST 벽시계) → 정렬·비교용 숫자 202607272200. 파싱 실패 시 0.
const dateKey = (s?: string) => Number((s ?? '').replace(/\D/g, '').slice(0, 12)) || 0;
// 현재 시각을 KST 벽시계 기준 같은 12자리 숫자로. (서버 타임존과 무관하게 비교)
const nowKey = () => Number(
  new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(/\D/g, '').slice(0, 12)
);

const BookingCard = ({
  b,
  practiceRoomLabel,
  statusText,
}: {
  b: RoomBookingDetailResponse;
  practiceRoomLabel: string;
  statusText: Record<RoomBookingDetailResponse['status'], string>;
}) => {
  const s = STATUS[b.status] ?? STATUS.Active;
  const image = b.studioRoom?.imageUrls?.[0];
  return (
    <NavigateClickWrapper method="push" route={KloudScreen.RoomBookingDetail(b.id)}>
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-[#EEF0F2] active:bg-[#FAFBFC] transition-colors">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F1F3F6] shrink-0 flex items-center justify-center">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
              <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-[#191f28] truncate">{b.studioRoom?.name ?? practiceRoomLabel}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${s.cls}`}>{statusText[b.status] ?? statusText.Active}</span>
          </div>
          <p className="mt-1 text-[13px] text-[#6d7882] truncate">{b.startDate} ~ {b.endDate}</p>
        </div>
      </div>
    </NavigateClickWrapper>
  );
};

// 프로필 → 대관 내역 목록 (GET /roomBookings)
export default async function RoomBookingsPage({ searchParams }: {
  searchParams: Promise<{ appVersion?: string }>;
}) {
  const { appVersion = '' } = await searchParams;
  await getLocale();
  const res = await getRoomBookingsAction();
  const bookings: RoomBookingDetailResponse[] = ('roomBookings' in res) ? res.roomBookings : [];

  // 취소됐거나 종료시각이 현재(KST)보다 이전이면 지난 내역. 예정은 시작 임박순, 지난 내역은 최근순.
  const now = nowKey();
  const isPast = (b: RoomBookingDetailResponse) => b.status === 'Cancelled' || dateKey(b.endDate) < now;
  const upcoming = bookings
    .filter((b) => !isPast(b))
    .sort((a, b) => dateKey(a.startDate) - dateKey(b.startDate));
  const past = bookings
    .filter(isPast)
    .sort((a, b) => dateKey(b.startDate) - dateKey(a.startDate));

  const title = await translate('room_bookings');
  const upcomingLabel = await translate('room_bookings_upcoming');
  const pastLabel = await translate('room_bookings_past');
  const practiceRoomLabel = await translate('practice_room');
  const statusText: Record<RoomBookingDetailResponse['status'], string> = {
    Active: await translate('room_booking_status_active'),
    Pending: await translate('room_booking_status_pending'),
    Used: await translate('room_booking_status_used'),
    Cancelled: await translate('room_booking_status_cancelled'),
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 웹은 자체 헤더(백+타이틀), 네이티브는 앱 타이틀바(applyTitle)가 처리 */}
      {appVersion === '' && (
        <div className="sticky top-0 z-20 bg-white border-b border-[#F1F3F6]">
          <div className="relative h-14 flex items-center justify-center">
            <div className="absolute left-0 top-0 h-14 flex items-center">
              <BackButton />
            </div>
            <h1 className="text-[17px] font-bold text-[#191f28]">{title}</h1>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="py-24 text-center text-[14px] text-[#A0A5AB]">{await translate('room_bookings_empty')}</p>
      ) : (
        <div className="flex flex-col gap-6 px-4 py-4">
          {upcoming.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <h2 className="text-[13px] font-bold text-[#8B95A1] px-1">{upcomingLabel}</h2>
              {upcoming.map((b) => (
                <BookingCard key={b.id} b={b} practiceRoomLabel={practiceRoomLabel} statusText={statusText} />
              ))}
            </section>
          )}
          {past.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <h2 className="text-[13px] font-bold text-[#8B95A1] px-1">{pastLabel}</h2>
              {past.map((b) => (
                <BookingCard key={b.id} b={b} practiceRoomLabel={practiceRoomLabel} statusText={statusText} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
