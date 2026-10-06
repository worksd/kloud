// 모바일(앱 웹뷰 + 좁은 웹) 내 정규반 상세 — 패스 상세(MyPassDetailForm)와 같은 그래디언트 헤더,
// 아래 흰 영역은 이용혜택 대신 수업(회차) 목록(이 상품으로 발급된 수강권). PC 는 MyRegularClassDetailPcForm.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { RegularClassHeaderInfo } from "@/app/profile/myRegularClass/[id]/RegularClassHeaderInfo";
import { RegularClassLessonList } from "@/app/profile/myRegularClass/[id]/RegularClassLessonList";
import { collectRegularClassTickets } from "@/app/profile/myRegularClass/[id]/regular.class.tickets";

export const MyRegularClassDetailForm = async ({ pass, locale }: { pass: GetPassResponse; locale: Locale }) => (
  <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(135deg, #E9F1FF 0%, #FCF3FF 100%)' }}>
    {/* 노치 가리개 — 페이지가 ignoreSafeArea. 이미지가 없는 화면이라 패스 상세의 '이미지 없음' 여백과 동일 */}
    <div className="w-full" style={{ paddingTop: 'calc(env(safe-area-inset-top, 44px) + 88px)' }}/>

    <div className="px-6 pt-5 pb-4">
      <RegularClassHeaderInfo pass={pass} locale={locale} variant="mobile"/>
    </div>

    {/* Waiting — 시작 예정 안내 (패스 상세와 동일) */}
    {pass.status === 'Waiting' && pass.startDate && (
      <div className="mx-6 mb-2 p-4 bg-[#FFFDF5] rounded-xl border border-[#F59E0B]/20">
        <span className="text-[#F59E0B] font-semibold text-sm">{pass.startDate} {await translate('waiting_pass_start_date')}</span>
      </div>
    )}

    <div className="bg-white rounded-t-[24px] flex-1 px-6 pt-6 pb-20">
      <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-4">{await translate('regular_class_lessons')}</h2>
      <RegularClassLessonList tickets={collectRegularClassTickets(pass)} locale={locale}/>
    </div>
  </div>
);
