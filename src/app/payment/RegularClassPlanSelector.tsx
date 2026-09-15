'use client'

import React from "react";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { PassDaysChip } from "@/app/components/PassDaysChip";
import { KloudScreen } from "@/shared/kloud.screen";

/**
 * 정규반 결제 — 그 반의 패스권(가격정책) 선택 섹션. 수업 가격정책(PricePolicySection)과 같은 룩.
 *
 * 패스권마다 결제 견적(paymentId·할인·구독 가능 여부)이 GET /payment 로 따로 나오므로,
 * 옵션을 고르면 같은 결제 페이지를 고른 패스권 id 로 다시 연다 (location.replace — 앱 웹뷰에서 화면이 쌓이지 않게).
 * appVersion 은 proxy 가 UA 로 다시 붙이므로 URL 에서 빠져도 된다.
 */
export const RegularClassPlanSelector = ({ locale, plans, selectedPlanId, studioId, regularClassId }: {
  locale: Locale,
  plans: GetPassPlanResponse[],
  selectedPlanId: number,
  studioId: number,
  regularClassId: number,
}) => {
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({ locale, key: 'won' });

  if (plans.length < 2) return null;

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
              onClick={() => {
                if (isSelected || typeof window === 'undefined') return;
                window.location.replace(KloudScreen.RegularClassPayment(studioId, regularClassId, plan.id));
              }}
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
