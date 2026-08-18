import React from "react";
import { getRoomBookingsAction } from "@/app/roomBookings/get.room.bookings.action";
import { getLocale, translate } from "@/utils/translate";
import { BackButton } from "@/app/payment/BackButton";
import { RoomBookingDetailResponse } from "@/app/endpoint/room.booking.endpoint";
import { BookingCard, bookingDateKey as dateKey, bookingNowKey as nowKey } from "@/app/roomBookings/BookingCard";

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
