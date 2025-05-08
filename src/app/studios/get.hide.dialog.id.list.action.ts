'use server'
import { cookies } from "next/headers";

export const getHideDialogIdListAction = async () => {
  const hideDialogIdList = (await cookies()).get('hideDialogIdList')?.value ?? '';
  return hideDialogIdList
    ? hideDialogIdList.split('/').map(id => parseInt(id, 10))
    : [];
}