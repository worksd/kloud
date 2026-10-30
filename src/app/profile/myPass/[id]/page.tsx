import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import React from "react";
import { MyPassDetailForm } from "@/app/profile/myPass/[id]/MyPassDetailForm";
import { MyPassDetailPcForm } from "@/app/profile/myPass/[id]/MyPassDetailPcForm";
import { redirect } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";

export default async function MyPassDetailPage({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ appVersion?: string }>,
}) {
  const pass = await getPassAction({id: (await params).id});
  const { appVersion = '' } = await searchParams;

  if (!('id' in pass)) {
    return null;
  }
  // 정규반 상품(passPlan.category=Class)은 패스권 상세가 아니라 내 정규반 상세로 — 혜택 대신 수업 목록을 보여준다
  if (pass.passPlan?.category === 'Class') {
    redirect(KloudScreen.MyRegularClassDetail(pass.id, pass.passPlan.regularClass?.id));
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
