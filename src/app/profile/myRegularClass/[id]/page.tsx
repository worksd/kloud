// 내 정규반 상세 — /profile/myRegularClass/:passId?regularClassId=. 마이페이지 '내 정규반' 카드에서 들어온다.
// 미납 안내는 pass.route 가 올 때(저장 상태 Unpaid) — unpaid.info.ts.
// 데이터 두 갈래:
//  - GET /passes/:id            — 기간·요일·QR, 룰별 수강권(passRule(s).tickets)이 수업 목록
//  - GET /regular-classes/:id   — 반 정보(이름 등). id 는 카드가 실어 준 regularClassId, 없으면 pass 의 passPlan.regularClass.id
//  - GET /regular-classes/:id/tickets?type=past — 이 반 수강 내역(지난 기간·단건 결제 포함) 첫 페이지, 나머지는 스크롤로

import React from "react";
import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { getRegularClassAction } from "@/app/profile/myRegularClass/[id]/get.regular.class.action";
import { MyRegularClassDetailForm } from "@/app/profile/myRegularClass/[id]/MyRegularClassDetailForm";
import { MyRegularClassDetailPcForm } from "@/app/profile/myRegularClass/[id]/MyRegularClassDetailPcForm";
import { getLocale } from "@/utils/translate";
import { getUnpaidInfo } from "@/app/profile/myRegularClass/[id]/unpaid.info";
import { buildPaymentPeriodsMock } from "@/app/profile/myRegularClass/[id]/history.periods.mock";
import { getRegularClassTicketsAction } from "@/app/profile/myRegularClass/[id]/get.regular.class.tickets.action";
import { RegularClassHistoryData } from "@/app/profile/myRegularClass/[id]/RegularClassLessonList";

export default async function MyRegularClassDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ appVersion?: string, regularClassId?: string }>,
}) {
  const id = Number((await params).id);
  const { appVersion = '', regularClassId: regularClassIdParam } = await searchParams;
  const paramRegularClassId = Number(regularClassIdParam) || undefined;

  // 반 id 를 알면 두 API 를 동시에, 모르면 pass 를 받은 뒤 passPlan.regularClass.id 로
  const [pass, regularClassByParam, historyByParam] = await Promise.all([
    getPassAction({ id }),
    paramRegularClassId ? getRegularClassAction({ id: paramRegularClassId }) : Promise.resolve(null),
    paramRegularClassId ? getRegularClassTicketsAction({ id: paramRegularClassId, page: 1 }) : Promise.resolve(null),
  ]);
  if (!('id' in pass)) return null;
  const fallbackId = !paramRegularClassId ? pass.passPlan?.regularClass?.id : undefined;
  const [regularClassRes, historyRes] = fallbackId
    ? await Promise.all([getRegularClassAction({ id: fallbackId }), getRegularClassTicketsAction({ id: fallbackId, page: 1 })])
    : [regularClassByParam, historyByParam];
  const historyClassId = paramRegularClassId ?? fallbackId;
  // TODO(2026-10-30): API 연동 — 결제 회차 목록(periods)은 history.periods.mock.ts 가 pass 기간으로 만든 목. 서버가 주면 교체
  const history: RegularClassHistoryData | null = historyRes && historyClassId
    ? { regularClassId: historyClassId, periods: buildPaymentPeriodsMock(pass), days: pass.days ?? [], ...historyRes }
    : null;
  // 반 상세를 못 받아도 화면은 그린다 — 이름은 pass 쪽으로 폴백
  const regularClass = regularClassRes && 'id' in regularClassRes ? regularClassRes : null;

  // 미납 안내 — 서버가 route 를 준 패스만(결제하기는 그 route 로)
  const unpaid = getUnpaidInfo(pass);

  const locale = await getLocale();

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 카드 레이아웃 — 패스 상세와 같은 분기
  const isWeb = appVersion === '';
  return isWeb ? (
    <>
      <div className="hidden lg:block"><MyRegularClassDetailPcForm pass={pass} regularClass={regularClass} history={history} unpaid={unpaid} locale={locale}/></div>
      <div className="lg:hidden"><MyRegularClassDetailForm pass={pass} regularClass={regularClass} history={history} unpaid={unpaid} locale={locale}/></div>
    </>
  ) : (
    <MyRegularClassDetailForm pass={pass} regularClass={regularClass} history={history} unpaid={unpaid} locale={locale}/>
  );
}
