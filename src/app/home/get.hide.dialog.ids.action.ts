'use server'
import { cookies } from "next/headers";
import { hideDialogIdListKey } from "@/shared/cookies.key";

export const getHideDialogIdsAction = async (): Promise<number[]> => {
  const hideDialogIdList = (await cookies()).get(hideDialogIdListKey)?.value ?? '';
  return hideDialogIdList
    ? hideDialogIdList.split('/').filter(Boolean).map(id => parseInt(id, 10))
    : [];
}

