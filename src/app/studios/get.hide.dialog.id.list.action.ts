'use server'
import { cookies } from "next/headers";
import { hideDialogIdListKey } from "@/shared/cookies.key";

export const getHideDialogIdListAction = async () => {
  const hideDialogIdList = (await cookies()).get(hideDialogIdListKey)?.value ?? '';
  return hideDialogIdList
    ? hideDialogIdList.split('/').map(id => parseInt(id, 10))
    : [];
}