import React from 'react';
import { BundleSummaryResponse } from '@/app/endpoint/lesson.endpoint';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { KloudScreen } from '@/shared/kloud.screen';
import { translate } from '@/utils/translate';

// 이 수업이 포함된 묶음 목록. 카드 클릭 시 /payment?item=bundle&itemId=... 로 이동.
export async function LessonBundlesSection({ bundles }: { bundles?: BundleSummaryResponse[] }) {
  if (!bundles || bundles.length === 0) return null;

  const title = await translate('bundle_included_title');
  const wonLabel = await translate('won');

  return (
    <div className="self-stretch flex flex-col">
      <div className="w-full h-3 bg-[#f7f8f9]"/>
      <div className="px-6 pt-5 pb-2">
        <div className="text-black text-[18px] font-bold">{title}</div>
      </div>
      <div className="px-6 flex flex-col gap-2 pb-5">
        {bundles.map((b) => {
          const discountRate = b.originalPrice > 0 && b.originalPrice > b.price
            ? Math.round((1 - b.price / b.originalPrice) * 100)
            : 0;
          return (
            <NavigateClickWrapper key={b.id} method="push" route={KloudScreen.Payment('bundle', b.id)}>
              <div className="w-full rounded-2xl border border-[#F1F3F6] bg-white p-4 active:bg-[#F7F8F9] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="text-[15px] font-bold text-black truncate">{b.name}</div>
                    {b.description && (
                      <div className="mt-0.5 text-[12px] text-[#86898C] line-clamp-2">{b.description}</div>
                    )}
                    <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                      {discountRate > 0 && (
                        <span className="text-[14px] font-bold text-[#EF4444]">{discountRate}%</span>
                      )}
                      <span className="text-[15px] font-bold text-black">
                        {new Intl.NumberFormat('ko-KR').format(b.price)}{wonLabel}
                      </span>
                      {discountRate > 0 && (
                        <span className="text-[12px] text-[#BFC2C5] line-through">
                          {new Intl.NumberFormat('ko-KR').format(b.originalPrice)}{wonLabel}
                        </span>
                      )}
                    </div>
                    {b.closeDate && (
                      <div className="mt-1 text-[11px] text-[#86898C]">~ {b.closeDate}</div>
                    )}
                  </div>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#BFC2C5] shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </NavigateClickWrapper>
          );
        })}
      </div>
    </div>
  );
}
