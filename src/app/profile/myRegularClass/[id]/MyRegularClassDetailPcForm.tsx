// PC 웹 내 정규반 상세 — 패스 상세 PC(MyPassDetailPcForm)와 같은 중앙 카드 레이아웃. 헤더 카드 + 수업 목록 카드.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { MyRegularClassLessonsResponse } from "@/app/endpoint/studio.endpoint";
import { RegularClassHeaderInfo } from "@/app/profile/myRegularClass/[id]/RegularClassHeaderInfo";
import { RegularClassLessonList } from "@/app/profile/myRegularClass/[id]/RegularClassLessonList";

export const MyRegularClassDetailPcForm = async ({ pass, lessons, locale }: {
  pass: GetPassResponse;
  lessons: MyRegularClassLessonsResponse;
  locale: Locale;
}) => (
  <div className="w-full min-h-screen bg-[#f9f9fb] pt-12 pb-24">
    <div className="mx-auto w-full max-w-[680px] px-8 flex flex-col gap-4">
      <header className="rounded-2xl border border-[#f0f1f3] p-6" style={{ background: 'linear-gradient(135deg, #E9F1FF 0%, #FCF3FF 100%)' }}>
        <RegularClassHeaderInfo pass={pass} locale={locale} variant="pc"/>
      </header>

      {pass.status === 'Waiting' && pass.startDate && (
        <section className="p-5 bg-[#FFFDF5] rounded-2xl border border-[#F59E0B]/20">
          <span className="text-[#F59E0B] font-semibold text-sm">{pass.startDate} {await translate('waiting_pass_start_date')}</span>
        </section>
      )}

      <section className="rounded-2xl border border-[#f0f1f3] bg-white p-6">
        <h2 className="text-[16px] font-bold text-black mb-5">{await translate('regular_class_lessons')}</h2>
        <RegularClassLessonList lessons={lessons.lessons} locale={locale} isMock={lessons.isMock}/>
      </section>
    </div>
  </div>
);
