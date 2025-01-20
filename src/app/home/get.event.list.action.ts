'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";

export const getEventList = async () => {
  const res = await api.event.list({})
  if ('events' in res) {
    const events = res.events;
    const hideDialogIdList = (await cookies()).get('hideDialogIdList')?.value ?? '';
    console.log('hide dialog id list ' + hideDialogIdList)

    const hideIds = hideDialogIdList
      ? hideDialogIdList.split('/').map(id => parseInt(id, 10))
      : [];
    return events.filter(event => !hideIds.includes(event.id));
  }
  return [];
}