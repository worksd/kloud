'use client'

import React from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { PassDaysChip } from "@/app/components/PassDaysChip";
import { useRegularClassPayment } from "@/app/payment/RegularClassPaymentContext";

/**
 * 정규반 결제 — 그 반의 패스권(가격정책) 선택 섹션. 수업 가격정책(PricePolicySection)과 같은 룩.
 * 옵션을 고르면 컨텍스트의 선택만 바뀌고, 미리 받아 둔 그 패스권의 견적으로 헤더·결제 폼이 갈아끼워진다.
 */
export const RegularClassPlanSelector = ({ locale }: { locale: Locale }) => {
  const ctx = useRegularClassPayment();
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({ locale, key: 'won' });

  if (!ctx || ctx.plans.length < 2) return null;
  const { plans, selectedPlanId, select } = ctx;

  return (
    <div className="flex flex-col gap-y-2 px-6 my-3">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'select_pass_plan' })}
      </div>

      <div className="flex flex-col gap-2.5">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => select(plan.id)}
              aria-pressed={isSelected}
              className={`relative w-full text-left rounded-2xl px-5 py-4 transition-all duration-200 select-none
                ${isSelected
                  ? 'border-[1.5px] border-black bg-black shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-[0.98]'
                  : 'border border-[#EEEFF0] bg-white active:scale-[0.98]'}`}
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

                  <span className="flex flex-col min-w-0 gap-0.5">
                    <span className={`text-[15px] font-bold truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                      {plan.name}
                    </span>
                    <span className="flex items-center gap-1.5 min-w-0">
                      {plan.expireDateStamp && (
                        <span className={`text-[12px] font-medium truncate ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                          {plan.expireDateStamp}
                        </span>
                      )}
                      {/* 다니는 요일 — 요일이 정해진 정규반 상품만 */}
                      <PassDaysChip days={plan.days} locale={locale} tone={isSelected ? 'dark' : 'light'} />
                    </span>
                  </span>
                </div>

                <span className={`text-[16px] font-bold flex-shrink-0 ${isSelected ? 'text-white' : 'text-black'}`}>
                  {fmt(plan.price ?? 0)}{won}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
