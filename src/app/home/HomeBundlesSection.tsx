import React from 'react';
import { BundleSummaryResponse } from '@/app/endpoint/lesson.endpoint';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { KloudScreen } from '@/shared/kloud.screen';
import { getLocale, translate } from '@/utils/translate';
import { Locale } from '@/shared/StringResource';

// "2026.06.30 20:00" → 로케일별 "6월 30일까지" 형태
const formatCloseDate = (raw: string, locale: Locale): string => {
  const m = raw.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (!m) return raw;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  switch (locale) {
    case 'ko':
      return `${month}월 ${day}일까지`;
    case 'jp':
      return `${month}月${day}日まで`;
    case 'zh':
      return `至${month}月${day}日`;
    default: {
      const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        new Date(year, month - 1, day),
      );
      return `Until ${monthShort} ${day}`;
    }
  }
};

// 홈 — 선택된 스튜디오의 판매중 묶음(프로모션) 섹션.
// 카드는 풀 폭 vertical stack. 아이템 이미지를 한 줄에 균등 분배해 모두 노출.
export async function HomeBundlesSection({
  bundles,
}: {
  bundles?: BundleSummaryResponse[];
  studioName?: string;
}) {
  if (!bundles || bundles.length === 0) return null;

  const locale = await getLocale();
  const wonLabel = await translate('won');

  return (
    <section className="flex flex-col">
      <div className="flex flex-col gap-3 px-5 pb-2 pt-5">
        {bundles.map((b) => {
          const discountRate = b.originalPrice > 0 && b.originalPrice > b.price
            ? Math.round((1 - b.price / b.originalPrice) * 100)
            : 0;
          // 최대 4장까지 같은 행에 노출, 그 이상은 마지막 칸에 +N
          const visible = b.items.slice(0, 4);
          const remaining = b.items.length - visible.length;
          return (
            <NavigateClickWrapper key={b.id} method="push" route={KloudScreen.Payment('bundle', b.id)}>
              <div className="w-full rounded-2xl bg-white border border-[#F1F3F6] overflow-hidden active:bg-[#F7F8F9] transition-colors">
                {/* 아이템 이미지 — 균등 분배, h-44(176px) 고정. 오버레이 뱃지 없음. */}
                <div className="w-full h-44 flex gap-px bg-white">
                  {visible.map((item, idx) => {
                    const thumb = item.imageUrl ?? item.thumbnailUrl;
                    const showOverlay = idx === visible.length - 1 && remaining > 0;
                    return (
                      <div
                        key={`${item.itemType}-${item.itemId}`}
                        className="relative flex-1 bg-[#F1F3F6] overflow-hidden"
                      >
                        {thumb && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="w-full h-full object-cover"/>
                        )}
                        {showOverlay && (
                          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <span className="text-white text-[20px] font-bold">+{remaining}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* 텍스트 */}
                <div className="p-4">
                  {/* 할인율 + 마감일 칩 — 이미지 아래로 분리 */}
                  {(discountRate > 0 || b.closeDate) && (
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      {discountRate > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#EF4444] text-[11px] font-bold">
                          {discountRate}% OFF
                        </span>
                      )}
                      {b.closeDate && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4E5968] text-[11px] font-medium">
                          {formatCloseDate(b.closeDate, locale)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-[16px] font-bold text-black truncate">{b.name}</div>
                  {b.description && (
                    <div className="mt-0.5 text-[12px] text-[#86898C] line-clamp-1">{b.description}</div>
                  )}
                  <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                    <span className="text-[18px] font-bold text-black">
                      {new Intl.NumberFormat('ko-KR').format(b.price)}{wonLabel}
                    </span>
                    {discountRate > 0 && (
                      <span className="text-[13px] text-[#BFC2C5] line-through">
                        {new Intl.NumberFormat('ko-KR').format(b.originalPrice)}{wonLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </NavigateClickWrapper>
          );
        })}
      </div>
    </section>
  );
}
