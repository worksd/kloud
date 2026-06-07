// 수업 목록 페이지 — PC 전용 mock.
// 구성: 상단 5개 hero 캐러셀 + 여러 variant의 horizontal scroll band + 하단 grid

import React from "react";
import Link from "next/link";
import { KloudScreen } from "@/shared/kloud.screen";
import { LessonsPcHeroCarousel, HeroItem } from "@/app/lessons/LessonsPcHeroCarousel";
import { LessonsPcBand, BandLessonItem } from "@/app/lessons/LessonsPcBand";

// mock data — 추후 BE list 엔드포인트 활용으로 교체
const HERO_ITEMS: HeroItem[] = [
  { id: 2073, title: '20명넘으면고정', subtitle: '에스파이어 서울 · HOWL 하울', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', badge: '추천' },
  { id: 2074, title: 'New Class Sample', subtitle: '로우그래피 · Sample Artist', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', badge: 'NEW' },
  { id: 2075, title: 'Locking 기초반', subtitle: '로우그래피 · Sample Artist', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', badge: 'NEW' },
  { id: 2076, title: 'Choreography 정규반', subtitle: '에스파이어 서울 · HOWL 하울', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', badge: '인기' },
  { id: 2077, title: 'Popping Advanced', subtitle: '로우그래피 · Sample Artist', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg' },
];

const NEW_LESSONS: BandLessonItem[] = [
  { id: 2073, title: '20명넘으면고정', subtitle: '에스파이어 서울', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', genre: 'Hiphop' },
  { id: 2074, title: 'K-pop Beginner', subtitle: '로우그래피', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', genre: 'K-pop' },
  { id: 2075, title: 'Locking 기초반', subtitle: '로우그래피', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', genre: 'Locking' },
  { id: 2076, title: 'Choreography 정규반', subtitle: '에스파이어 서울', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', genre: 'Choreo' },
  { id: 2078, title: 'Girls Hiphop', subtitle: '에스파이어 서울', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', genre: 'Girls' },
  { id: 2079, title: 'House 입문', subtitle: '로우그래피', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', genre: 'House' },
];

const FEATURED_ARTISTS: BandLessonItem[] = [
  { id: 2076, title: 'Choreography 정규반', subtitle: 'HOWL 하울', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909' },
  { id: 2073, title: '20명넘으면고정', subtitle: 'HOWL 하울', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg' },
  { id: 2078, title: 'Girls Hiphop', subtitle: 'Sample Artist', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909' },
  { id: 2074, title: 'New Class Sample', subtitle: 'Sample Artist', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg' },
];

const TODAY_LESSONS: BandLessonItem[] = [
  { id: 2073, title: '오늘 오후 3시 · 20명넘으면고정', subtitle: '에스파이어 대강당', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg' },
  { id: 2076, title: '오늘 오후 6시 · Choreography 정규반', subtitle: '에스파이어 A룸', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909' },
  { id: 2079, title: '오늘 오후 8시 · House 입문', subtitle: '로우그래피 B룸', imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg' },
];

// 전체 그리드 mock (8개)
const ALL_LESSONS = [
  { id: 2073, title: '20명넘으면고정', studioName: '에스파이어 서울', artistName: 'HOWL 하울', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', genre: 'Hiphop' },
  { id: 2074, title: 'New Class Sample', studioName: '로우그래피', artistName: 'Sample Artist', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', genre: 'K-pop' },
  { id: 2075, title: 'Locking 기초반', studioName: '로우그래피', artistName: 'Sample Artist', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', genre: 'Locking' },
  { id: 2076, title: 'Choreography 정규반', studioName: '에스파이어 서울', artistName: 'HOWL 하울', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', genre: 'Choreo' },
  { id: 2077, title: 'Popping Advanced', studioName: '로우그래피', artistName: 'Sample Artist', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', genre: 'Popping' },
  { id: 2078, title: 'Girls Hiphop', studioName: '에스파이어 서울', artistName: 'HOWL 하울', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', genre: 'Girls' },
  { id: 2079, title: 'House 입문', studioName: '로우그래피', artistName: 'Sample Artist', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg', genre: 'House' },
  { id: 2080, title: 'Krump 정규반', studioName: '에스파이어 서울', artistName: 'HOWL 하울', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909', genre: 'Krump' },
];

export default async function LessonsPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-8 pt-24 pb-20">

        {/* HERO — 5개 캐러셀 */}
        <LessonsPcHeroCarousel items={HERO_ITEMS}/>

        {/* 다양한 밴드들 */}
        <div className="mt-16 flex flex-col gap-14">
          <LessonsPcBand
            title="신규 수업"
            subtitle="이번 주 새로 열린 수업"
            items={NEW_LESSONS}
            variant="poster"
          />

          <LessonsPcBand
            title="오늘의 수업"
            subtitle="놓치지 마세요"
            items={TODAY_LESSONS}
            variant="wide"
          />

          <LessonsPcBand
            title="추천 아티스트의 수업"
            items={FEATURED_ARTISTS}
            variant="square"
          />
        </div>

        {/* 전체 수업 — 4-column 그리드 */}
        <section className="mt-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-[20px] font-bold text-black tracking-tight">전체 수업</h2>
            <span className="text-[12px] text-[#BCBFC2]">· mock data</span>
          </div>
          <div className="grid grid-cols-4 gap-x-5 gap-y-10">
            {ALL_LESSONS.map((l) => (
              <Link
                key={l.id}
                href={KloudScreen.LessonDetail(l.id)}
                className="flex flex-col gap-3 group"
              >
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#F1F3F6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.thumbnailUrl}
                    alt={l.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                    <span className="text-[11px] font-semibold text-white">{l.genre}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-bold text-black truncate">{l.title}</span>
                  <span className="text-[12px] text-[#86898C] truncate">{l.studioName} · {l.artistName}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
