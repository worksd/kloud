// 모바일(앱 웹뷰 + 좁은 웹) 내 정규반 상세 — 패스 상세(MyPassDetailForm)와 같은 그래디언트 헤더,
// 아래 흰 영역은 이용혜택 대신 수업(회차) 목록(이 상품으로 발급된 수강권). PC 는 MyRegularClassDetailPcForm.

import React from "react";
import { translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { RegularClassDetailResponse } from "@/app/endpoint/studio.endpoint";
import { RegularClassHeaderInfo } from "@/app/profile/myRegularClass/[id]/RegularClassHeaderInfo";
import { RegularClassHistoryData, RegularClassLessonList } from "@/app/profile/myRegularClass/[id]/RegularClassLessonList";
import { collectRegularClassTickets } from "@/app/profile/myRegularClass/[id]/regular.class.tickets";
import { RescheduleScope } from "@/app/profile/myRegularClass/[id]/reschedule.scope";
import { RegularClassUnpaidCard } from "@/app/profile/myRegularClass/[id]/RegularClassUnpaidCard";
import { UnpaidInfo } from "@/app/profile/myRegularClass/[id]/unpaid.mock";
import { RegularClassTopBar, TOP_BAR_SPACE } from "@/app/profile/myRegularClass/[id]/RegularClassTopBar";

export const MyRegularClassDetailForm = async ({ pass, regularClass, history, unpaid, locale }: {
  pass: GetPassResponse;
  regularClass: RegularClassDetailResponse | null;
  /** 이 반 수강 내역 첫 페이지 — 못 받으면 null(pass 의 지난 수업으로 폴백) */
  history: RegularClassHistoryData | null;
  /** 미납이면 안내 카드 — 없으면 null */
  unpaid: UnpaidInfo | null;
  locale: Locale;
}) => (
  <RescheduleScope pass={pass} regularClass={regularClass} locale={locale}>
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(135deg, #E9F1FF 0%, #FCF3FF 100%)' }}>
      {/* ignoreSafeArea + 네이티브 앱바 없음 — 상태바(최소 44px 보장) + 뒤로가기·⋮ 줄은 화면이 직접 그린다 */}
      <RegularClassTopBar overImage={!!regularClass?.imageUrl}/>
      {/* 반 이미지(정규반 상세 imageUrl)가 있으면 상태바까지 풀블리드 히어로, 없으면 버튼 줄만큼 비운다 — 패스 상세와 같은 방식 */}
      {regularClass?.imageUrl ? (
        <div className="w-full aspect-[4/3] bg-[#F1F3F6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={regularClass.imageUrl} alt="" className="w-full h-full object-cover"/>
        </div>
      ) : (
        <div className="w-full" style={{ paddingTop: TOP_BAR_SPACE }}/>
      )}

      <div className="px-6 pt-5 pb-4">
        <RegularClassHeaderInfo pass={pass} regularClass={regularClass} locale={locale} variant="mobile"/>
      </div>

      {/* 미납 안내 — 헤더 바로 아래, 결제하기로 결제 페이지 */}
      {unpaid && (
        <div className="px-6 pb-4">
          <RegularClassUnpaidCard info={unpaid} locale={locale}/>
        </div>
      )}

      {/* Waiting — 시작 예정 안내 (패스 상세와 동일) */}
      {pass.status === 'Waiting' && pass.startDate && (
        <div className="mx-6 mb-2 p-4 bg-[#FFFDF5] rounded-xl border border-[#F59E0B]/20">
          <span className="text-[#F59E0B] font-semibold text-sm">{pass.startDate} {await translate('waiting_pass_start_date')}</span>
        </div>
      )}

      <div className="bg-white rounded-t-[24px] flex-1 px-6 pt-6 pb-20">
        <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-4">{await translate('regular_class_lessons')}</h2>
        <RegularClassLessonList tickets={collectRegularClassTickets(pass)} history={history} locale={locale}/>
      </div>
    </div>
  </RescheduleScope>
);
