// 신청 완료 — 몇 번째 신청인지, 지금 단가, 다음 구간까지 남은 인원, 링크 공유.
// 값은 제출 응답에서 쿼리로 넘겨받는다(제출 순간의 인원·단가 — 다시 조회하면 그 사이 또 바뀔 수 있다).

import React from 'react';
import { fs, fsWon } from '@/app/forms/form.i18n';
import { getLocale } from '@/utils/translate';
import { ShareLinkButton } from './ShareLinkButton';

export default async function PartnershipDonePage({searchParams}: {
  searchParams: Promise<{ n?: string; price?: string; nextPrice?: string; remain?: string }>
}) {
  const { n, price, nextPrice, remain } = await searchParams;
  const locale = await getLocale();
  const count = Number(n);
  const unitPrice = Number(price);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-md px-5 pt-24 pb-16 flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[52px]">🙌</span>
          <h1 className="text-[22px] font-bold text-black leading-snug">
            {Number.isFinite(count) && count > 0 ? fs(locale, 'pf_done_nth', {n: count}) : fs(locale, 'pf_done')}
          </h1>
          {Number.isFinite(unitPrice) && unitPrice > 0 && (
            <p className="text-[15px] text-[#6B7280] whitespace-pre-line">
              {fs(locale, 'pf_done_price_note', {price: fsWon(locale, unitPrice)})}
            </p>
          )}
        </div>

        {/* 완료 화면에도 같은 문구를 다시 — 링크가 옆자리로 넘어가야 제휴가 돈다 */}
        {nextPrice && remain && (
          <div className="w-full rounded-2xl bg-[#EFF4FF] px-5 py-4 text-[15px] text-black">
            {fs(locale, 'pf_next_tier', {n: remain, price: fsWon(locale, Number(nextPrice))})}
          </div>
        )}

        <ShareLinkButton label={fs(locale, 'pf_share')} copiedLabel={fs(locale, 'pf_copied')}/>
      </div>
    </div>
  );
}
