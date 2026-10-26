// 내 정규반 상세 — 미납 안내 카드. 미납(Unpaid) 상품이면 헤더 바로 아래에 띄운다. 모바일/PC 공용 서버 컴포넌트.
// 검정 카드 + 큰 금액(Paperlogy) — 수업 목록 날짜 타일과 같은 톤. 결제하기 → 가격정책 결제 페이지.
// 지금은 unpaid.mock.ts 데이터.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { UnpaidInfo } from "@/app/profile/myRegularClass/[id]/unpaid.mock";
import { parts, WEEKDAYS } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";

const shortDate = (s: string) => {
  const p = parts(s);
  return p ? `${p.month}.${p.day}` : s;
};

export const RegularClassUnpaidCard = async ({ info, locale }: { info: UnpaidInfo; locale: Locale }) => {
  const due = parts(info.dueDate);
  // 결제 기한까지 남은 날 — KST 날짜 기준
  const todayKst = new Date(Date.now() + 9 * 3600000);
  const today = Date.UTC(todayKst.getUTCFullYear(), todayKst.getUTCMonth(), todayKst.getUTCDate());
  const dday = due ? Math.round((Date.UTC(due.year, due.month - 1, due.day) - today) / 86400000) : null;
  const ddayText = dday == null ? '' : dday > 0 ? `D-${dday}` : dday === 0 ? 'D-DAY' : `D+${-dday}`;
  const dueText = due ? `${due.month}.${due.day}(${(WEEKDAYS[locale] ?? WEEKDAYS.en)[due.weekday]})` : info.dueDate;

  return (
    <div className="rounded-2xl bg-[#191F28] px-5 pt-5 pb-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#FF6B6B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]"/>
          {await translate('pass_status_unpaid')}
        </span>
        {ddayText && <span className="text-[13px] font-bold font-paperlogy text-[#FF6B6B] tracking-wide">{ddayText}</span>}
      </div>

      <p className="mt-2.5 text-[17px] font-bold tracking-[-0.3px]">{await translate('regular_class_unpaid_title')}</p>
      <p className="mt-1 text-[28px] font-bold font-paperlogy leading-tight">
        {info.amount.toLocaleString('ko-KR')}<span className="text-[18px] ml-0.5">{await translate('won')}</span>
      </p>

      <div className="mt-3 flex flex-col gap-1 text-[12.5px] text-white/60 tracking-[-0.2px]">
        <span>{info.planName} · {shortDate(info.startDate)} ~ {shortDate(info.endDate)}</span>
        <span>{(await translate('regular_class_unpaid_due')).replace('{date}', dueText)}</span>
      </div>

      {/* TODO(2026-10-26): API 연동 — 미납분 결제 경로 확정되면 교체 (지금은 같은 가격정책 결제 페이지) */}
      <NavigateClickWrapper method="push" route={KloudScreen.PassPlanPayment(info.passPlanId)}>
        <button type="button" className="mt-4 w-full h-12 rounded-[14px] bg-white text-[#191F28] text-[15px] font-bold active:opacity-80">
          {await translate('regular_class_unpaid_pay')}
        </button>
      </NavigateClickWrapper>
    </div>
  );
};
