'use client';

// 강사 개인수업 개설 폼 (모바일 전용).
// 스튜디오 → 강의실 → (그 강의실의 날짜별 일정을 보면서) 일시 선택 → 만들기.
// 수업료는 항상 0원, 정원은 강의실 수용 인원 자동(표시만), 수업명은 '{날짜} {강사} 개인수업' 자동 생성.
// 성공 시 바로 수강생 초대 화면으로 이어진다.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { StudioRoomResponse } from '@/app/endpoint/studio.room.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import {
  getStudioRoomsAction,
  createPrivateLessonAction,
  getRoomDayLessonsAction,
  RoomDayScheduleItem,
} from '@/app/privateLessons/create/actions';
import LeftArrow from '../../../../public/assets/left-arrow.svg';

const pad = (n: number) => String(n).padStart(2, '0');
const toInputDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 요일/오전·오후/오늘 표기 — 로케일별 인라인 맵 (PricePolicySection의 DAY_LABEL 패턴)
const WEEKDAY_LABEL: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};
const TODAY_LABEL: Record<Locale, string> = { ko: '오늘', en: 'Today', jp: '今日', zh: '今天' };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const PrivateLessonCreateForm = ({studios, artistName, locale}: {
  studios: { id: number; name: string; profileImageUrl?: string }[];
  artistName: string;
  locale: Locale;
}) => {
  // 소속 스튜디오가 하나면 자동 선택
  const [studioId, setStudioId] = useState<number | null>(studios.length === 1 ? studios[0].id : null);
  // 선택하면 목록을 접고 선택된 스튜디오만 보여준다 — 접힌 행을 탭하면 다시 펼침
  const [studioListOpen, setStudioListOpen] = useState(studios.length > 1);
  const [rooms, setRooms] = useState<StudioRoomResponse[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  // 강의실도 선택하면 접고 선택된 곳만 — 접힌 행 탭으로 다시 펼침
  const [roomListOpen, setRoomListOpen] = useState(true);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');

  const [schedule, setSchedule] = useState<RoomDayScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRoom = useMemo(() => rooms.find((r) => r.id === roomId) ?? null, [rooms, roomId]);
  // 정원은 입력받지 않는다 — 강의실 수용 인원 그대로 (표시만)
  const limit = selectedRoom?.maxNumber ?? null;

  // 수업명 자동 생성 — 날짜를 고르면 '{M월 D일} {강사} 개인수업'
  const title = useMemo(() => {
    if (!date) return '';
    const [, m, d] = date.split('-').map(Number);
    return `${m}월 ${d}일 ${artistName} 개인수업`.trim();
  }, [date, artistName]);

  const loadRooms = useCallback(async (sid: number) => {
    setRoomsLoading(true);
    setRooms([]);
    setRoomId(null);
    const list = await getStudioRoomsAction({ studioId: sid });
    setRooms(list);
    if (list.length === 1) setRoomId(list[0].id);
    setRoomListOpen(list.length > 1);
    setRoomsLoading(false);
  }, []);

  useEffect(() => {
    if (studioId != null) loadRooms(studioId);
  }, [studioId, loadRooms]);

  // 강의실을 고르면 날짜 기본값은 오늘 — 오늘 일정부터 보여준다
  useEffect(() => {
    if (roomId != null && date === '') setDate(toInputDate(new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // 강의실 + 날짜가 정해지면 그 날 일정 로드
  useEffect(() => {
    if (studioId == null || roomId == null || date === '') {
      setSchedule([]);
      return;
    }
    let cancelled = false;
    setScheduleLoading(true);
    const [y, m, d] = date.split('-').map(Number);
    getRoomDayLessonsAction({ studioId, roomId, date: `${y}.${pad(m)}.${pad(d)}` })
      .then((items) => { if (!cancelled) setSchedule(items); })
      .finally(() => { if (!cancelled) setScheduleLoading(false); });
    return () => { cancelled = true; };
  }, [studioId, roomId, date]);

  // 날짜 스트립 — 오늘부터 14일
  const dateStrip = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return { value: toInputDate(d), day: d.getDate(), weekday: d.getDay(), isToday: i === 0 };
    });
  }, []);

  const durationNumber = Number(duration);

  // 고른 시각이 기존 일정과 겹치는지 — [slot, slot+duration) vs [start, end) 겹침 판정.
  // 응답에 duration이 없어 endTime을 모르는 일정은 60분으로 가정(경고 용도라 보수적 추정으로 충분).
  const isSlotOccupied = useCallback((slot: string) => {
    const s = toMinutes(slot);
    const e = s + (Number.isFinite(durationNumber) && durationNumber > 0 ? durationNumber : 0);
    return schedule.some((item) => {
      const itemStart = toMinutes(item.startTime);
      const itemEnd = item.endTime ? toMinutes(item.endTime) : itemStart + 60;
      return s < itemEnd && e > itemStart;
    });
  }, [schedule, durationNumber]);

  // 선택된 날짜 헤딩 — '8월 24일 (일)'
  const dateHeading = useMemo(() => {
    if (!date) return '';
    const dt = new Date(date);
    const m = dt.getMonth() + 1;
    const d = dt.getDate();
    const w = WEEKDAY_LABEL[locale][dt.getDay()];
    if (locale === 'ko') return `${m}월 ${d}일 (${w})`;
    if (locale === 'jp') return `${m}月${d}日 (${w})`;
    if (locale === 'zh') return `${m}月${d}日 (周${w})`;
    return `${w}, ${m}/${d}`;
  }, [date, locale]);

  const canSubmit =
    studioId != null && roomId != null && limit != null &&
    date !== '' && time !== '' &&
    Number.isFinite(durationNumber) && durationNumber > 0 &&
    title !== '' &&
    !submitting;

  const onSubmit = async () => {
    if (!canSubmit || studioId == null || roomId == null || limit == null) return;
    setSubmitting(true);
    setError(null);
    try {
      // 'YYYY.MM.dd HH:mm' (KST 벽시계) — input[type=date/time] 값 그대로 조립
      const [y, m, d] = date.split('-').map(Number);
      const startDate = `${y}.${pad(m)}.${pad(d)} ${time}`;
      const res = await createPrivateLessonAction({
        studioId,
        studioRoomId: roomId,
        startDate,
        duration: durationNumber,
        price: 0, // 개인수업은 항상 무료 — 수강권/현장결제 등록으로만 받는다
        limit,
        title,
      });
      if (isGuinnessErrorCase(res)) {
        setError(res.message);
        return;
      }
      window.KloudEvent?.showToast?.(getLocaleString({ locale, key: 'private_lesson_created' }));
      // 생성 직후: 수업 상세를 깔고 그 위에 수강생 등록 화면까지 띄운다 (뒤로가기 → 상세)
      await kloudNav.push(KloudScreen.LessonDetail(res.id));
      await kloudNav.push(KloudScreen.PrivateLessonInvite(res.id, studioId));
    } finally {
      setSubmitting(false);
    }
  };

  const sectionTitle = (key: Parameters<typeof getLocaleString>[0]['key']) => (
    <div className="text-[14px] font-bold text-black mb-2">{getLocaleString({ locale, key })}</div>
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col pb-[110px]">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-2">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => kloudNav.back()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full active:bg-[#F2F4F6] transition-colors"
        >
          <LeftArrow className="h-5 w-5 text-black"/>
        </button>
        <h1 className="text-[18px] font-bold text-black">
          {getLocaleString({ locale, key: 'private_lesson_create' })}
        </h1>
      </div>

      <div className="flex flex-col gap-6 px-5 pt-4">
        {/* 스튜디오 — 로고와 함께 세로 리스트. 선택하면 접혀서 선택된 곳만 남는다 */}
        <section>
          {sectionTitle('private_lesson_studio')}
          <div className="flex flex-col gap-2">
            {studios
              .filter((s) => studioListOpen || s.id === studioId)
              .map((s) => {
                const selected = s.id === studioId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (studioListOpen) {
                        setStudioId(s.id);
                        setStudioListOpen(false);
                      } else if (studios.length > 1) {
                        // 접힌 상태에서 탭 → 다시 펼쳐서 바꿀 수 있게
                        setStudioListOpen(true);
                      }
                    }}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      selected ? 'border-black bg-black' : 'border-[#EEEFF0] bg-white active:bg-[#F7F8F9]'
                    }`}
                  >
                    {s.profileImageUrl ? (
                      <Image
                        src={s.profileImageUrl}
                        alt={s.name}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-white"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[14px] font-bold text-[#6B7280] flex-shrink-0">
                        {s.name.slice(0, 1)}
                      </span>
                    )}
                    <span className={`flex-1 text-[15px] font-bold truncate ${selected ? 'text-white' : 'text-black'}`}>
                      {s.name}
                    </span>
                    {selected ? (
                      studios.length > 1 && !studioListOpen ? (
                        // 접힘 상태 — 탭하면 바꿀 수 있다는 힌트(아래 화살표)
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white/70">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="12" viewBox="0 0 10 8" fill="none" className="shrink-0">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )
                    ) : null}
                  </button>
                );
              })}
          </div>
        </section>

        {/* 강의실 — 세로 리스트. 선택하면 접혀서 선택된 곳만 남는다 */}
        {studioId != null && (
          <section>
            {sectionTitle('private_lesson_room')}
            {roomsLoading ? (
              <div className="py-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {rooms
                  .filter((r) => roomListOpen || r.id === roomId)
                  .map((r) => {
                    const selected = r.id === roomId;
                    const thumb = r.imageUrls?.[0];
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          if (roomListOpen) {
                            setRoomId(r.id);
                            setRoomListOpen(false);
                          } else if (rooms.length > 1) {
                            setRoomListOpen(true);
                          }
                        }}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                          selected ? 'border-black bg-black' : 'border-[#EEEFF0] bg-white active:bg-[#F7F8F9]'
                        }`}
                      >
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={r.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-[#F2F4F6]"
                          />
                        ) : (
                          <span className="w-9 h-9 rounded-lg bg-[#F2F4F6] flex items-center justify-center text-[14px] font-bold text-[#6B7280] flex-shrink-0">
                            {r.name.slice(0, 1)}
                          </span>
                        )}
                        <span className="flex flex-col flex-1 min-w-0">
                          <span className={`text-[15px] font-bold truncate ${selected ? 'text-white' : 'text-black'}`}>
                            {r.name}
                          </span>
                          <span className={`text-[12px] truncate ${selected ? 'text-white/60' : 'text-[#86898C]'}`}>
                            {getLocaleString({ locale, key: 'private_lesson_limit' })} · {getLocaleString({ locale, key: 'private_lesson_limit_max' }).replace('{count}', String(r.maxNumber))}
                          </span>
                        </span>
                        {selected ? (
                          rooms.length > 1 && !roomListOpen ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white/70">
                              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="16" height="12" viewBox="0 0 10 8" fill="none" className="shrink-0">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            )}
          </section>
        )}

        {/* 일시 — 날짜 스트립(2주) → 그 날 일정 타임라인 → 수업 길이 칩 → 시작 시각 슬롯 */}
        {roomId != null && (
          <section>
            {sectionTitle('private_lesson_datetime')}

            {/* 날짜 스트립 — 오늘부터 14일 가로 스크롤 */}
            <div className="-mx-5 px-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {dateStrip.map((d) => {
                const selected = d.value === date;
                const sunday = d.weekday === 0;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDate(d.value)}
                    className={`shrink-0 w-[52px] py-2 rounded-2xl flex flex-col items-center gap-0.5 transition-colors ${
                      selected ? 'bg-black' : 'bg-[#F7F8F9] active:bg-[#EEF0F2]'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold ${
                      selected ? 'text-white/70' : sunday ? 'text-[#E5484D]' : 'text-[#86898C]'
                    }`}>
                      {d.isToday ? TODAY_LABEL[locale] : WEEKDAY_LABEL[locale][d.weekday]}
                    </span>
                    <span className={`text-[17px] font-bold tabular-nums ${selected ? 'text-white' : 'text-black'}`}>
                      {d.day}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 그 날 강의실 일정 — 컴팩트 한 줄씩 */}
            <div className="mt-3 rounded-xl bg-[#F7F8F9] px-4 py-3">
              <div className="text-[12px] font-bold text-[#6B7280]">{dateHeading}</div>
              {scheduleLoading ? (
                <div className="py-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
                </div>
              ) : schedule.length === 0 ? (
                <div className="mt-1 text-[13px] text-[#919191]">
                  {getLocaleString({ locale, key: 'private_lesson_no_schedule' })}
                </div>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {schedule.map((s) => (
                    <li key={s.id} className="flex items-center gap-2.5 text-[13px]">
                      {s.thumbnailUrl ? (
                        <Image
                          src={s.thumbnailUrl}
                          alt={s.title}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-[#EEF0F2]"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-lg bg-[#EEF0F2] flex-shrink-0"/>
                      )}
                      <span className="font-semibold text-black tabular-nums shrink-0">
                        {s.startTime}{s.endTime ? `–${s.endTime}` : ''}
                      </span>
                      <span className="text-[#6B7280] truncate">{s.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 시작 시간 + 길이 — 한 줄 */}
            <div className="mt-3 flex gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 h-12 rounded-xl border border-[#E5E7EB] px-4 text-[15px] text-black focus:outline-none focus:border-black bg-white"
              />
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-[110px] h-12 rounded-xl border border-[#E5E7EB] px-3 text-[15px] text-black focus:outline-none focus:border-black bg-white appearance-none"
              >
                {['30', '60', '90', '120'].map((d) => (
                  <option key={d} value={d}>
                    {d}{getLocaleString({ locale, key: 'kiosk_minutes_suffix' })}
                  </option>
                ))}
              </select>
            </div>
            {/* 고른 시간이 기존 일정과 겹치면 경고만 (막지는 않음 — 서버가 최종 검증) */}
            {time !== '' && isSlotOccupied(time) && (
              <p className="mt-1.5 text-[12px] text-[#E5484D]">
                {getLocaleString({ locale, key: 'private_lesson_time_conflict' })}
              </p>
            )}
          </section>
        )}

        {/* 수업명 — 날짜를 고르면 자동 생성 (읽기 전용) */}
        {roomId != null && title !== '' && (
          <section>
            {sectionTitle('private_lesson_title_label')}
            <div className="w-full h-12 rounded-xl bg-[#F7F8F9] px-4 flex items-center text-[15px] font-semibold text-black">
              {title}
            </div>
          </section>
        )}

        {error && (
          <p className="text-[13px] text-[#E5484D] whitespace-pre-line">{error}</p>
        )}
      </div>

      {/* 하단 고정 제출 */}
      <div className="left-0 w-full fixed bottom-6 px-6">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className={`flex justify-center font-bold items-center w-full h-14 rounded-lg active:scale-[0.95] transition-transform duration-150 select-none ${
            canSubmit ? 'bg-black text-white' : 'bg-[#bcbfc2] text-white'
          }`}
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
          ) : (
            getLocaleString({ locale, key: 'private_lesson_create' })
          )}
        </button>
      </div>
    </div>
  );
};
