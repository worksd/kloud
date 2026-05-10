'use client';

/**
 * 데스크톱 웹(네이티브 앱 아닌 일반 브라우저) 진입 시 노출되는 스튜디오 상세 페이지.
 * Figma: 3890-10314.
 * 스튜디오 정보 + 시간표는 BE 실데이터, 그 외(공지/인기 강사/인기 강의)는 mock.
 */
import React from 'react';
import { TimeTable } from '@/app/studios/timetable/TimeTable';
import { GetStudioResponse, GetTimeTableResponse } from '@/app/endpoint/studio.endpoint';

const MOCK_NOTICES = [
  { id: 1, title: '6월 신규 강의 오픈', body: '6월 첫째 주부터 새로운 K-pop 클래스가 추가됩니다. 사전 예약은 5월 25일부터 가능합니다.' },
  { id: 2, title: '5월 휴무 안내', body: '5월 5일(어린이날)은 전 클래스 휴무입니다. 환불은 자동 처리됩니다.' },
];

const MOCK_INSTRUCTORS = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Instructor ${i + 1}` }));

const MOCK_LESSONS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  title: `K-Pop Class ${i + 1}`,
  artist: `Instructor ${(i % 5) + 1}`,
}));

const SidebarIcon = () => (
  <div className="w-10 h-10 rounded-lg bg-[#F2F4F6] mb-3" />
);

// 슬러그/이름에서 헤더의 거대 약칭 도출 (Figma의 "1M" 같은 시각 효과).
// 우선순위: slug 첫 토큰의 영문 → 이름의 첫 토큰 → 이름 첫 두 글자
const deriveShortName = (studio: GetStudioResponse): string => {
  const slugFirst = studio.slug?.split(/[_-]/)[0];
  if (slugFirst && /[A-Za-z0-9]/.test(slugFirst)) return slugFirst.toUpperCase();
  const nameFirst = studio.name?.split(/\s+/)[0];
  if (nameFirst) return nameFirst.length > 6 ? nameFirst.slice(0, 6) : nameFirst;
  return studio.name?.slice(0, 2) ?? '';
};

// 주소에서 첫 단어(시/도)만 추출 — "경기 부천시 …" → "경기"
const deriveCity = (studio: GetStudioResponse): string =>
  (studio.address ?? studio.roadAddress ?? '').split(/\s+/)[0] ?? '';

export const StudioDesktopForm = ({ studio, timeTable }: { studio: GetStudioResponse; timeTable: GetTimeTableResponse | null }) => {
  const shortName = deriveShortName(studio);
  const city = deriveCity(studio);
  const description = studio.businessName ?? '';

  return (
    <div className="min-h-screen bg-white text-[#1E2124]">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#EEF0F2]">
        <div className="max-w-[1280px] mx-auto px-8 h-14 flex items-center justify-between">
          <span className="font-bold text-[18px] tracking-tight">rawgraphy</span>
          <nav className="flex items-center gap-6 text-[14px] text-[#6D7882]">
            <span className="cursor-pointer hover:text-black">스튜디오</span>
            <span className="cursor-pointer hover:text-black">강의</span>
            <span className="cursor-pointer hover:text-black">소식</span>
          </nav>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto flex">
        {/* 좌측 사이드바 */}
        <aside className="hidden md:block shrink-0 w-16 py-8 px-3 border-r border-[#EEF0F2]">
          <SidebarIcon />
          <SidebarIcon />
          <SidebarIcon />
          <SidebarIcon />
        </aside>

        {/* 메인 */}
        <main className="flex-1 px-8 py-10">
          {/* 히어로 — 커버 이미지 위에 거대 약칭 오버레이, 그 아래 프로필 + 이름/도시 row */}
          <section className="pb-10 border-b border-[#EEF0F2]">
            <div className="relative w-full rounded-[20px] overflow-hidden bg-[#1E2124]" style={{ aspectRatio: '16 / 6' }}>
              {studio.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={studio.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              {/* 텍스트 가독성을 위한 dim */}
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-[160px] font-black leading-none tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  {shortName}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              {studio.profileImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={studio.profileImageUrl}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border border-[#EEF0F2] shrink-0"
                />
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="text-[28px] font-bold truncate">{studio.name}</h1>
                {city && (
                  <span className="text-[14px] text-[#6D7882] flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22s7-7.58 7-13a7 7 0 10-14 0c0 5.42 7 13 7 13z" stroke="#6D7882" strokeWidth="1.6" />
                      <circle cx="12" cy="9" r="2.5" stroke="#6D7882" strokeWidth="1.6" />
                    </svg>
                    {city}
                  </span>
                )}
              </div>
            </div>
            {description && (
              <p className="mt-4 text-[15px] text-[#505356] max-w-[720px] leading-relaxed">
                {description}
              </p>
            )}
          </section>

          {/* 탭 — 시간표 활성 */}
          <section className="pt-8">
            <div className="flex items-center gap-6 border-b border-[#EEF0F2]">
              <button className="pb-3 px-1 border-b-2 border-black font-semibold text-[15px]">시간표</button>
              <button className="pb-3 px-1 text-[#86898C] text-[15px]">강의</button>
              <button className="pb-3 px-1 text-[#86898C] text-[15px]">소식</button>
            </div>

            {/* 시간표 — BE 응답 그대로 기존 TimeTable 컴포넌트에 주입 */}
            <div className="mt-6">
              {timeTable ? (
                <TimeTable timeTable={timeTable} studioId={studio.id} locale="ko" />
              ) : (
                <div className="py-12 text-center text-[14px] text-[#86898C]">시간표를 불러오지 못했습니다</div>
              )}
            </div>
          </section>

          {/* 공지 */}
          <section className="mt-12">
            <h2 className="text-[18px] font-bold mb-4">공지</h2>
            <div className="grid grid-cols-2 gap-4">
              {MOCK_NOTICES.map((n) => (
                <div key={n.id} className="border border-[#EEF0F2] rounded-xl p-5 bg-white">
                  <div className="text-[14px] font-semibold mb-2">{n.title}</div>
                  <p className="text-[13px] text-[#6D7882] leading-relaxed line-clamp-2">{n.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 인기 강사 */}
          <section className="mt-12">
            <h2 className="text-[18px] font-bold mb-4">인기 강사</h2>
            <div className="grid grid-cols-5 gap-4">
              {MOCK_INSTRUCTORS.map((a) => (
                <div key={a.id} className="flex flex-col items-center">
                  <div className="w-full aspect-square rounded-xl bg-[#F2F4F6]" />
                  <div className="mt-3 text-[13px] font-medium">{a.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 인기 강의 */}
          <section className="mt-12 pb-16">
            <h2 className="text-[18px] font-bold mb-4">인기 강의</h2>
            <div className="grid grid-cols-5 gap-4">
              {MOCK_LESSONS.map((l) => (
                <div key={l.id} className="flex flex-col">
                  <div className="w-full aspect-[3/4] rounded-xl bg-[#1E2124] mb-2" />
                  <div className="text-[13px] font-semibold truncate">{l.title}</div>
                  <div className="text-[12px] text-[#86898C] truncate">{l.artist}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="border-t border-[#EEF0F2]">
        <div className="max-w-[1280px] mx-auto px-8 h-14 flex items-center text-[12px] text-[#86898C]">
          rawgraphy
        </div>
      </footer>
    </div>
  );
};
