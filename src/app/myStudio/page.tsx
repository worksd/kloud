// PC 웹 내 스튜디오 홈 — /myStudio.
// ?id=33처럼 스튜디오를 지정하면 그 스튜디오 기준으로, 없으면 서버가 정한다(쿠키 힌트 + 기본 스튜디오).
// LNB '내 스튜디오' 메뉴·하위 스튜디오 리스트의 목적지이며, /home(PC 웹)도 이 경로로 리다이렉트한다.

import React from "react";
import { api } from "@/app/api.client";
import { getHomeAction } from "@/app/home/get.home.action";
import { HomePcForm } from "@/app/home/HomePcForm";
import { StudioCookieSetter } from "@/app/home/StudioCookieSetter";
import { TrackView } from "@/app/components/TrackView";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";

export default async function MyStudioHomePage({searchParams}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams;
  const res = id ? await api.home.getHome({ studioId: id }) : await getHomeAction();

  if ('studios' in res) {
    const studioId = res.myStudio?.studio?.id;
    return (
      <>
        <TrackView event="enter_home" props={{studioId: studioId ?? null}}/>
        {/* 스튜디오 쿠키 동기화 — 연습실 일정 등 쿠키 기반 화면들과 컨텍스트를 맞춘다 */}
        {studioId && <StudioCookieSetter studioId={studioId}/>}
        <HomePcForm home={res}/>
      </>
    );
  }

  const result = await handleApiError(res, 'GET /home');
  if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
}
