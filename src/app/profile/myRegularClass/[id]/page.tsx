// 내 정규반 상세 — /profile/myRegularClass/:passId?regularClassId=. 마이페이지 '내 정규반' 카드에서 들어온다.
// 데이터 두 갈래:
//  - GET /passes/:id            — 기간·요일·QR, 룰별 수강권(passRule(s).tickets)이 수업 목록
//  - GET /regular-classes/:id   — 반 정보(이름 등). id 는 카드가 실어 준 regularClassId, 없으면 pass 의 passPlan.regularClass.id

import React from "react";
import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { getRegularClassAction } from "@/app/profile/myRegularClass/[id]/get.regular.class.action";
import { MyRegularClassDetailForm } from "@/app/profile/myRegularClass/[id]/MyRegularClassDetailForm";
import { MyRegularClassDetailPcForm } from "@/app/profile/myRegularClass/[id]/MyRegularClassDetailPcForm";
import { getLocale } from "@/utils/translate";

export default async function MyRegularClassDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ appVersion?: string, regularClassId?: string }>,
}) {
  const id = Number((await params).id);
  const { appVersion = '', regularClassId: regularClassIdParam } = await searchParams;
  const paramRegularClassId = Number(regularClassIdParam) || undefined;

  // 반 id 를 알면 두 API 를 동시에, 모르면 pass 를 받은 뒤 passPlan.regularClass.id 로
  const [pass, regularClassByParam] = await Promise.all([
    getPassAction({ id }),
    paramRegularClassId ? getRegularClassAction({ id: paramRegularClassId }) : Promise.resolve(null),
  ]);
  if (!('id' in pass)) return null;
  const fallbackId = !paramRegularClassId ? pass.passPlan?.regularClass?.id : undefined;
  const regularClassRes = regularClassByParam ?? (fallbackId ? await getRegularClassAction({ id: fallbackId }) : null);
  // 반 상세를 못 받아도 화면은 그린다 — 이름은 pass 쪽으로 폴백
  const regularClass = regularClassRes && 'id' in regularClassRes ? regularClassRes : null;

  const locale = await getLocale();

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 카드 레이아웃 — 패스 상세와 같은 분기
  const isWeb = appVersion === '';
  return isWeb ? (
    <>
      <div className="hidden lg:block"><MyRegularClassDetailPcForm pass={pass} regularClass={regularClass} locale={locale}/></div>
      <div className="lg:hidden"><MyRegularClassDetailForm pass={pass} regularClass={regularClass} locale={locale}/></div>
    </>
  ) : (
    <MyRegularClassDetailForm pass={pass} regularClass={regularClass} locale={locale}/>
  );
}
