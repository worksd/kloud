'use server';

import { api } from '@/app/api.client';

export const redeemVoucherAction = async (
  { code, name, phone }: { code: string; name?: string; phone?: string }
) => {
  // 로그인 사용자면 본인 id로 redeem.
  let userId: number | undefined;
  try {
    const me = await api.user.me({});
    if ('id' in me) userId = me.id;
  } catch {
    // ignore
  }

  if (userId) {
    return await api.voucher.redeem({ code, userId });
  }

  // 토큰에 유저 정보가 없으면(비로그인) 입력받은 이름/전화번호로 redeem.
  return await api.voucher.redeem({ code, name, phone });
};
