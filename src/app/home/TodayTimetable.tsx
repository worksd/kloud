'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { LessonTags } from '@/app/components/LessonTags';

// 홈 'Today' 밴드 / 스케줄 탭이 공용으로 쓰는 타임라인 row 데이터.
// 둘의 원본 응답 형태가 달라(GetBandLessonResponse / CalendarLesson) 컴포넌트가
// 실제로 쓰는 필드만 추린 최소 인터페이스로 입력을 일반화한다.
export type TimetableLesson = {
  id: number;
  title: string;
  thumbnailUrl?: string;
  startDate?: string; // 'yyyy-MM-dd HH:mm' 또는 ISO
  duration?: number;
  studioName?: string;
  /** 룸 이름. 호출부에서 각 응답 형태(roomName / room.name)를 매핑해 넣어준다. */
  roomName?: string;
  tags?: string;
  type?: 'default' | 'subscription';
  artist?: { nickName?: string; name?: string };
  artists?: { nickName?: string; name?: string }[];
};

const LAST_LESSON_FALLBACK_MS = 90 * 60 * 1000;

// BE는 KST 기준 시각을 ISO에 'Z'/오프셋으로 표기하므로, 타임존 마커를 제거한 뒤 로컬로 파싱한다.
const stripTz = (s: string): string =>
  s.replace(/Z$/, '').replace(/[+-]\d{2}:?\d{2}$/, '');

const parseStart = (lesson: TimetableLesson): number => {
  if (!lesson.startDate) return Number.MAX_SAFE_INTEGER;
  const t = new Date(stripTz(lesson.startDate).replace(' ', 'T')).getTime();
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
};

// 타임라인 표기용 — { ampm: 'AM' | 'PM', hm: 'H:mm' } 형태로 12시간제 분리.
const extractAmPm = (lesson: TimetableLesson): { ampm: string; hm: string } => {
  if (!lesson.startDate) return { ampm: '', hm: '' };
  const m = lesson.startDate.match(/[T ](\d{2}):(\d{2})/);
  if (!m) return { ampm: '', hm: '' };
  const hh = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = hh < 12 ? 'AM' : 'PM';
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return { ampm, hm: `${h12}:${mm}` };
};

type Status = 'ended' | 'ongoing' | 'upcoming';

export function TodayTimetable({
  title,
  lessons,
  endedLabel,
  ongoingLabel,
}: {
  title?: string;
  lessons: TimetableLesson[];
  endedLabel: string;
  ongoingLabel: string;
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

  const onClick = (lesson: TimetableLesson) => {
    const route = lesson.type === 'subscription'
      ? KloudScreen.LessonGroupDetail(lesson.id)
      : KloudScreen.LessonDetail(lesson.id);
    kloudNav.push(route);
  };

  // 끝난/남은 경계에 그려지는 marker. 단, 진행중 row가 이미 있으면 카드와 겹치므로 숨긴다.
  // - ongoing 발견 → -1 (숨김)
  // - 첫 upcoming index → 그 위치 (단, i=0 = 아직 한 수업도 시작 안 한 상태면 어색해서 숨김)
  // - 모두 ended → -1 (경계가 의미 없으므로 숨김)
  const nowMarkerIndex = (() => {
    for (let i = 0; i < sorted.length; i++) {
      const s = statusOf(i);
      if (s === 'ongoing') return -1;
      if (s === 'upcoming') return i === 0 ? -1 : i;
    }
    return -1;
  })();

  const NowMarker = () => (
    <li className={'flex items-center gap-3'}>
      <div className={'w-12 shrink-0'}/>
      <div className={'flex-1 h-[1.5px] bg-[#1E2124]'}/>
    </li>
  );

  return (
    <section className={'flex flex-col mb-2 overflow-hidden'}>
      {title && <h2 className={'text-[18px] text-black font-bold pt-5 pb-3 px-6'}>{title}</h2>}

      <ol className={'px-5 flex flex-col gap-3'}>
        {sorted.map((lesson, i) => {
          const status = statusOf(i);
          const isOngoing = status === 'ongoing';
          const isEnded = status === 'ended';
          const isFirst = i === 0;
          const isLast = i === sorted.length - 1;
          const { ampm, hm } = extractAmPm(lesson);

          const row = (
            <li className={'relative flex gap-3'}>
              {/* 시간 + status 막대 — 시간을 세로 중앙에 두고 막대가 위아래로 동시에 뻗는 station 라벨 스타일. */}
              <div className={'relative flex flex-col items-center justify-center w-12 shrink-0'}>
                {/* 막대 — column 전체 + row gap(12px)까지 확장. 첫/마지막 row만 안에서 rounded cap으로 마무리. */}
                <div
                  className={[
                    'absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full',
                    isFirst ? 'top-2' : '-top-3',
                    isLast ? 'bottom-2' : '-bottom-3',
                    isOngoing
                      ? 'bg-[#EF4444]'
                      : isEnded
                        ? 'bg-[#E5E7EB]'
                        : 'bg-[#919191]',
                  ].join(' ')}
                />

                {/* 시간 — AM/PM 작은 라벨 + 12시간제 H:mm 큰 글자. Paperlogy로 통일. bg-white로 막대 끊김. */}
                <div
                  className={[
                    'relative bg-white px-1 py-1.5 flex flex-col items-center font-paperlogy leading-none',
                    isEnded ? 'text-[#BFC2C5]' : 'text-[#1E2124]',
                  ].join(' ')}
                >
                  <span className={'text-[9px] font-bold tracking-wider opacity-60'}>{ampm}</span>
                  <span className={'text-[13px] font-bold tabular-nums mt-1'}>{hm}</span>
                </div>
              </div>

              {/* 카드 */}
              <div
                role={'button'}
                tabIndex={0}
                onClick={() => onClick(lesson)}
                className={[
                  'flex-1 min-w-0 rounded-[14px] p-3 flex gap-3 cursor-pointer transition-colors',
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
                    {isEnded && (
                      <div className={'absolute inset-0 bg-black/55 flex items-center justify-center'}>
                        <span className={'text-white text-[10px] font-bold leading-none px-1 text-center'}>{endedLabel}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className={'flex-1 min-w-0 flex flex-col justify-center'}>
                  <div className={'flex items-center gap-1.5 min-w-0'}>
                    {isOngoing && (
                      <span className={'inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#1E2124] px-2 py-0.5 rounded-full shrink-0'}>
                        <span className={'w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse'}/>
                        {ongoingLabel}
                      </span>
                    )}
                    {(lesson.studioName || lesson.roomName) && (
                      <span className={'text-[11px] text-[#919191] truncate'}>
                        {[lesson.studioName, lesson.roomName].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  <div className={'mt-0.5 text-[14px] font-bold text-black leading-snug line-clamp-2 break-words'}>
                    {lesson.title}
                  </div>
                  {lesson.tags && <LessonTags tags={lesson.tags} className={'mt-1'} />}
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
      </ol>
    </section>
  );
}
