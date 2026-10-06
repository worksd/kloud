// 내 정규반 상세 — /profile/myRegularClass/:passId. 마이페이지 '내 정규반' 카드에서 들어온다.
// 헤더는 GET /passes/:id 실데이터(passPlan.regularClass 가 반), 수업 목록은 BE API 전까지 mock (화면에 Mock 표시).

import React from "react";
import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { getMyRegularClassLessonsAction } from "@/app/profile/myRegularClass/[id]/action/get.my.regular.class.lessons.action";
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

  const [lessons, locale] = await Promise.all([
    getMyRegularClassLessonsAction({ pass }),
    getLocale(),
  ]);

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 카드 레이아웃 — 패스 상세와 같은 분기
  const isWeb = appVersion === '';
  return isWeb ? (
    <>
      <div className="hidden lg:block"><MyRegularClassDetailPcForm pass={pass} lessons={lessons} locale={locale}/></div>
      <div className="lg:hidden"><MyRegularClassDetailForm pass={pass} lessons={lessons} locale={locale}/></div>
    </>
  ) : (
    <MyRegularClassDetailForm pass={pass} lessons={lessons} locale={locale}/>
  );
}
