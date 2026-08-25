import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import React from "react";
import { MyPassDetailForm } from "@/app/profile/myPass/[id]/MyPassDetailForm";
import { MyPassDetailPcForm } from "@/app/profile/myPass/[id]/MyPassDetailPcForm";

export default async function MyPassDetailPage({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ appVersion?: string }>,
}) {
  const pass = await getPassAction({id: (await params).id});
  const { appVersion = '' } = await searchParams;

  if (!('id' in pass)) {
    return null;
  }

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 카드 레이아웃, 그 외(앱 웹뷰/좁은 웹)는 기존 렌더.
  // 서버는 viewport를 모르므로 둘 다 SSR 렌더 후 CSS로 토글 (결제내역/수업 상세와 동일 패턴).
  const isWeb = appVersion === '';

  return isWeb ? (
    <>
      <div className="hidden lg:block">
        <MyPassDetailPcForm pass={pass} />
      </div>
      <div className="lg:hidden">
        <MyPassDetailForm pass={pass} />
      </div>
    </>
  ) : (
    <MyPassDetailForm pass={pass} />
  );
}
