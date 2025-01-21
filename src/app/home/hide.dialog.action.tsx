'use server'

import { cookies } from "next/headers";

export const hideDialogAction = async ({id, clicked} : {id: string, clicked: boolean}) => {
  const cookieStore = await cookies();
  const idList = cookieStore.get('hideDialogIdList')?.value ?? '';
  const idArray = idList.split('/').filter(Boolean); // 빈 문자열 제거

  let newIdList: string;

  if (clicked) {
    // 클릭된 경우 ID 추가 (중복 방지)
    if (!idArray.includes(id)) {
      idArray.push(id);
    }
  } else {
    // 클릭되지 않은 경우 ID 제거
    const index = idArray.indexOf(id);
    if (index > -1) {
      idArray.splice(index, 1);
    }
  }

  newIdList = idArray.join('/');
  if (newIdList) {
    newIdList += '/'; // 마지막 구분자 추가
  }

  // 현재 시간으로부터 7일 후의 날짜 계산
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  cookieStore.set('hideDialogIdList', newIdList, {
    expires: expiryDate,
    path: '/',
  });
}