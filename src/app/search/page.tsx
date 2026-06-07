'use client';

// 검색 페이지 — PC 전용 mock.
// 추후 BE에 검색 endpoint 생기면 입력값으로 쿼리, 결과 그리드 노출.

import React, { useState } from "react";
import Link from "next/link";
import { KloudScreen } from "@/shared/kloud.screen";

type SearchResult = {
  type: 'lesson' | 'studio' | 'artist';
  id: number;
  title: string;
  subtitle: string;
  thumbnailUrl?: string;
};

const POPULAR_KEYWORDS = ['하울', 'Hiphop', '에스파이어', 'Choreography', '로우그래피', 'Locking', 'K-pop'];

// mock 결과 — 실제로는 query 기반으로 BE에서 가져옴
const MOCK_RESULTS: SearchResult[] = [
  { type: 'lesson', id: 2073, title: '20명넘으면고정', subtitle: '에스파이어 서울 · HOWL 하울', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg' },
  { type: 'studio', id: 14, title: '에스파이어 서울', subtitle: '경기 부천시 소사구 경인로 477', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489' },
  { type: 'artist', id: 12, title: 'HOWL 하울', subtitle: '이혁재 · @howl__lee', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const showResults = query.trim().length > 0;

  const handleKeywordClick = (k: string) => setQuery(k);

  const linkFor = (r: SearchResult): string => {
    switch (r.type) {
      case 'lesson': return KloudScreen.LessonDetail(r.id);
      case 'studio': return KloudScreen.StudioDetail(r.id);
      case 'artist': return KloudScreen.ArtistDetail(r.id);
    }
  };

  const typeLabel = (t: SearchResult['type']) => {
    if (t === 'lesson') return '수업';
    if (t === 'studio') return '스튜디오';
    return '아티스트';
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-8 pt-24 pb-20">

        {/* 검색 입력 */}
        <div className="relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#1a1a1a" strokeWidth="1.8"/>
            <path d="M20 20L16.5 16.5" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="수업, 스튜디오, 아티스트 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full h-14 pl-14 pr-5 rounded-2xl bg-[#F5F6F8] text-[16px] text-black placeholder:text-[#86898C] focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="입력 지우기"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#dcdee0] hover:bg-[#bcbfc2] flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {!showResults && (
          <section className="mt-10">
            <h2 className="text-[15px] font-bold text-black mb-4">인기 검색어 <span className="ml-1 text-[11px] font-medium text-[#BCBFC2]">· mock</span></h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_KEYWORDS.map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeywordClick(k)}
                  className="px-4 py-2 rounded-full bg-[#F5F6F8] hover:bg-[#e9ebed] text-[13px] font-medium text-black transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>
          </section>
        )}

        {showResults && (
          <section className="mt-8">
            <h2 className="text-[15px] font-bold text-black mb-4">
              검색 결과 <span className="ml-1 text-[12px] font-normal text-[#86898C]">&quot;{query}&quot;</span>
            </h2>
            <div className="flex flex-col">
              {MOCK_RESULTS.map((r) => (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={linkFor(r)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f7f8f9] transition-colors"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F1F3F6] shrink-0">
                    {r.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover"/>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#86898C] uppercase tracking-wide">{typeLabel(r.type)}</span>
                    </div>
                    <span className="text-[15px] font-bold text-black truncate">{r.title}</span>
                    <span className="text-[12px] text-[#86898C] truncate">{r.subtitle}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
