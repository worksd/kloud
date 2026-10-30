// PC 웹 내 정규반 상세 — 패스 상세 PC(MyPassDetailPcForm)와 같은 중앙 카드 레이아웃. 헤더 카드 + 수업 목록 카드.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { RegularClassDetailResponse } from "@/app/endpoint/studio.endpoint";
import { RegularClassHeaderInfo } from "@/app/profile/myRegularClass/[id]/RegularClassHeaderInfo";
import { RegularClassHistoryData, RegularClassLessonList } from "@/app/profile/myRegularClass/[id]/RegularClassLessonList";
import { RescheduleScope } from "@/app/profile/myRegularClass/[id]/reschedule.scope";
import { RegularClassUnpaidCard } from "@/app/profile/myRegularClass/[id]/RegularClassUnpaidCard";
import { UnpaidInfo } from "@/app/profile/myRegularClass/[id]/unpaid.mock";
import { collectRegularClassTickets } from "@/app/profile/myRegularClass/[id]/regular.class.tickets";

export const MyRegularClassDetailPcForm = async ({ pass, regularClass, history, unpaid, locale }: {
  pass: GetPassResponse;
  regularClass: RegularClassDetailResponse | null;
  /** 이 반 수강 내역 첫 페이지 — 못 받으면 null(pass 의 지난 수업으로 폴백) */
  history: RegularClassHistoryData | null;
  /** 미납이면 안내 카드 — 없으면 null */
  unpaid: UnpaidInfo | null;
  locale: Locale;
}) => (
  <RescheduleScope pass={pass} regularClass={regularClass} locale={locale}>
    <div className="w-full min-h-screen bg-[#f9f9fb] pt-12 pb-24">
      <div className="mx-auto w-full max-w-[680px] px-8 flex flex-col gap-4">
        <header className="rounded-2xl border border-[#f0f1f3] p-6" style={{ background: 'linear-gradient(135deg, #E9F1FF 0%, #FCF3FF 100%)' }}>
          <RegularClassHeaderInfo pass={pass} regularClass={regularClass} locale={locale} variant="pc"/>
        </header>

        {unpaid && <RegularClassUnpaidCard info={unpaid}/>}

        {pass.status === 'Waiting' && pass.startDate && (
          <section className="p-5 bg-[#FFFDF5] rounded-2xl border border-[#F59E0B]/20">
            <span className="text-[#F59E0B] font-semibold text-sm">{pass.startDate} {await translate('waiting_pass_start_date')}</span>
          </section>
        )}

        {/* '수업 목록' 큰 제목 없이 섹션 제목(다가오는 수업 / 수강 내역)만 */}
        <section className="rounded-2xl border border-[#f0f1f3] bg-white p-6">
          <RegularClassLessonList tickets={collectRegularClassTickets(pass)} history={history} locale={locale}/>
        </section>
      </div>
    </div>
  </RescheduleScope>
);
