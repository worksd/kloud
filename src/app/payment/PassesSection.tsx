'use client'

import React from 'react';
import { GetPassResponse } from '@/app/endpoint/pass.endpoint';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { formatRuleDescription, formatFeatureDescription } from '@/utils/pass.description';

/**
 * BE가 passRule(단일)로 내려주는 새 형식 우선, legacy passRules[] fallback.
 */
const getPrimaryRule = (pass: GetPassResponse) =>
  pass.passRule ?? (pass.passRules ?? [])[0];

/**
 * 카드 부제목 — 대표 rule 우선, 없으면 첫 usable feature.
 */
const buildPrimaryBenefit = (pass: GetPassResponse, locale: Locale): string | null => {
  const rule = getPrimaryRule(pass);
  if (rule) {
    return formatRuleDescription({
      target: { type: rule.targetType, label: rule.targetLabel },
      benefit: { type: rule.benefitType, value: rule.benefitValue },
      duration: rule.duration,
      excludes: rule.excludes,
    }, locale, pass.passPlan?.tag ?? pass.passPlan?.name);
  }
  const feature = (pass.passFeatures ?? []).find(f => f.usable);
  if (feature) {
    return formatFeatureDescription(feature.featureKey, locale, feature.featureValue);
  }
  return null;
};

/**
 * 보유 패스권을 결제수단처럼 노출하는 별도 섹션.
 * 결제수단/할인과 같은 레벨로 표시. 선택 시 부모가 selectedMethod='pass'와 함께 처리.
 *
 * payment.methods에 'pass' 타입이 없으면(=BE가 패스 결제 비활성) 부모에서 렌더 안 함.
 */
export const PassesSection = ({
  locale,
  passes,
  selectedPass,
  onSelectPass,
}: {
  locale: Locale;
  passes: GetPassResponse[];
  selectedPass?: GetPassResponse;
  onSelectPass: (pass: GetPassResponse | undefined) => void;
}) => {
  return (
    <div className="flex flex-col gap-y-2 px-6 mt-5">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'pass' })}
      </div>

      {passes.length === 0 && (
        <div className="rounded-2xl border border-[#EEEFF0] bg-white px-5 py-6 text-center text-[13px] text-[#999]">
          {getLocaleString({ locale, key: 'no_available_pass' })}
        </div>
      )}

      {passes.length > 0 && (
      <div className="rounded-2xl border border-[#EEEFF0] overflow-hidden">
        {passes.map((pass, idx) => {
          const isSelected = selectedPass?.id === pass.id;
          // 단일 passRule(신규) 우선, 없으면 passRules[] (legacy) fallback.
          const primaryRule = getPrimaryRule(pass);
          const features = pass.passFeatures ?? [];
          const isUsable = !!primaryRule?.usable || features.some(f => f.usable);
          const blockedReason = isUsable
            ? undefined
            : (primaryRule && !primaryRule.usable ? primaryRule.reason : undefined);
          return (
            <div
              key={pass.id}
              onClick={isUsable ? () => onSelectPass(isSelected ? undefined : pass) : undefined}
              className={[
                'flex items-center gap-3 px-5 py-[15px] transition-all duration-150 select-none',
                idx > 0 ? 'border-t border-[#F0F0F0]' : '',
                !isUsable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                isSelected ? 'bg-[#F0F1F3]' : 'bg-white hover:bg-[#FBFBFC]',
              ].filter(Boolean).join(' ')}
            >
              {/* 패스권 아이콘 — ic_payment_pass.svg */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/ic_payment_pass.svg"
                alt=""
                width={22}
                height={22}
                className={isUsable ? '' : 'opacity-50'}
              />

              <div className="flex-grow flex flex-col min-w-0">
                <span className={`text-[14px] truncate ${isSelected ? 'text-black font-bold' : 'text-[#888] font-medium'}`}>
                  {pass.passPlan?.name ?? getLocaleString({ locale, key: 'pass' })}
                </span>
                {isUsable && (() => {
                  const benefit = buildPrimaryBenefit(pass, locale);
                  return benefit ? (
                    <span className={`text-[12px] mt-0.5 truncate ${isSelected ? 'text-black/70' : 'text-[#999]'}`}>
                      {benefit}
                    </span>
                  ) : null;
                })()}
                {!isUsable && blockedReason && (
                  <span className="text-[11px] text-[#B0B8C1] mt-0.5 truncate">{blockedReason}</span>
                )}
              </div>

              {/* 체크 마크 */}
              <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all
                ${isSelected ? 'border-black bg-black' : 'border-[#D4D4D4]'}`}>
                {isSelected && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
