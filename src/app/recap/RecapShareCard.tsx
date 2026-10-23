'use client'

import React, { forwardRef } from "react";
import { RecapResponse } from "@/app/recap/recap.types";
import { Avatar } from "@/app/recap/RecapSlides";
import { RECAP_GRADIENT } from "@/app/recap/RecapUi";

/**
 * 공유용 한 장 요약 카드 — 순수 DOM/CSS 로만 그린다 (html-to-image 로 PNG 를 뜰 수 있게. WebGL 은 캡처에 안 잡힌다).
 * 인스타 스토리 비율(9:16)에 맞춰 둔다.
 */
export const RecapShareCard = forwardRef<HTMLDivElement, { recap: RecapResponse }>(({ recap: r }, ref) => {
  const peakMonth = r.monthlyLessons.indexOf(Math.max(...r.monthlyLessons));
  const max = Math.max(...r.monthlyLessons, 1);
  return (
    <div
      ref={ref}
      className={'relative w-full aspect-[9/16] rounded-[28px] overflow-hidden text-white p-6 flex flex-col'}
      style={{
        background: `radial-gradient(120% 70% at 0% 0%, ${r.dancerType.colors[0]}cc 0%, transparent 60%),
                     radial-gradient(120% 70% at 100% 100%, ${r.dancerType.colors[1]}cc 0%, transparent 60%),
                     #0B0418`,
        boxShadow: '0 30px 80px -20px rgba(139,92,246,0.6), 0 0 0 1px rgba(255,255,255,0.12) inset',
      }}
    >
      <div className={'flex items-center justify-between text-[11px] font-bold tracking-[0.14em] text-white/70'}>
        <span className={'truncate mr-3'}>{r.studio.name} RECAP</span>
        <span>{r.year}</span>
      </div>

      <p className={'mt-5 text-[13px] text-white/60'}>{r.nickName}님의 댄서 유형</p>
      <p className={'text-[30px] font-black leading-tight bg-clip-text text-transparent'} style={{ backgroundImage: RECAP_GRADIENT }}>
        {r.dancerType.title}
      </p>

      <div className={'mt-5 grid grid-cols-2 gap-x-4 gap-y-4'}>
        <Stat label={'수업'} value={`${r.totalLessons}번`}/>
        <Stat label={'시간'} value={`${Math.floor(r.totalMinutes / 60)}시간`}/>
        <Stat label={'최애 장르'} value={r.topGenres[0]?.name ?? '-'}/>
        <Stat label={'스튜디오 상위'} value={`${r.topPercent}%`}/>
        <Stat label={'연속 출석'} value={`${r.longestStreakWeeks}주`}/>
        <Stat label={'불타오른 달'} value={`${peakMonth + 1}월`}/>
      </div>

      {/* 월별 미니 그래프 */}
      <div className={'mt-5 flex items-end gap-1 h-14'}>
        {r.monthlyLessons.map((v, i) => (
          <div
            key={i}
            className={'flex-1 rounded-t-[3px]'}
            style={{
              height: `${12 + (v / max) * 88}%`,
              background: i === peakMonth ? RECAP_GRADIENT : 'rgba(255,255,255,0.22)',
            }}
          />
        ))}
      </div>

      <div className={'mt-auto flex flex-col gap-3'}>
        {r.topArtists.length > 0 && <ArtistsRow artists={r.topArtists.slice(0, 5)}/>}
      </div>
      <p className={'mt-5 text-center text-[11px] tracking-[0.2em] text-white/50 font-bold truncate'}>{r.studio.name}</p>
    </div>
  );
});
RecapShareCard.displayName = 'RecapShareCard';

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className={'text-[11px] text-white/55'}>{label}</p>
    <p className={'text-[22px] font-black leading-tight'}>{value}</p>
  </div>
);

// 함께한 강사 TOP N — 겹친 아바타 + 1위 이름
const ArtistsRow = ({ artists }: { artists: RecapResponse['topArtists'] }) => (
  <div className={'flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5'}>
    <div className={'flex shrink-0'}>
      {artists.map((a, i) => (
        <div key={a.id} className={i > 0 ? '-ml-2.5' : ''} style={{ zIndex: artists.length - i }}>
          <Avatar person={a} size={i === 0 ? 36 : 28}/>
        </div>
      ))}
    </div>
    <div className={'min-w-0'}>
      <p className={'text-[11px] text-white/55'}>함께한 강사 TOP {artists.length}</p>
      <p className={'text-[15px] font-bold truncate'}>{artists[0].name}</p>
    </div>
  </div>
);
