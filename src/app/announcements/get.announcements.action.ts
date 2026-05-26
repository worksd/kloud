'use server';
import { api } from "@/app/api.client";

export const getAnnouncementsAction = async ({
  studioId,
  page,
}: {
  studioId: number;
  page?: number;
}) => {
  return await api.announcement.list({ studioId, page });
};
