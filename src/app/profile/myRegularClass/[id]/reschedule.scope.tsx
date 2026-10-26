// 내 정규반 상세 — 수업 일정 변경 Provider 를 pass 로 감싸는 서버 래퍼. 모바일/PC 폼 공용.

import React from "react";
import { Locale } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { RegularClassDetailResponse } from "@/app/endpoint/studio.endpoint";
import { collectRegularClassTickets } from "@/app/profile/myRegularClass/[id]/regular.class.tickets";
import { RegularClassRescheduleProvider } from "@/app/profile/myRegularClass/[id]/RegularClassReschedule";
import { getRescheduleHistoryMock, getRescheduleQuotaMock } from "@/app/profile/myRegularClass/[id]/reschedule.mock";

// Provider — 헤더(⋮)와 목록(바뀐 칩·새 일정)이 같은 상태를 본다.
// TODO(2026-10-26): API 연동 — 한도·사용 횟수(서버 필드)와 변경 이력(API)이 목. 붙으면 교체
export const RescheduleScope = ({ pass, regularClass, locale, children }: { pass: GetPassResponse; regularClass: RegularClassDetailResponse | null; locale: Locale; children: React.ReactNode }) => {
  const quota = getRescheduleQuotaMock();
  return (
    <RegularClassRescheduleProvider
      locale={locale}
      tickets={collectRegularClassTickets(pass)}
      // 요일 — 산 상품에 박힌 요일 > 반 요일 > 가격정책 요일
      days={pass.days?.length ? pass.days : (regularClass?.days ?? pass.passPlan?.days ?? [])}
      endDate={pass.endDate}
      limit={quota.limit}
      used={quota.used}
      history={getRescheduleHistoryMock()}
    >
      {children}
    </RegularClassRescheduleProvider>
  );
};
