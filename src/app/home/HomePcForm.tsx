// PC 웹 전용 내 스튜디오 홈 — 데이터는 모바일 홈과 같은 GET /home(myStudio) 응답을 그대로 쓰되,
// UI는 PC에 맞게 큼직하게: 점보트론 히어로(D-day 칩) + 오늘의 수업 와이드 카드 + 큼직한 포스터 밴드.
// 분기는 page.tsx에서 appVersion + viewport(lg)로.

import React from "react";
import Link from "next/link";
import { HomeLessonResponse } from "@/app/endpoint/home.endpoint";
import { ParsedHome } from "@/app/home/home.bands";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { CircleImage } from "@/app/components/CircleImage";
import { LessonsPcHeroCarousel, HeroItem } from "@/app/lessons/LessonsPcHeroCarousel";
import { Locale } from "@/shared/StringResource";
import { LessonTags } from "@/app/components/LessonTags";
import { LessonRelativeDate } from "@/app/components/LessonRelativeDate";
import { getLocale, translate } from "@/utils/translate";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";

// 홈 수업 카드 — 통합 응답의 수업 탐색 밴드 아이템(HomeLessonResponse)과
// 내 스튜디오 밴드 수업(GetBandLessonResponse) 둘 다 이 넓은 타입으로 소비한다.
type RichLesson = HomeLessonResponse;

const artistOf = (l: RichLesson) =>
  (l.artists?.[0]?.nickName ?? l.artists?.[0]?.name) ?? (l.artist?.nickName ?? l.artist?.name);

const artistImageOf = (l: RichLesson) =>
  l.artists?.[0]?.profileImageUrl ?? l.artist?.profileImageUrl;

const genreOf = (l: RichLesson) => {
  const genre = l.label?.genre ?? l.genre;
  return genre && genre !== 'Default' ? genre : undefined;
};

const isEndedOf = (l: RichLesson) => l.label?.isEnded ?? false;

// 포스터 카드 — 모바일 Poster와 동일 구조(PC 폭 240): 썸네일(팝업/워크샵 라벨·종료 하단 바)
// + 아래 텍스트(스튜디오 로고·이름, 태그, 제목, 상대 시각)
// 라벨들은 서버(HomePcForm)에서 translate로 미리 풀어 내려준다 — getLocaleString은 'use client' 모듈이라 서버에서 호출 불가
const PosterCard = ({l, locale, endedLabel, popupLabel, workshopLabel}: {
  l: RichLesson; locale: Locale; endedLabel: string; popupLabel: string; workshopLabel: string;
}) => {
  const ended = isEndedOf(l);
  const studioImage = l.studioImageUrl || l.studio?.profileImageUrl;
  const studioName = l.studioName || l.studio?.name;
  return (
    <Link href={KloudScreen.LessonDetail(l.id)} className="w-[240px] flex-none snap-start group">
      <div className="relative overflow-hidden rounded-[16px] bg-[#F1F3F6] aspect-[3/4] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.35)]">
        {l.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.thumbnailUrl} alt={l.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"/>
        )}
        {(l.label?.type === 'PopUp' || l.label?.type === 'Workshop') && (
          <div className="absolute top-2 left-2 bg-[#1F1F1F] px-1 py-1 rounded-[4px] text-white font-paperlogy font-bold text-[11px] leading-none">
            {l.label.type === 'PopUp' ? popupLabel : workshopLabel}
          </div>
        )}
        {/* 종료 — 모바일과 동일하게 썸네일 하단 검정 바 */}
        {ended && (
          <div className="absolute bottom-0 w-full bg-black/60 py-2 text-white text-center font-bold text-[14px]">
            {endedLabel}
          </div>
        )}
      </div>

      {/* 텍스트 영역 — 썸네일 아래 */}
      <div className="w-full mt-2">
        {studioImage && (
          <div className="flex items-center gap-1 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-[24px] h-[24px] rounded-full border border-[#F7F8F9] object-cover"
              src={studioImage}
              alt="스튜디오 로고"
            />
            {studioName && <span className="text-[12px] font-medium text-[#484B4D]">{studioName}</span>}
          </div>
        )}
        {l.label?.tags && <LessonTags tags={l.label.tags} className="mb-1.5"/>}
        <div className="text-black font-bold text-[14px] line-clamp-2">{l.title}</div>
        <LessonRelativeDate
          when={{ date: l.date, startTime: l.startTime, startDate: l.startDate }}
          locale={locale}
          fallback={l.date ?? ''}
          className="text-gray-500 text-[12px] truncate font-medium"
        />
      </div>
    </Link>
  );
};

// 가로 스크롤 밴드 래퍼 — 좌측 인셋 + 우측 뷰포트 끝까지
const Band = ({title, subtitle, children}: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="w-full">
    <div className="mb-5 pl-6">
      <h2 className="text-[22px] font-bold text-black tracking-tight">{title}</h2>
      {subtitle && <p className="text-[13px] text-[#86898C] mt-1">{subtitle}</p>}
    </div>
    {/* py+음수 마진 — 호버 리프트/섀도가 overflow 컨테이너에 잘리지 않게 */}
    <div className="overflow-x-auto scrollbar-hide py-6 -my-6">
      <div className="flex gap-5 snap-x">
        {/* leading spacer 0.25rem + gap 1.25rem = 타이틀(pl-6)과 첫 카드 정렬 */}
        <div className="shrink-0 w-1" aria-hidden/>
        {children}
        <div className="shrink-0 w-6" aria-hidden/>
      </div>
    </div>
  </section>
);

export const HomePcForm = async ({home}: { home: ParsedHome }) => {
  const my = home.myStudio;
  const locale = await getLocale();
  const endedLabel = await translate('finish');
  const popupLabel = await translate('popup');
  const workshopLabel = await translate('workshop');

  // 밴드 구성 — 내 스튜디오(myStudio.bands)가 있으면 그걸, 없으면 탐색 밴드(TodayLessons)로 조립.
  // weeklyLessons는 주간 시간표가 요일별로 이미 보여주므로 밴드로는 노출하지 않는다.
  const bands: { title: string; type: string; lessons: RichLesson[] }[] = (my?.bands?.length ?? 0) > 0
    ? my!.bands.map((b) => ({ title: b.title, type: b.type, lessons: b.lessons as RichLesson[] }))
    : [
        ...(home.todayLessons.length > 0 ? [{ title: await translate('today_lessons'), type: 'Today', lessons: home.todayLessons }] : []),
      ];

  // 점보트론 — 내 스튜디오 점보트론 > 탐색 Jumbotrons 밴드 > 밴드 수업 썸네일 폴백
  const jumbotrons = ((my?.jumbotrons?.length ? my.jumbotrons : home.jumbotrons) ?? []) as RichLesson[];
  const jumbotronSource: RichLesson[] = jumbotrons.length > 0
    ? jumbotrons
    : bands.flatMap((b) => b.lessons).filter((l) => l.thumbnailUrl).slice(0, 8);

  // 보여줄 스튜디오 홈 컨텐츠가 하나도 없을 때만 추천 스튜디오 그리드
  if (jumbotronSource.length === 0 && bands.length === 0) {
    const studios = home.recommendedStudios;
    return (
      <div className="w-full min-h-screen bg-white pt-10 pb-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h1 className="text-[24px] font-bold text-black mb-8">{await translate('recommended_studios')}</h1>
          <div className="grid grid-cols-4 gap-5">
            {studios.map((s) => (
              <NavigateClickWrapper key={s.id} method="push" route={KloudScreen.StudioDetail(s.id)}>
                <div className="flex flex-col items-center gap-3 p-8 rounded-3xl border border-[#f0f1f3] hover:bg-[#f7f8f9] cursor-pointer transition-colors">
                  <CircleImage size={88} imageUrl={s.profileImageUrl}/>
                  <span className="text-[16px] font-bold text-black truncate w-full text-center">{s.name}</span>
                </div>
              </NavigateClickWrapper>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 스튜디오 헤더 — 구형은 myStudio.studio, 신형은 수업에 실려온 studio에서
  const studio = my?.studio
    ?? jumbotronSource.find((l) => l.studio)?.studio
    ?? bands.flatMap((b) => b.lessons).find((l) => l.studio)?.studio;

  const heroItems: HeroItem[] = jumbotronSource
    .filter((l) => !!l.thumbnailUrl)
    .map((l) => ({
      id: l.id,
      title: l.title,
      subtitle: [artistOf(l), l.date].filter(Boolean).join(' · ') || (l.studio?.name ?? studio?.name ?? ''),
      imageUrl: l.thumbnailUrl,
      badge: genreOf(l),
      dday: isEndedOf(l) ? undefined : l.dday,
    }));

  return (
    <div className="w-full min-h-screen bg-white pt-8 pb-24">
      {/* 스튜디오 헤더 — 클릭 시 스튜디오 상세 */}
      {studio && (
        <div className="mx-auto w-full max-w-6xl px-6 mb-7">
          <NavigateClickWrapper method="push" route={KloudScreen.StudioDetail(studio.id)}>
            <div className="inline-flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
              <CircleImage imageUrl={studio.profileImageUrl} size={40}/>
              <span className="text-[24px] font-bold text-black">{studio.name}</span>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </NavigateClickWrapper>
        </div>
      )}

      {/* 점보트론 → 히어로 캐러셀 (장르 배지 + D-day 칩) */}
      {heroItems.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-6">
          <LessonsPcHeroCarousel items={heroItems}/>
        </div>
      )}

      {/* 주간 시간표 — 모바일 홈과 동일 컴포넌트(GET /studios/:id/timetable) 재사용 */}
      {studio && (
        <div className="mx-auto w-full max-w-6xl px-6 mt-12">
          <TimeTableServerComponent studioId={studio.id} noMargin clickEvent="click_band_timetable" hqImages/>
        </div>
      )}

      {/* 수업 밴드 — 담백하게 전부 동일한 포스터 카드 */}
      <div className="mt-16 flex flex-col gap-16">
        {bands.map((band) => {
          const lessons = (band.lessons as RichLesson[]).filter((l) => !!l.thumbnailUrl);
          if (lessons.length === 0) return null;
          return (
            <Band key={band.title} title={band.title}>
              {lessons.map((l) => <PosterCard key={l.id} l={l} locale={locale} endedLabel={endedLabel} popupLabel={popupLabel} workshopLabel={workshopLabel}/>)}
            </Band>
          );
        })}
      </div>
    </div>
  );
};
