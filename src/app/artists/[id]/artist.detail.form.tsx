'use server';

import { GetArtistResponse } from '@/app/endpoint/artist.endpoint';
import { HeaderInDetail } from '@/app/components/headers';
import Image from 'next/image';
import { LessonBand } from '@/app/LessonBand';
import { ArtistActionItem } from '@/app/artists/[id]/artist.action.item';

// 간단한 프리젠테이션 컴포넌트들
function GenreChips({genres}: { genres?: string[] | null }) {
  if (!genres?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      { genres.map((g) => (
        <span
          key={ g }
          className="px-4 py-[10px] bg-[#F1F3F6] rounded-[100px] text-[14px] leading-[19.6px] font-medium text-black"
        >
          { g }
        </span>
      )) }
    </div>
  );
}

function BadgeList({badges}: { badges?: { type: string; label: string }[] | null }) {
  if (!badges?.length) return null;
  return (
    <div className="mt-4 flex flex-col gap-2">
      { badges.map((b, i) => (
        <div key={ `${ b.type }-${ i }` } className="h-7 flex items-center gap-2">
          {/* 아이콘 28x28 */ }
          {/*<ThumbsUpIcon className="w-7 h-7 block"/>*/}
          {/* 텍스트: 14px / 20px / Medium / #3E3E3E */ }
          <span className="text-[#3E3E3E] text-[14px] leading-[20px] font-medium">
            { b.label }
          </span>
        </div>
      )) }
    </div>
  );
}

function SummaryStats({
                        summary,
                      }: {
  summary?: { title: string; elements: { key: string; label: string }[] } | null;
}) {
  if (!summary?.elements?.length) return null;

  return (
    <section className="w-full self-stretch">
      {/* 섹션 제목: 18px, bold, 좌우 24px */ }
      <h2 className="px-6 text-[18px] leading-[25.2px] font-bold text-black">{ summary.title }</h2>

      {/* 카드 컨테이너: 좌우 24px, 위여백 12px, 아이템 간 8px */ }
      <div className="mt-3 px-6 w-full grid grid-cols-2 gap-2">
        { summary.elements.map((el) => {
          return (
            <div
              key={ el.key }
              className="bg-[#F7F8F9] rounded-[12px] p-4 flex flex-col justify-center items-center gap-[2px]"
            >
              <span className="text-[20px] leading-[30px] font-semibold text-black">{ el.label }</span>
              {/* 캡션 */ }
              <p className="text-[14px] leading-[20px] font-medium text-[#86898C]">{ el.key }</p>
            </div>
          );
        }) }
      </div>
    </section>
  );
}

export default async function ArtistDetailForm({artist, appVersion}: {
  artist: GetArtistResponse;
  appVersion: string
}) {
  const handleInstagramClick = () => {
    const url = `https://www.instagram.com/${ artist.instagramAddress }`;
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSnsClick = (url: string) => {
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col pb-20 box-border overflow-auto no-scrollbar">
      {/* 헤더 */ }
      <HeaderInDetail title={ artist.nickName ?? 'Artist' }/>

      {/* 프로필 비주얼 (상단 커버) */ }
      <div className="relative w-full aspect-[3/4]">
        <Image
          src={ artist.profileImageUrl }
          alt={ artist.nickName ?? 'Artist' }
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* 상단 그라데이션 (160px, 검정 40% -> 투명) */ }
        <div
          className="absolute left-0 right-0 top-0 h-[160px] bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[1]"/>
        {/* 하단 그라데이션 (160px, 흰색 -> 투명) */ }
        <div
          className="absolute left-0 right-0 bottom-0 h-[160px] bg-gradient-to-t from-white to-transparent pointer-events-none z-[1]"/>
        <ArtistActionItem artist={ artist } appVersion={ appVersion }/>
      </div>

      {/* 본문 */ }
      <section className="w-full py-5 flex flex-col justify-start items-stretch gap-8">
        {/* 프로필/기본 정보 */ }
        <div className="self-stretch px-6 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <GenreChips genres={ artist.genres }/>
            </div>
          </div>
          { artist.description && (
            <>
              <div className="w-full h-[1px] bg-[#f7f8f9] mt-2"/>
              <p className="text-black text-[14px] leading-snug mt-2">{ artist.description }</p>
            </>
          ) }
          <BadgeList badges={ artist.badges }/>
        </div>

        {/* 구분선 */ }
        <div className="w-full h-3 bg-[#f7f8f9]"/>

        {/* 통계 */ }
        <SummaryStats summary={ artist.summary }/>
      </section>

      {/* 공개 예정 수업들 */ }
      { artist.band &&
          <LessonBand title={ artist.band.title } lessons={ artist.band.lessons } type={ artist.band.type }/>
      }
    </div>
  );
}