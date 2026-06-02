'use server';

import { api } from '@/app/api.client';

export const redeemVoucherAction = async ({ code }: { code: string }) => {
  // 현재 로그인 사용자의 id를 본인 redeem 대상으로 동봉.
  // 본인 정보 조회 실패해도 BE가 token에서 추론할 수 있으니 우선 호출만 진행하고, 가능한 경우에만 userId 포함.
  let userId: number | undefined;
  try {
    const me = await api.user.me({});
    if ('id' in me) userId = me.id;
  } catch {
    // ignore — userId 없이도 BE가 토큰으로 처리 가능
  }
  return await api.voucher.redeem({ code, userId });
};
