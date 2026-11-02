// 내 정규반 상세 — 수업 일정 변경 Provider 를 서버 데이터로 감싸는 래퍼. 모바일/PC 폼 공용.
// 시작 전 수강권(GET …/tickets?type=upcoming)과 이 패스의 미룬 내역(GET …/postpones?passId=)을 받아 넘긴다.
// 한도·쓴 횟수는 이 패스로 나간 수강권의 pass 에서, 없으면 내역의 pass 에서 읽는다(정규반 상세 응답엔 없다).
// 미루기 성공 후엔 router.refresh() 로 이 래퍼가 다시 돌아 목록·횟수·내역이 함께 갱신된다.

import React from "react";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { RegularClassDetailResponse } from "@/app/endpoint/studio.endpoint";
import { collectRegularClassTickets } from "@/app/profile/myRegularClass/[id]/regular.class.tickets";
import { RegularClassRescheduleProvider } from "@/app/profile/myRegularClass/[id]/RegularClassReschedule";
import { getRegularClassPostponesAction, getUpcomingRegularClassTicketsAction } from "@/app/profile/myRegularClass/[id]/postpone.actions";

export const RescheduleScope = async ({ pass, regularClass, locale, children }: { pass: GetPassResponse; regularClass: RegularClassDetailResponse | null; locale: Locale; children: React.ReactNode }) => {
  const regularClassId = regularClass?.id ?? pass.passPlan?.regularClass?.id;
  if (!regularClassId) return <>{children}</>;

  const [upcoming, postpones] = await Promise.all([
    getUpcomingRegularClassTicketsAction({ id: regularClassId }),
    getRegularClassPostponesAction({ id: regularClassId, passId: pass.id }),
  ]);
  // 이 패스로 나간 시작 전 수강권만 미룰 수 있다(단건 결제·다른 주기 패스 제외)
  const mine = upcoming.filter((tk) => tk.pass?.id === pass.id);
  const quota = mine.find((tk) => tk.pass)?.pass ?? postpones.find((p) => p.pass?.id === pass.id)?.pass ?? null;

  return (
    <RegularClassRescheduleProvider
      locale={locale}
      regularClassId={regularClassId}
      upcoming={mine}
      passTickets={collectRegularClassTickets(pass)}
      // 요일 — 산 상품에 박힌 요일(서버 규칙도 pass.days) > 반 요일 > 가격정책 요일
      days={pass.days?.length ? pass.days : (regularClass?.days ?? pass.passPlan?.days ?? [])}
      endDate={pass.endDate}
      quota={quota}
      history={postpones}
    >
      {children}
    </RegularClassRescheduleProvider>
  );
};
