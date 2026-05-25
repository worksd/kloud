'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { GetBandLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';

const LAST_LESSON_FALLBACK_MS = 90 * 60 * 1000;

// BE는 KST 기준 시각을 ISO에 'Z'/오프셋으로 표기하므로, 타임존 마커를 제거한 뒤 로컬로 파싱한다.
const stripTz = (s: string): string =>
  s.replace(/Z$/, '').replace(/[+-]\d{2}:?\d{2}$/, '');

const parseStart = (lesson: GetBandLessonResponse): number => {
  if (!lesson.startDate) return Number.MAX_SAFE_INTEGER;
  const t = new Date(stripTz(lesson.startDate).replace(' ', 'T')).getTime();
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
};

const extractHHmm = (lesson: GetBandLessonResponse): string => {
  if (!lesson.startDate) return '';
  const m = lesson.startDate.match(/[T ](\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : '';
};

// "2026.05.21(목) 오전 7:00" → "오전 7:00"
const stripDatePrefix = (text: string): string =>
  text.replace(/^\d{4}\.\d{1,2}\.\d{1,2}\s*\([^)]+\)\s*/, '').trim();

const formatHHmm = (ms: number): string => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatAmPmKo = (ms: number): string => {
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${ampm} ${h}:${String(m).padStart(2, '0')}`;
};

type Status = 'ended' | 'ongoing' | 'upcoming';

export function TodayTimetable({
  title,
  lessons,
}: {
  title: string;
  lessons: GetBandLessonResponse[];
}) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(
    () => [...lessons].sort((a, b) => parseStart(a) - parseStart(b)),
    [lessons],
  );

  if (sorted.length === 0) return null;

  // 종료 시각 = startDate + duration(분). duration 없으면: 다음 수업 startDate 직전, 마지막은 +90분.
  const endOf = (i: number): number => {
    const start = parseStart(sorted[i]);
    const duration = sorted[i].duration;
    if (duration !== undefined && duration > 0) {
      return start + duration * 60 * 1000;
    }
    return i + 1 < sorted.length
      ? parseStart(sorted[i + 1])
      : start + LAST_LESSON_FALLBACK_MS;
  };

  const statusOf = (i: number): Status => {
    const start = parseStart(sorted[i]);
    if (now < start) return 'upcoming';
    if (now < endOf(i)) return 'ongoing';
    return 'ended';
  };

  const onClick = (lesson: GetBandLessonResponse) => {
    const route = lesson.type === 'subscription'
      ? KloudScreen.LessonGroupDetail(lesson.id)
      : KloudScreen.LessonDetail(lesson.id);
    kloudNav.push(route);
  };

  // 끝난/남은 경계에 그려지는 marker. 단, 진행중 row가 이미 있으면 카드와 겹치므로 숨긴다.
  // - ongoing 발견 → -1 (숨김)
  // - 첫 upcoming index → 그 위치 (단, i=0 = 아직 한 수업도 시작 안 한 상태면 어색해서 숨김)
  // - 모두 ended → sorted.length (맨 아래)
  const nowMarkerIndex = (() => {
    for (let i = 0; i < sorted.length; i++) {
      const s = statusOf(i);
      if (s === 'ongoing') return -1;
      if (s === 'upcoming') return i === 0 ? -1 : i;
    }
    return sorted.length;
  })();

  const NowMarker = () => (
    <li className={'flex items-center gap-3'}>
      <div className={'w-12 shrink-0'}/>
      <div className={'flex-1 h-[1.5px] bg-[#1E2124]'}/>
    </li>
  );

  return (
    <section className={'flex flex-col mb-2'}>
      <h2 className={'text-[18px] text-black font-bold pt-5 pb-3 px-6'}>{title}</h2>

      <ol className={'px-5 flex flex-col gap-3'}>
        {sorted.map((lesson, i) => {
          const status = statusOf(i);
          const isOngoing = status === 'ongoing';
          const isEnded = status === 'ended';
          const isLast = i === sorted.length - 1;
          const time = extractHHmm(lesson);
          const artist = lesson.artists?.[0] ?? lesson.artist;
          const artistName = artist?.nickName ?? artist?.name;
          const descriptionText = lesson.description ? stripDatePrefix(lesson.description) : '';
          const endTimeText = isOngoing && lesson.duration && lesson.duration > 0
            ? formatAmPmKo(parseStart(lesson) + lesson.duration * 60 * 1000)
            : null;

          const row = (
            <li className={'relative flex gap-3'}>
              {/* 시간 + 타임라인 트랙 */}
              <div className={'relative flex flex-col items-center w-12 shrink-0 pt-3'}>
                <span
                  className={[
                    'text-[12px] font-semibold leading-tight tabular-nums',
                    isEnded ? 'text-[#BFC2C5]' : 'text-[#1E2124]',
                  ].join(' ')}
                >
                  {time}
                </span>

                {/* 다음 row까지 이어지는 세로 트랙 */}
                {!isLast && (
                  <div
                    className={'absolute left-1/2 -translate-x-1/2 top-10 -bottom-3 w-[2px] bg-[#F1F3F6]'}
                  />
                )}

                {/* 점 — 진행중은 라이브 빨강 펄스, 나머지는 모노톤 */}
                <span
                  className={[
                    'mt-2 w-2.5 h-2.5 rounded-full z-10',
                    isOngoing
                      ? 'bg-[#EF4444] shadow-[0_0_0_4px_rgba(239,68,68,0.18)] animate-pulse'
                      : isEnded
                        ? 'bg-[#E5E7EB]'
                        : 'bg-[#1E2124]',
                  ].join(' ')}
                />
              </div>

              {/* 카드 */}
              <div
                role={'button'}
                tabIndex={0}
                onClick={() => onClick(lesson)}
                className={[
                  'flex-1 rounded-[14px] p-3 flex gap-3 cursor-pointer transition-colors',
                  'active:bg-[#F7F8F9]',
                  isOngoing
                    ? 'bg-white border-2 border-[#1E2124] shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                    : 'bg-white border border-[#F1F3F6]',
                  isEnded ? 'opacity-55' : '',
                ].filter(Boolean).join(' ')}
              >
                {lesson.thumbnailUrl && (
                  <div className={'relative w-14 h-14 rounded-[10px] overflow-hidden bg-[#F1F3F6] shrink-0'}>
                    <Image
                      src={lesson.thumbnailUrl}
                      alt={''}
                      fill
                      className={'object-cover'}
                      sizes={'56px'}
                    />
                  </div>
                )}
                <div className={'flex-1 min-w-0 flex flex-col justify-center'}>
                  <div className={'flex items-center gap-1.5 min-w-0'}>
                    {isOngoing && (
                      <span className={'inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#1E2124] px-2 py-0.5 rounded-full shrink-0'}>
                        <span className={'w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse'}/>
                        진행중
                      </span>
                    )}
                    {isEnded && (
                      <span className={'text-[10px] font-semibold text-[#919191] bg-[#F3F4F6] px-2 py-0.5 rounded-full shrink-0'}>
                        종료
                      </span>
                    )}
                    {lesson.studioName && (
                      <span className={'text-[11px] text-[#919191] truncate'}>{lesson.studioName}</span>
                    )}
                  </div>
                  <div className={'mt-0.5 text-[14px] font-bold text-black truncate'}>
                    {lesson.title}
                  </div>
                  {descriptionText && (
                    <div
                      className={[
                        'mt-0.5 text-[11px] font-medium tabular-nums truncate',
                        isEnded ? 'text-[#D1D6DB]' : 'text-[#B0B8C1]',
                      ].join(' ')}
                    >
                      {descriptionText}
                      {endTimeText && <span> ~ {endTimeText}</span>}
                    </div>
                  )}
                  {artistName && (
                    <div className={'mt-0.5 text-[12px] text-[#5C5C5C] truncate'}>{artistName}</div>
                  )}
                </div>
              </div>
            </li>
          );

          return (
            <React.Fragment key={lesson.id}>
              {i === nowMarkerIndex && <NowMarker />}
              {row}
            </React.Fragment>
          );
        })}
        {nowMarkerIndex === sorted.length && <NowMarker />}
      </ol>
    </section>
  );
}
