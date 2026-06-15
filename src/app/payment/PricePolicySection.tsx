'use client'

import { PricePolicyResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

/**
 * 수강 횟수 가격정책 선택 섹션 — 한 수업을 1회/4회/8회 등 여러 횟수 옵션으로 구매할 수 있을 때 노출.
 * 선택한 정책의 id가 결제 요청의 policyId로 전송되고, 해당 옵션의 price가 상품 가격이 된다.
 */
export const PricePolicySection = ({
  locale,
  policies,
  selectedPolicyId,
  onSelectPolicy,
}: {
  locale: Locale,
  policies: PricePolicyResponse[],
  selectedPolicyId?: number,
  onSelectPolicy: (policy: PricePolicyResponse) => void,
}) => {
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({ locale, key: 'won' });
  const timesUnit = getLocaleString({ locale, key: 'times_unit' });

  const labelOf = (p: PricePolicyResponse) => p.label ?? `${p.count}${timesUnit}`;

  return (
    <div className="flex flex-col gap-y-2 px-6 my-3">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'select_lesson_count' })}
      </div>

      <div className="flex flex-col gap-2">
        {policies.map((policy) => {
          const isSelected = policy.id === selectedPolicyId;
          return (
            <div
              key={policy.id}
              onClick={() => onSelectPolicy(policy)}
              className={`flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 select-none cursor-pointer active:scale-[0.98]
                ${isSelected
                  ? 'border-[1.5px] border-black bg-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                  : 'border border-[#EEEFF0] bg-white text-black'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                  ${isSelected ? 'border-white bg-white' : 'border-[#D1D5DB]'}`}>
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                  {labelOf(policy)}
                </span>
              </div>
              <span className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                {fmt(policy.price)}{won}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
