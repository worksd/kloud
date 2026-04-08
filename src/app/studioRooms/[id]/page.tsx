import React from "react";
import { getLocale } from "@/utils/translate";
import { StudioRoomDetailClient } from "@/app/studioRooms/[id]/StudioRoomDetailClient";

export default async function StudioRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roomId = Number(id);
  const locale = await getLocale();

  return (
    <StudioRoomDetailClient
      roomId={roomId}
      locale={locale}
    />
  );
}
