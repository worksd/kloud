'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { hideDialogIdListKey } from "@/shared/cookies.key";

export const getEventList = async () => {
  const res = await api.event.list({})
  if ('events' in res) {
    const events = res.events;
    const hideDialogIdList = (await cookies()).get(hideDialogIdListKey)?.value ?? '';

    const hideIds = hideDialogIdList
      ? hideDialogIdList.split('/').map(id => parseInt(id, 10))
      : [];
    return events.filter(event => !hideIds.includes(event.id));
  }
  return [];
}