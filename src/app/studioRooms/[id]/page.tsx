import React from "react";
import { getLocale } from "@/utils/translate";
import { StudioRoomDetailClient } from "@/app/studioRooms/[id]/StudioRoomDetailClient";

export default async function StudioRoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date } = await searchParams;
  const roomId = Number(id);
  const locale = await getLocale();

  return (
    <StudioRoomDetailClient
      roomId={roomId}
      locale={locale}
      initialDate={date}
    />
  );
}
