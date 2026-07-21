import React from "react";
import { notFound } from "next/navigation";
import { getRoomBookingAction } from "@/app/roomBookings/[id]/get.room.booking.action";
import { getLocale, translate } from "@/utils/translate";
import { BackButton } from "@/app/payment/BackButton";
import { RoomBookingDetailResponse } from "@/app/endpoint/room.booking.endpoint";

// 홀 예약 상세 (GET /roomBookings/:id). PR 결제 record → productRoute로 진입.
export default async function RoomBookingDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ appVersion?: string }>;
}) {
  const id = Number((await params).id);
  const { appVersion = '' } = await searchParams;
  if (!id || Number.isNaN(id)) notFound();

  const res = await getRoomBookingAction(id);
  if (!('id' in res)) notFound();
  const booking = res as RoomBookingDetailResponse;

  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
  const won = await translate('won');
  const locale = await getLocale();

  // 'yyyy.MM.dd HH:mm' → 년월일 시:분. 종료가 같은 날이면 시:분만.
  const parseDT = (s?: string) => {
    if (!s) return null;
    const [datePart, timePart] = s.split(' ');
    const [y, m, d] = (datePart ?? '').split(/[.\-]/);
    if (!y || !m || !d) return null;
    return { y, m: Number(m), d: Number(d), time: timePart ?? '' };
  };
  const fmtDate = (p: { y: string; m: number; d: number }) =>
    locale === 'ko'
      ? `${p.y}년 ${p.m}월 ${p.d}일`
      : `${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')}`;
  const fmtPeriod = (start?: string, end?: string) => {
    const s = parseDT(start);
    if (!s) return `${start ?? ''}${end ? ` ~ ${end}` : ''}`;   // 예상 포맷과 다르면 원본
    const startStr = `${fmtDate(s)} ${s.time}`.trim();
    const e = parseDT(end);
    if (!e) return startStr;
    const sameDay = s.y === e.y && s.m === e.m && s.d === e.d;
    const endStr = sameDay ? e.time : `${fmtDate(e)} ${e.time}`.trim();
    return `${startStr} ~ ${endStr}`;
  };

  const statusMap: Record<RoomBookingDetailResponse['status'], { key: Parameters<typeof translate>[0]; cls: string }> = {
    Active: { key: 'room_booking_status_active', cls: 'bg-[#EAF7F4] text-[#2AA894]' },
    Pending: { key: 'room_booking_status_pending', cls: 'bg-[#FFF4E5] text-[#E09400]' },
    Used: { key: 'room_booking_status_used', cls: 'bg-[#F1F3F6] text-[#6d7882]' },
    Cancelled: { key: 'room_booking_status_cancelled', cls: 'bg-[#FDECEC] text-[#E5484D]' },
  };
  const statusInfo = statusMap[booking.status] ?? statusMap.Active;
  const statusLabel = await translate(statusInfo.key);
  const typeLabel = await translate(booking.type === 'full' ? 'room_booking_type_full' : 'room_booking_type_individual');

  const image = booking.studioRoom?.imageUrls?.[0];
  const reserverName = booking.user?.name ?? booking.name ?? undefined;
  const reserverPhone = booking.user?.phone ?? undefined;

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[14px] font-medium text-[#6d7882] shrink-0">{label}</span>
      <span className="text-[14px] font-medium text-[#191f28] text-right">{value}</span>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="relative w-full aspect-[16/9] bg-[#F1F3F6]">
        {appVersion === '' && <BackButton />}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={booking.studioRoom?.name ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
              <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* 홀 이름 + 상태 */}
      <div className="px-5 pt-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${statusInfo.cls}`}>{statusLabel}</span>
          <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-[#F1F3F6] text-[#4E5968]">{typeLabel}</span>
        </div>
        <h1 className="text-[22px] font-bold text-[#191f28] leading-tight">{booking.studioRoom?.name ?? await translate('practice_room')}</h1>
      </div>

      <div className="h-3 bg-[#f9f9fb] mt-5" />

      {/* 예약 정보 */}
      <div className="px-5 py-5">
        <p className="text-[16px] font-bold text-black mb-4">{await translate('room_booking_detail_title')}</p>
        <div className="flex flex-col gap-4">
          <Row label={await translate('room_booking_period')} value={fmtPeriod(booking.startDate, booking.endDate)} />
          <Row label={await translate('payment_amount')} value={`${fmt(booking.price)}${won}`} />
          {reserverName && (
            <Row label={await translate('room_booking_reserver')} value={reserverPhone ? `${reserverName} · ${reserverPhone}` : reserverName} />
          )}
          {booking.pass?.passPlanName && (
            <Row label={await translate('room_booking_used_pass')} value={booking.pass.passPlanName} />
          )}
          {booking.notice && (
            <Row label={await translate('room_booking_memo')} value={booking.notice} />
          )}
          <Row label={await translate('room_booking_created')} value={booking.createdAt} />
        </div>
      </div>
    </div>
  );
}
