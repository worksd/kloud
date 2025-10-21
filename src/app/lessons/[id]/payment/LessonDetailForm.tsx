'use server'
import { StudioProfileImage } from '@/app/lessons/[id]/StudioProfileImage';
import { LessonArtistItem } from '@/app/lessons/[id]/lesson.artist.item';
import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { LessonInfoSection } from '@/app/lessons/[id]/lesson.info.section';
import { translate } from '@/utils/translate';
import React from 'react';
import { LessonLabel, LessonLevelLabel, LessonTypeLabel } from '@/app/components/LessonLabel';
import { LessonDetailButton } from '@/app/lessons/[id]/LessonDetailButton';
import Image from "next/image";
import LeftArrow from "../../../../../public/assets/left-arrow.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export default async function LessonDetailForm({lesson, appVersion}: {
  lesson: GetLessonResponse,
  appVersion: string,
}) {

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto no-scrollbar">
      <NavigateClickWrapper method={'back'}>
        <button
          type="button"
          aria-label="뒤로가기"
          className={[
            'absolute left-3 z-10',
            // 큰 터치 타깃 + 반투명 배경
            'inline-flex h-10 w-10 items-center justify-center rounded-full',
            'backdrop-blur text-white shadow',
          ].join(' ')}
          // iOS safe-area 보정 + 기본 12px 마진
          style={{top: 'max(env(safe-area-inset-top, 0px), 36px)'}}
        >
          <LeftArrow className="h-5 w-5"/>
        </button>
      </NavigateClickWrapper>

      <div className="relative w-full aspect-[1/3] overflow-hidden bg-gray-200">
        <Image
          src={lesson.thumbnailUrl ?? ''}
          alt={lesson?.title ?? 'thumbnail'}
          fill
          className="object-cover"
        />
      </div>

      {/* 디테일 영역 */}
      <div className="w-full py-5 flex-col justify-start items-start gap-8 inline-flex">
        <div className="self-stretch flex-col justify-start items-start gap-0 flex">
          {/* 수업명 */}
          <div className="self-stretch px-6 flex-col justify-start items-start gap-2.5 flex">
            <div className="self-stretch justify-between items-start inline-flex">
              {lesson.studio && <StudioProfileImage studio={lesson.studio}/>}
              <div className="justify-center items-start gap-[3px] flex">
                {lesson.level && <LessonLevelLabel label={lesson.level}/>}
                {lesson.type && <LessonTypeLabel type={lesson.type}/>}
                {lesson.genre && lesson.genre != 'Default' && <LessonLabel label={lesson.genre}/>}
              </div>
            </div>
            <div className="self-stretch justify-start items-center gap-2 inline-flex">
              <div className="w-[342px] text-black text-xl font-bold leading-normal">{lesson.title}</div>
            </div>
            <div className="w-full h-[1px] bg-[#f7f8f9]"/>
          </div>


          {/* 상세 */}
          <LessonInfoSection data={lesson}/>

          <div className="w-full h-3 bg-[#f7f8f9]"/>
        </div>

        {/* 강사 */}
        <div className="self-stretch flex-col justify-start items-start flex">
          <div className="flex flex-col self-stretch px-6">
            <div className="text-black text-[18px] font-bold">{await translate('lesson_information')}</div>
            <div className={'text-black mt-7 font-bold text-[16px]'}>{await translate('artist')}</div>
          </div>

          <div className={'self-stretch flex-col justify-start items-start flex gap-2 mt-2.5'}>
            {lesson.artist && <LessonArtistItem artist={lesson.artist} appVersion={appVersion}/>}
            {lesson.extraArtists && lesson.extraArtists.length > 0 && (
              lesson.extraArtists.map((artist, index) => (
                <LessonArtistItem
                  key={artist.id || index}
                  artist={artist}
                  appVersion={appVersion}
                />
              ))
            )}
          </div>

          {lesson.description &&
            <div className={'flex flex-col w-full'}>
              <div className="w-full h-1 bg-[#f7f8f9] mt-5"/>
              <div className={'mt-2.5 px-6'}>
                <div
                  className={'text-black font-bold text-[16px] '}>{await translate('lesson_description')}</div>
                <div
                  className="grow shrink basis-0 text-black text-[14px] leading-snug mt-2.5">{lesson.description}</div>
              </div>
            </div>
          }
        </div>
      </div>

      {/* 결제 페이지 이동 버튼 */}

      <div className="left-0 w-full h-fit fixed bottom-6 px-6">
        <LessonDetailButton id={lesson.id} buttons={lesson.buttons} appVersion={appVersion}/>
      </div>
    </div>
  );
}