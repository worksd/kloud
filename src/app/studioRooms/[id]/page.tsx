import React from "react";
import { getRoomAvailabilityAction } from "@/app/schedule/get.practice.rooms.action";
import { getLocale, translate } from "@/utils/translate";
import { StudioRoomDetailClient } from "@/app/studioRooms/[id]/StudioRoomDetailClient";

export default async function StudioRoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date: string }>;
}) {
  const { id } = await params;
  const { date } = await searchParams;
  const roomId = Number(id);

  const res = await getRoomAvailabilityAction(roomId, date);
  const locale = await getLocale();

  if (!('studioRoomId' in res)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <span className="text-[#85898C] text-[15px]">{await translate('practice_room_not_available')}</span>
      </div>
    );
  }

  return (
    <StudioRoomDetailClient
      room={res}
      date={date}
      locale={locale}
    />
  );
}
