'use client'

import { LessonPricePolicyResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

/**
 * 수업 가격 정책 선택 섹션 — 한 수업을 '월 4회'/'월 8회' 등 여러 방식으로 살 수 있을 때 노출.
 * 선택한 정책의 paymentId로 결제하고, 해당 옵션의 price가 상품 가격이 된다.
 *
 * 이 UI의 목적은 "많이 살수록 싸다"를 한눈에 보여주는 것이라
 * 총액보다 회당 가격을 비교 축으로 잡고 할인율·절약액을 함께 노출한다.
 * 회당가격·할인율은 전부 price/lessonCount/originalPrice에서 파생 — 서버가 따로 내려주지 않는다.
 * 정렬은 서버가 lessonCount 오름차순으로 보장하므로 여기서 재정렬하지 않는다.
 */
export const PricePolicySection = ({
  locale,
  policies,
  selectedPolicyId,
  onSelectPolicy,
}: {
  locale: Locale,
  policies: LessonPricePolicyResponse[],
  selectedPolicyId?: number,
  onSelectPolicy: (policy: LessonPricePolicyResponse) => void,
}) => {
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({ locale, key: 'won' });
  const timesUnit = getLocaleString({ locale, key: 'times_unit' });

  // name은 필수값이지만, 비어서 오면 회차 수로 폴백해 빈 라벨이 찍히지 않게 한다.
  const labelOf = (p: LessonPricePolicyResponse) => p.name || `${p.lessonCount}${timesUnit}`;
  const perSession = (p: LessonPricePolicyResponse) => Math.round(p.price / Math.max(p.lessonCount, 1));
  // 할인율은 버림 — 실제보다 크게 보이면 안 된다.
  const discountRate = (p: LessonPricePolicyResponse) =>
    p.originalPrice && p.originalPrice > p.price
      ? Math.floor((1 - p.price / p.originalPrice) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-y-2 px-6 my-3">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'select_lesson_count' })}
      </div>

      <div className="flex flex-col gap-2.5">
        {policies.map((policy) => {
          const isSelected = policy.id === selectedPolicyId;
          const rate = discountRate(policy);
          const saved = policy.originalPrice ? policy.originalPrice - policy.price : 0;

          return (
            <button
              key={policy.id}
              type="button"
              onClick={() => onSelectPolicy(policy)}
              aria-pressed={isSelected}
              className={`relative w-full text-left rounded-2xl px-5 py-4 transition-all duration-200 select-none active:scale-[0.98]
                ${isSelected
                  ? 'border-[1.5px] border-black bg-black shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                  : 'border border-[#EEEFF0] bg-white'}`}
            >
              {/* 배지 — 카드 상단 경계에 걸치게 띄운다 */}
              {policy.badge && (
                <span className={`absolute -top-2 right-4 rounded-full px-2 py-0.5 text-[10px] font-bold
                  ${isSelected ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {policy.badge}
                </span>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${isSelected ? 'border-white bg-white' : 'border-[#D1D5DB]'}`}>
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>

                  <span className="flex flex-col min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                        {labelOf(policy)}
                      </span>
                      {rate > 0 && (
                        <span className={`text-[12px] font-bold ${isSelected ? 'text-[#FF8A8A]' : 'text-[#F04452]'}`}>
                          {rate}%
                        </span>
                      )}
                    </span>
                    {policy.description && (
                      <span className={`text-[12px] font-medium truncate ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                        {policy.description}
                      </span>
                    )}
                  </span>
                </div>

                <span className="flex flex-col items-end flex-shrink-0">
                  {policy.originalPrice && policy.originalPrice > policy.price && (
                    <span className={`text-[12px] font-medium line-through ${isSelected ? 'text-white/50' : 'text-[#B0B4B8]'}`}>
                      {fmt(policy.originalPrice)}{won}
                    </span>
                  )}
                  <span className={`text-[16px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                    {fmt(policy.price)}{won}
                  </span>
                  {/* 옵션마다 총액 규모가 달라서, 회당 가격이 있어야 실제 이득이 읽힌다 */}
                  {policy.lessonCount > 1 && (
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                      {getLocaleString({ locale, key: 'price_per_session' })} {fmt(perSession(policy))}{won}
                    </span>
                  )}
                </span>
              </div>

              {/* 절약액·미루기 한도는 선택된 옵션에서만 펼친다 — 접힌 카드가 조용해야 비교가 쉽다 */}
              {isSelected && (saved > 0 || policy.postponeLimit != null) && (
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                  {saved > 0 ? (
                    <span className="text-[12px] font-bold text-white">
                      {getLocaleString({ locale, key: 'you_save' })} {fmt(saved)}{won}
                    </span>
                  ) : <span/>}
                  {policy.postponeLimit != null && (
                    <span className="text-[11px] font-medium text-white/60">
                      {getLocaleString({ locale, key: 'postpone_limit_notice' }).replace('{count}', String(policy.postponeLimit))}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
