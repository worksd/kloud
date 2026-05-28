'use client';

import React, { useMemo, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { DiscountResponse } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse, PassRuleResponse } from "@/app/endpoint/pass.endpoint";
import { FEATURE_LABELS, formatRuleDescription } from "@/utils/pass.description";

export type KioskPassSelection =
  | { kind: 'discount'; discount: DiscountResponse }
  | { kind: 'pass'; pass: GetPassResponse; rule: PassRuleResponse };

type KioskPassSelectModalProps = {
  passes: GetPassResponse[];
  discounts: DiscountResponse[];
  locale: Locale;
  onBack: () => void;
  onSelect: (selection: KioskPassSelection) => void;
};

const fmt = (n: number) => `${new Intl.NumberFormat('ko-KR').format(n)}원`;

const ruleDescription = (rule: PassRuleResponse, locale: Locale, passName?: string): string => {
  if (!rule.targetType || !rule.benefitType) return '';
  return formatRuleDescription(
    {
      target: { type: rule.targetType, label: rule.targetLabel },
      benefit: { type: rule.benefitType, value: rule.benefitValue },
      excludes: rule.excludes,
    },
    locale,
    passName,
  );
};

const featureLabel = (key: string, locale: Locale): string =>
  FEATURE_LABELS[key]?.[locale] ?? key;

type Option = {
  id: string;
  selection: KioskPassSelection;
  usable: boolean;
  reason?: string;
};

const buildOptions = (passes: GetPassResponse[], discounts: DiscountResponse[]): Option[] => {
  const opts: Option[] = [];
  // 할인 — 서버가 이미 적용 가능한 것만 내려줌(usable 플래그 따로 없음). 전부 selectable로 노출.
  discounts.forEach((d) => {
    opts.push({
      id: `discount:${d.key}:${d.passRule?.id ?? ''}`,
      selection: { kind: 'discount', discount: d },
      usable: true,
    });
  });
  // 패스권 rule — 보유 패스의 모든 rule을 노출하고, usable 여부로 선택 가능 분기.
  // BE 응답 형상: 신규는 pass.passRule 단일 객체, legacy는 pass.passRules[] 배열 — 둘 다 지원.
  // targetType/benefitType이 누락된 정의 미완 rule은 skip.
  passes.forEach((pass) => {
    const rules: PassRuleResponse[] = pass.passRule ? [pass.passRule] : (pass.passRules ?? []);
    rules.forEach((rule) => {
      if (!rule.targetType || !rule.benefitType) return;
      opts.push({
        id: `pass:${pass.id}:${rule.id}`,
        selection: { kind: 'pass', pass, rule },
        usable: rule.usable === true,
        reason: rule.usable === false ? rule.reason : undefined,
      });
    });
  });
  // 사용 가능 항목 먼저 노출, 그 뒤에 비활성 항목
  return opts.sort((a, b) => (a.usable === b.usable ? 0 : a.usable ? -1 : 1));
};

export const KioskPassSelectModal = ({ passes, discounts, locale, onBack, onSelect }: KioskPassSelectModalProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const options = useMemo(() => buildOptions(passes, discounts), [passes, discounts]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = options.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[92.6%] max-w-[1000px] bg-white rounded-[28px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* 타이틀 */}
        <div style={{ padding: 'min(4vw,44px) min(4.4vw,48px) min(1.4vw,16px)' }}>
          <p className="text-black font-bold leading-tight" style={{ fontSize: 'min(2.8vw, 32px)' }}>
            {t('kiosk_select_pass')}
          </p>
        </div>

        {/* 옵션 목록 */}
        <div className="overflow-y-auto" style={{ padding: 'min(1.4vw,16px) min(3.7vw,40px)', maxHeight: '54vh' }}>
          {options.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#6D7882]" style={{ fontSize: 'min(2.4vw, 26px)' }}>
                {t('kiosk_no_pass')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 'min(1.4vw, 16px)' }}>
              {options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const handleClick = () => {
                  if (!opt.usable) return; // 비활성 — 클릭 무시
                  setSelectedId(isSelected ? null : opt.id);
                };
                if (opt.selection.kind === 'discount') {
                  const d = opt.selection.discount;
                  return (
                    <PassOptionCard
                      key={opt.id}
                      isSelected={isSelected}
                      usable={opt.usable}
                      reason={opt.reason}
                      onClick={handleClick}
                      title={d.description || d.passRule?.targetLabel || d.key || t('discount_info')}
                      subtitle={d.passRule?.targetLabel ? d.passRule.targetLabel : undefined}
                      rightLine1={`-${fmt(d.amount)}`}
                      rightLine2={t('discount_info')}
                    />
                  );
                }
                const { pass, rule } = opt.selection;
                const passName = pass.passPlan?.name ?? t('kiosk_pass');
                const ruleSummary = ruleDescription(rule, locale, passName);
                // 활성 rule에만 추가 features를 부제로 노출 (비활성 행은 사유로 채움)
                const featureSummary = opt.usable
                  ? (pass.passFeatures ?? [])
                      .filter((f) => f.usable)
                      .map((f) => featureLabel(f.featureKey, locale))
                      .join(' · ') || undefined
                  : undefined;
                return (
                  <PassOptionCard
                    key={opt.id}
                    isSelected={isSelected}
                    usable={opt.usable}
                    reason={opt.reason}
                    onClick={handleClick}
                    title={passName}
                    tag={pass.passPlan?.tag ?? undefined}
                    subtitle={featureSummary ? `${ruleSummary} · ${featureSummary}` : ruleSummary}
                    rightLine1={t('kiosk_use_action')}
                    rightLine2={rule.endDate ? `~${rule.endDate}` : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex" style={{ gap: 'min(2vw,22px)', padding: 'min(2vw,22px) min(3.7vw,40px) min(3.4vw,38px)' }}>
          <button
            onClick={onBack}
            className="flex-[280] rounded-[24px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
            style={{ height: 'min(9.5vw,104px)' }}
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>{t('kiosk_back')}</span>
          </button>
          <button
            onClick={() => selected && onSelect(selected.selection)}
            disabled={!selected}
            className={`flex-[604] rounded-[24px] flex items-center justify-center active:scale-[0.97] transition-all ${
              selected ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'
            }`}
            style={{ height: 'min(9.5vw,104px)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>{t('confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

type PassOptionCardProps = {
  isSelected: boolean;
  usable: boolean;
  reason?: string;
  onClick: () => void;
  title: string;
  tag?: string;
  subtitle?: string;
  rightLine1?: string;
  rightLine2?: string;
};

const PassOptionCard = ({ isSelected, usable, reason, onClick, title, tag, subtitle, rightLine1, rightLine2 }: PassOptionCardProps) => {
  const dim = !usable;
  return (
    <button
      onClick={onClick}
      disabled={dim}
      className={`flex items-center rounded-[20px] transition-all text-left ${
        isSelected ? 'bg-[#1E2124] ring-2 ring-[#1E2124]' : dim ? 'bg-[#F2F4F6] cursor-not-allowed' : 'bg-[#F9F9FB]'
      }`}
      style={{ padding: 'min(2.2vw,24px) min(2.6vw,28px)', gap: 'min(1.6vw,18px)', opacity: dim ? 0.55 : 1 }}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-baseline" style={{ gap: 'min(0.8vw, 10px)' }}>
          <span className={`font-bold truncate ${isSelected ? 'text-white' : 'text-[#1E2124]'}`} style={{ fontSize: 'min(2.2vw, 24px)' }}>
            {title}
          </span>
          {tag && (
            <span
              className={`shrink-0 px-[min(1vw,12px)] py-[min(0.3vw,4px)] rounded-full font-bold ${
                isSelected ? 'bg-white/15 text-white' : 'bg-[#E6E8EA] text-[#1E2124]'
              }`}
              style={{ fontSize: 'min(1.3vw, 14px)' }}
            >
              {tag}
            </span>
          )}
        </div>
        {subtitle && (
          <span
            className={`mt-[min(0.4vw,6px)] truncate ${isSelected ? 'text-white/70' : 'text-[#6D7882]'}`}
            style={{ fontSize: 'min(1.6vw, 18px)' }}
          >
            {subtitle}
          </span>
        )}
        {dim && reason && (
          <span
            className="mt-[min(0.4vw,6px)] truncate text-[#86898C]"
            style={{ fontSize: 'min(1.5vw, 16px)' }}
          >
            {reason}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end shrink-0">
        {rightLine1 && (
          <span className={`font-bold ${isSelected ? 'text-white' : 'text-[#1E2124]'}`} style={{ fontSize: 'min(2vw, 22px)' }}>
            {rightLine1}
          </span>
        )}
        {rightLine2 && (
          <span className={isSelected ? 'text-white/60' : 'text-[#86898C]'} style={{ fontSize: 'min(1.4vw, 16px)' }}>
            {rightLine2}
          </span>
        )}
      </div>
      {/* 비활성 항목엔 라디오 자리 미노출(또는 비활성 표시) */}
      {!dim && (
        <div className={`w-[min(2.2vw,24px)] h-[min(2.2vw,24px)] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'border-white bg-white' : 'border-[#CDD1D5]'
        }`}>
          {isSelected && (
            <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#1E2124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      )}
    </button>
  );
};
