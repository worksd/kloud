// 검색 결과 — GET /search/contents (비로그인 공개 API).
// PC 웹 전용 렌더(hidden lg:block): 탑바 검색창에서 /search?q=키워드로 진입한다.
// 응답은 스튜디오 / 다가올 수업 / 종료된 수업 3개 리스트(각 최대 20개, 페이지네이션 없음).
// 모바일/앱 웹뷰는 기존과 동일하게 빈 화면 유지 (앱은 네이티브 검색 사용).

import React from "react";
import Link from "next/link";
import { api } from "@/app/api.client";
import { KloudScreen } from "@/shared/kloud.screen";
import { LessonCard } from "@/app/lessons/ValidLessonsGrid";
import { ValidLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { SearchStudioResponse } from "@/app/endpoint/search.endpoint";
import { getLocale, translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";

export default async function SearchPage({searchParams}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams;
  const keyword = q?.trim() ?? '';
  const locale = await getLocale();

  // 빈 키워드면 서버도 빈 결과를 주지만, 호출 없이 바로 빈 상태를 그린다
  const res = keyword ? await api.search.contents({ keyword }) : null;
  const studios: SearchStudioResponse[] = res && 'studios' in res ? res.studios : [];
  const upcoming: ValidLessonResponse[] = res && 'upcomingLessons' in res ? res.upcomingLessons : [];
  const last: ValidLessonResponse[] = res && 'lastLessons' in res ? res.lastLessons : [];
  const isEmpty = studios.length === 0 && upcoming.length === 0 && last.length === 0;

  return (
    <div className="hidden lg:block w-full min-h-screen bg-white pt-10 pb-16">
      <div className="w-full max-w-[1400px] pl-6 pr-10">
        <header className="mb-8">
          <h1 className="text-[24px] font-bold text-black tracking-tight">
            {keyword
              ? <>&lsquo;{keyword}&rsquo; {await translate('search_result_for')}</>
              : await translate('search_result_for')}
          </h1>
        </header>

        {isEmpty ? (
          <p className="py-40 text-center text-[14px] text-[#A0A5AB]">
            {await translate('search_empty_result')}
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {studios.length > 0 && (
              <StudioSection title={await translate('search_section_studios')} studios={studios}/>
            )}
            {upcoming.length > 0 && (
              <LessonSection title={await translate('search_section_upcoming')} lessons={upcoming} locale={locale}/>
            )}
            {last.length > 0 && (
              <LessonSection title={await translate('search_section_last')} lessons={last} locale={locale}/>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 스튜디오 — 원형 로고 + 이름 가로 나열
const StudioSection = ({title, studios}: { title: string; studios: SearchStudioResponse[] }) => (
  <section>
    <h2 className="text-[18px] font-bold text-black mb-4">{title}</h2>
    <div className="flex flex-wrap gap-x-8 gap-y-6">
      {/* 아이템 폭을 고정하면 이름이 일찍 잘린다 — 이름 길이만큼 늘어나되 160px에서만 말줄임 */}
      {studios.map((s) => (
        <Link key={s.id} href={KloudScreen.StudioDetail(s.id)} className="flex flex-col items-center gap-2.5 min-w-[96px] max-w-[160px] group">
          {s.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.profileImageUrl}
              alt={s.name}
              className="w-20 h-20 rounded-full object-cover border border-[#f0f1f3] transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#F1F3F6]"/>
          )}
          <span className="text-[13px] font-semibold text-black text-center truncate w-full">{s.name}</span>
        </Link>
      ))}
    </div>
  </section>
);

const LessonSection = ({title, lessons, locale}: {
  title: string;
  lessons: ValidLessonResponse[];
  locale: Locale;
}) => (
  <section>
    <h2 className="text-[18px] font-bold text-black mb-4">{title}</h2>
    <div className="grid grid-cols-6 gap-x-4 gap-y-10">
      {lessons.map((l) => <LessonCard key={l.id} l={l} locale={locale}/>)}
    </div>
  </section>
);
