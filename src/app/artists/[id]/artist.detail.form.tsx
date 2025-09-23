'use server';

import { GetArtistResponse } from '@/app/endpoint/artist.endpoint';
import { HeaderInDetail } from '@/app/components/headers';
import Image from 'next/image';
import { GetBandResponse } from '@/app/endpoint/lesson.endpoint';

// 간단한 프리젠테이션 컴포넌트들
function GenreChips({ genres }: { genres?: string[] | null }) {
  if (!genres?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {genres.map((g) => (
        <span key={g} className="px-2 py-1 rounded-full bg-[#f7f8f9] text-xs text-black">
          {g}
        </span>
      ))}
    </div>
  );
}

function BadgeList({ badges }: { badges?: { type: string; label: string }[] | null }) {
  if (!badges?.length) return null;
  return (
    <div className="mt-4 flex flex-col gap-2">
      {badges.map((b, i) => (
        <div key={`${b.type}-${i}`} className="flex items-center gap-2 text-sm">
          <span aria-hidden>🏷️</span>
          <span className="text-black">{b.label}</span>
        </div>
      ))}
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
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-black px-6">{summary.title}</h2>
      <div className="flex gap-6 mt-3 px-6">
        {summary.elements.map((el) => (
          <div key={el.key} className="text-center">
            <p className="text-xl font-bold text-black">{el.label}</p>
            <p className="text-sm text-gray-500">{el.key}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function UpcomingLessons({ band }: { band?: GetBandResponse | null }) {
  if (!band?.lessons?.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-black px-6">{band.title}</h2>
      <div className="grid grid-cols-2 gap-4 mt-3 px-6 pb-24">
        {band.lessons.map((lesson) => (
          <div key={lesson.id} className="border rounded-md overflow-hidden">
            {/* 썸네일 */}
            <div className="relative w-full aspect-[3/2]">
              <Image
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
              {lesson.label?.isEnded && (
                <div className="absolute right-1 top-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                  종료됨
                </div>
              )}
            </div>
            {/* 텍스트 */}
            <div className="p-2">
              <p className="text-sm font-semibold text-black line-clamp-2">{lesson.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{lesson.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ArtistDetailForm({ artist }: { artist: GetArtistResponse }) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col pb-20 box-border overflow-auto no-scrollbar">
      {/* 헤더 */}
      <HeaderInDetail title={artist.nickName ?? 'Artist'} />

      {/* 프로필 비주얼 (상단 커버) */}
      <div
        style={{ backgroundImage: `url(${artist.profileImageUrl})` }}
        className="
          w-full relative aspect-[3/2]
          bg-cover bg-center bg-no-repeat
          before:content-[''] before:absolute before:inset-0 before:block
          before:bg-gradient-to-b before:from-transparent before:from-70% before:to-white before:to-100% before:z-[2]
        "
      />

      {/* 본문 */}
      <section className="w-full py-5 flex-col justify-start items-start gap-8 inline-flex">
        {/* 프로필/기본 정보 */}
        <div className="self-stretch px-6 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-black">{artist.nickName}</h1>
              <GenreChips genres={artist.genres} />
            </div>
          </div>
          {artist.description && (
            <>
              <div className="w-full h-[1px] bg-[#f7f8f9] mt-2" />
              <p className="text-black text-[14px] leading-snug mt-2">{artist.description}</p>
            </>
          )}
          <BadgeList badges={artist.badges} />
        </div>

        {/* 구분선 */}
        <div className="w-full h-3 bg-[#f7f8f9]" />

        {/* 통계 */}
        <SummaryStats summary={artist.summary} />

        {/* 구분선 */}
        <div className="w-full h-3 bg-[#f7f8f9]" />

        {/* 공개 예정 수업들 */}
        { artist.band &&
        <UpcomingLessons band={artist.band} />
        }
      </section>
    </div>
  );
}