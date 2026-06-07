// /studios — 스튜디오 목록 진입점.
// - 앱 웹뷰: 안내 메시지
// - PC 웹(lg+): mock 그리드

import React from "react";
import StudiosMobileForm from "@/app/studios/StudiosMobileForm";
import StudiosPcForm from "@/app/studios/StudiosPcForm";

export default async function StudiosListPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>;
}) {
  const { appVersion = '' } = await searchParams;
  const isWeb = appVersion === '';

  if (!isWeb) {
    return <StudiosMobileForm/>;
  }

  return (
    <>
      <div className="hidden lg:block">
        <StudiosPcForm/>
      </div>
      <div className="lg:hidden">
        <StudiosMobileForm/>
      </div>
    </>
  );
}
