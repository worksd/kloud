'use server'
// PC 전용 수업 상세 — Tving 스타일. 좌측 메타/CTA, 우측 포스터 sticky.
// 모바일 웹뷰는 LessonDetailForm.tsx 사용. 분기는 page.tsx에서 viewport+appVersion로.

import { StudioProfileImage } from '@/app/lessons/[id]/StudioProfileImage';
import { LessonArtistItem } from '@/app/lessons/[id]/lesson.artist.item';
import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { LessonInfoSection } from '@/app/lessons/[id]/lesson.info.section';
import { getLocale, translate } from '@/utils/translate';
import React from 'react';
import { LessonLabel, LessonLevelLabel, LessonTypeLabel } from '@/app/components/LessonLabel';
import { LessonTags } from '@/app/components/LessonTags';
import { LessonDetailButton } from '@/app/lessons/[id]/LessonDetailButton';
import { LessonBundlesSection } from '@/app/lessons/[id]/LessonBundlesSection';
import Image from "next/image";
import { LessonAdminInfoSection } from "@/app/lessons/[id]/LessonAdminInfoSection";

export default async function LessonDetailPcForm({lesson, appVersion}: {
  lesson: GetLessonResponse,
  appVersion: string,
}) {
  const locale = await getLocale();

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 overflow-hidden">
      {/* pt-24: layout WebTopNav(h-16) 아래 여백 확보 */}

      {/* 배경: 썸네일 가우시안 블러 색감을 더 진하게 깔고, 상단/하단만 살짝 white로 페이드 */}
      {lesson.thumbnailUrl && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{
              backgroundImage: `url(${lesson.thumbnailUrl})`,
              filter: 'blur(120px) saturate(1.8)',
              transform: 'scale(1.3)', // blur 가장자리 비치는 영역 가림
            }}
          />
          {/* 색감 유지하면서 가독성 확보 — 옅은 화이트 베일 + 상하 페이드 */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.45) 70%, rgba(255,255,255,0.85) 100%)',
            }}
          />
        </>
      )}
      {!lesson.thumbnailUrl && (
        <div aria-hidden className="absolute inset-0 -z-10 bg-white"/>
      )}

      <div className="relative mx-auto w-full max-w-6xl px-8 grid grid-cols-[minmax(0,1fr)_440px] gap-x-14 gap-y-8">

        {/* 좌측: 메타 영역 */}
        <div className="col-start-1 row-start-1 flex flex-col gap-10">
          {/* 헤더: 스튜디오 + 라벨 */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              {lesson.studio && <StudioProfileImage studio={lesson.studio}/>}
              <div className="flex justify-center items-start gap-[3px]">
                {lesson.level && <LessonLevelLabel label={lesson.level} locale={locale}/>}
                {lesson.type && <LessonTypeLabel type={lesson.type} locale={locale}/>}
                {lesson.genre && lesson.genre != 'Default' && <LessonLabel label={lesson.genre} locale={locale}/>}
              </div>
            </div>

            {lesson.tags && <LessonTags tags={lesson.tags} />}

            {/* 제목 — PC에서 prominent */}
            <h1 className="text-black text-[36px] font-bold leading-tight tracking-tight">
              {lesson.title}
            </h1>
          </div>

          {/* 기본 정보 (장소/시간) */}
          <div className="-mx-6">
            <LessonInfoSection data={lesson}/>
          </div>

          {/* CTA — 핵심 정보 바로 아래 */}
          <div className="w-full max-w-md">
            <LessonDetailButton id={lesson.id} buttons={lesson.buttons} appVersion={appVersion}/>
          </div>

          {/* 묶음 */}
          <LessonBundlesSection bundles={lesson.bundles}/>

          {/* 강사 + 설명 */}
          <div className="flex flex-col gap-6 pt-2 border-t border-[#f0f1f3]">
            <div>
              <h2 className="text-black text-[22px] font-bold mt-6">{await translate('lesson_information')}</h2>
              <h3 className="text-black mt-7 font-bold text-[18px]">{await translate('artist')}</h3>
            </div>

            <div className="flex flex-col gap-3 -mx-6">
              {lesson.artists && lesson.artists.map((artist, index) => (
                <LessonArtistItem
                  key={artist.id || index}
                  artist={artist}
                  appVersion={appVersion}
                />
              ))}
            </div>

            {lesson.description && (
              <div className="flex flex-col mt-4 pt-6 border-t border-[#f0f1f3]">
                <h3 className="text-black font-bold text-[18px]">{await translate('lesson_description')}</h3>
                <p className="text-black text-[15px] leading-relaxed mt-3 whitespace-pre-line">{lesson.description}</p>
              </div>
            )}
          </div>

          {lesson.adminType && <LessonAdminInfoSection lessonId={lesson.id} adminType={lesson.adminType}/>}
        </div>

        {/* 우측: 포스터 sticky */}
        <div className="col-start-2 row-start-1 sticky top-24 self-start">
          <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-[#F1F3F6] shadow-sm">
            {lesson.thumbnailUrl ? (
              <Image
                src={lesson.thumbnailUrl}
                alt={lesson?.title ?? 'thumbnail'}
                fill
                className="object-cover"
                quality={75}
                sizes="440px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#C5C8CB" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="10.5" r="1.5" stroke="#C5C8CB" strokeWidth="1.5"/>
                  <path d="M3 16l4.793-4.793a1 1 0 011.414 0L13 15l2.793-2.793a1 1 0 011.414 0L21 16" stroke="#C5C8CB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
