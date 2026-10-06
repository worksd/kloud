// 내 정규반 상세 — /profile/myRegularClass/:passId. 마이페이지 '내 정규반' 카드에서 들어온다.
// 데이터는 GET /passes/:id 하나 — passPlan.regularClass 가 반, 룰별 수강권(passRule(s).tickets)이 수업 목록.

import React from "react";
import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { MyRegularClassDetailForm } from "@/app/profile/myRegularClass/[id]/MyRegularClassDetailForm";
import { MyRegularClassDetailPcForm } from "@/app/profile/myRegularClass/[id]/MyRegularClassDetailPcForm";
import { getLocale } from "@/utils/translate";

export default async function MyRegularClassDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ appVersion?: string }>,
}) {
  const id = Number((await params).id);
  const { appVersion = '' } = await searchParams;
  const pass = await getPassAction({ id });
  if (!('id' in pass)) return null;

  const locale = await getLocale();

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 카드 레이아웃 — 패스 상세와 같은 분기
  const isWeb = appVersion === '';
  return isWeb ? (
    <>
      <div className="hidden lg:block"><MyRegularClassDetailPcForm pass={pass} locale={locale}/></div>
      <div className="lg:hidden"><MyRegularClassDetailForm pass={pass} locale={locale}/></div>
    </>
  ) : (
    <MyRegularClassDetailForm pass={pass} locale={locale}/>
  );
}
