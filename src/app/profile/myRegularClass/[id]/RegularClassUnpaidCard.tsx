// 내 정규반 상세 — 미납 안내 카드. 서버가 route 를 준(저장 상태 Unpaid) 패스면 헤더 바로 아래에 띄운다. 모바일/PC 공용 서버 컴포넌트.
// 검정 카드 + 큰 금액(Paperlogy) — 수업 목록 날짜 타일과 같은 톤. 결제하기 → 서버가 준 route(/payment?…&paymentId=LP…) 그대로.
// 미납이어도 수업 이용은 멈추지 않는다 — 기한·D-day 없이 '미납됐으니 결제해 달라'고만 안내.
// 자동결제가 걸린 패스가 실패해 재시도 대기(Failed)면 다음 시도 시각을, 재시도 끝 해지됐으면 직접 결제하라는 한 줄을 덧붙인다.

import React from "react";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { UnpaidInfo } from "@/app/profile/myRegularClass/[id]/unpaid.info";
import { parts } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";
import { withYearNumeric } from "@/utils/year.label";

const shortDate = (s: string) => {
  const p = parts(s);
  return p ? withYearNumeric(`${p.month}.${p.day}`, p.year) : s; // 올해가 아니면 연도까지
};

export const RegularClassUnpaidCard = async ({ info }: { info: UnpaidInfo }) => {
  const sub = info.subscription;
  // 자동결제 안내 — Failed(재시도 대기)면 다음 시도 시각, 그 외(자동 해지)면 직접 결제 안내
  const subscriptionNote = sub
    ? sub.status === 'Failed' && sub.paymentScheduledAt
      ? (await translate('regular_class_unpaid_retry')).replace('{date}', shortDate(sub.paymentScheduledAt))
      : await translate('regular_class_unpaid_subscription_ended')
    : null;

  return (
    <div className="rounded-2xl bg-[#191F28] px-5 pt-5 pb-4 text-white">
      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#FF6B6B]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]"/>
        {await translate('pass_status_unpaid')}
      </span>

      <p className="mt-2.5 text-[17px] font-bold tracking-[-0.3px]">{await translate('regular_class_unpaid_title')}</p>
      <p className="mt-1 text-[28px] font-bold font-paperlogy leading-tight">
        {info.amount.toLocaleString('ko-KR')}<span className="text-[18px] ml-0.5">{await translate('won')}</span>
      </p>

      <div className="mt-3 flex flex-col gap-1 text-[12.5px] text-white/60 tracking-[-0.2px]">
        <span>{info.planName} · {shortDate(info.startDate)} ~ {shortDate(info.endDate)}</span>
        <span>{await translate('regular_class_unpaid_notice')}</span>
        {subscriptionNote && <span className="text-[#FFB4B4]">{subscriptionNote}</span>}
      </div>

      <NavigateClickWrapper method="push" route={info.route}>
        <button type="button" className="mt-4 w-full h-12 rounded-[14px] bg-white text-[#191F28] text-[15px] font-bold active:opacity-80">
          {await translate('regular_class_unpaid_pay')}
        </button>
      </NavigateClickWrapper>
    </div>
  );
};
