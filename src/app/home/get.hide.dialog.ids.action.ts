'use server'
import { cookies } from "next/headers";

export const getHideDialogIdsAction = async (): Promise<number[]> => {
  const hideDialogIdList = (await cookies()).get('hideDialogIdList')?.value ?? '';
  return hideDialogIdList
    ? hideDialogIdList.split('/').filter(Boolean).map(id => parseInt(id, 10))
    : [];
}

