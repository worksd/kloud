// /events — 행사 목록 진입점.
// - 앱 웹뷰: 안내 메시지
// - PC 웹(lg+): mock 행사 그리드

import React from "react";
import EventsMobileForm from "@/app/events/EventsMobileForm";
import EventsPcForm from "@/app/events/EventsPcForm";

export default async function EventsListPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>;
}) {
  const { appVersion = '' } = await searchParams;
  const isWeb = appVersion === '';

  if (!isWeb) {
    return <EventsMobileForm/>;
  }

  return (
    <>
      <div className="hidden lg:block">
        <EventsPcForm/>
      </div>
      <div className="lg:hidden">
        <EventsMobileForm/>
      </div>
    </>
  );
}
