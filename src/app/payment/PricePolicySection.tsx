'use client'

import { LessonPricePolicyResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

/**
 * 수업 가격 정책 선택 섹션 — 한 수업을 '월 4회'/'월 8회' 등 여러 방식으로 살 수 있을 때 노출.
 * 선택한 정책의 paymentId로 결제하고, 해당 옵션의 price가 상품 가격이 된다.
 *
 * 이 UI의 목적은 "많이 살수록 싸다"를 한눈에 보여주는 것이라
 * 총액과 함께 회당 가격을 비교 축으로 노출한다 (회당가격은 price/lessonCount 파생).
 * 정렬은 서버가 lessonCount 오름차순으로 보장하므로 여기서 재정렬하지 않는다.
 * 할인율·정가·배지는 2026-08-08 계약 변경으로 삭제됐다 — 표시하지 않는다.
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

  // name이 비어서 오면 회차 수로 폴백해 빈 라벨이 찍히지 않게 한다 (서버 기본값과 같은 '{N}회' 형식).
  const labelOf = (p: LessonPricePolicyResponse) => p.name || `${p.lessonCount}${timesUnit}`;
  const perSession = (p: LessonPricePolicyResponse) => Math.round(p.price / Math.max(p.lessonCount, 1));

  return (
    <div className="flex flex-col gap-y-2 px-6 my-3">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'select_lesson_count' })}
      </div>

      <div className="flex flex-col gap-2.5">
        {policies.map((policy) => {
          const isSelected = policy.id === selectedPolicyId;

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
                    <span className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                      {labelOf(policy)}
                    </span>
                    {policy.description && (
                      <span className={`text-[12px] font-medium truncate ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                        {policy.description}
                      </span>
                    )}
                  </span>
                </div>

                <span className="flex flex-col items-end flex-shrink-0">
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

              {/* 미루기 한도는 선택된 옵션에서만 펼친다 — 접힌 카드가 조용해야 비교가 쉽다 */}
              {isSelected && policy.postponeLimit != null && (
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-end">
                  <span className="text-[11px] font-medium text-white/60">
                    {getLocaleString({ locale, key: 'postpone_limit_notice' }).replace('{count}', String(policy.postponeLimit))}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
