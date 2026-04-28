'use client';

import React from 'react';
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { Locale } from "@/shared/StringResource";
import { formatFeatureDescription, formatRuleDescription } from "@/utils/pass.description";

type Props = {
  passPlan: GetPassPlanResponse;
  locale: Locale;
  onClose: () => void;
  onPay: () => void;
};

export const KioskPassPlanDetailModal = ({ passPlan, locale, onClose, onPay }: Props) => {
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

  return (
    <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%]">
      <div className="bg-white rounded-[24px] w-full max-w-[640px] max-h-[88vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-[24px] pt-[24px] pb-[12px]">
          <div className="flex flex-col gap-[6px] min-w-0">
            <p className="text-black font-bold leading-snug" style={{ fontSize: 'min(2.2vh, 24px)' }}>{passPlan.name}</p>
            {passPlan.expireDateStamp && (
              <p className="text-[#86898C]" style={{ fontSize: 'min(1.4vh, 14px)' }}>{passPlan.expireDateStamp}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-[36px] h-[36px] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="#1E2124" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 본문 — rules / features */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[12px]">
          {(passPlan.rules ?? []).length > 0 && (
            <div className="mb-[16px]">
              <p className="text-[#86898C] font-bold mb-[8px]" style={{ fontSize: 'min(1.4vh, 14px)' }}>혜택</p>
              <ul className="flex flex-col gap-[6px]">
                {(passPlan.rules ?? []).map((rule) => (
                  <li key={rule.id} className="flex items-start gap-[8px]">
                    <span className="text-[#1E2124] mt-[6px] w-[4px] h-[4px] rounded-full bg-[#1E2124] shrink-0"/>
                    <span className="text-[#1E2124]" style={{ fontSize: 'min(1.7vh, 18px)' }}>
                      {rule.target && rule.benefit
                        ? formatRuleDescription({ target: rule.target, benefit: rule.benefit, excludes: rule.excludes }, locale, passPlan.name)
                        : (rule.description ?? '')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(passPlan.features ?? []).length > 0 && (
            <div className="mb-[16px]">
              <p className="text-[#86898C] font-bold mb-[8px]" style={{ fontSize: 'min(1.4vh, 14px)' }}>부가 혜택</p>
              <ul className="flex flex-col gap-[6px]">
                {(passPlan.features ?? []).map((f, idx) => (
                  <li key={`${f.key}-${idx}`} className="flex items-start gap-[8px]">
                    <span className="text-[#1E2124] mt-[6px] w-[4px] h-[4px] rounded-full bg-[#1E2124] shrink-0"/>
                    <span className="text-[#1E2124]" style={{ fontSize: 'min(1.7vh, 18px)' }}>
                      {formatFeatureDescription(f.key, locale, f.value) || f.description || f.key}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 가격 + 결제 버튼 */}
        <div className="shrink-0 border-t border-[#F2F4F6] px-[24px] py-[16px] flex items-center justify-between gap-[12px]">
          <span className="text-black font-extrabold" style={{ fontSize: 'min(2.2vh, 24px)' }}>
            {fmt(passPlan.price ?? 0)}원
          </span>
          <button
            onClick={onPay}
            className="flex-1 h-[min(6vh,56px)] rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>결제할래</span>
          </button>
        </div>
      </div>
    </div>
  );
};
