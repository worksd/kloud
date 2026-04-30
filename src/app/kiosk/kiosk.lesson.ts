/**
 * 키오스크에서 GetLessonResponse를 사람이 읽기 쉬운 문자열로 포맷하는 헬퍼들.
 * KioskLessonListForm / KioskLessonDetailModal 양쪽에서 쓴다.
 */

import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const toAmPm = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
};

const addMinutes = (hhmm: string, minutes: number): string => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const total = h * 60 + m + minutes;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
};

const startHHMM = (lesson: GetLessonResponse): string | null => {
  if (lesson.startDate) {
    const time = lesson.startDate.split(' ')[1];
    if (time) return time;
  }
  return lesson.formattedDate?.startTime ?? null;
};

const endHHMM = (lesson: GetLessonResponse): string | null => {
  if (lesson.formattedDate?.endTime) return lesson.formattedDate.endTime;
  const start = startHHMM(lesson);
  if (start && lesson.duration) return addMinutes(start, lesson.duration);
  return null;
};

export const formatLessonStart = (lesson: GetLessonResponse): string => {
  const t = startHHMM(lesson);
  return t ? toAmPm(t) : '';
};

export const formatLessonTimeRange = (lesson: GetLessonResponse): string => {
  const s = startHHMM(lesson);
  const e = endHHMM(lesson);
  if (s && e) return `${toAmPm(s)} - ${toAmPm(e)}`;
  if (s) return toAmPm(s);
  return '';
};

export const formatLessonDuration = (lesson: GetLessonResponse): string =>
  lesson.duration ? `${lesson.duration}분` : '';

export const formatLessonDate = (lesson: GetLessonResponse): string => {
  const raw = lesson.startDate ?? lesson.date;
  if (!raw) return '';
  const datePart = raw.split(' ')[0].replace(/\./g, '-');
  const parts = datePart.split('-').map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return '';
  const [y, m, d] = parts;
  const weekday = WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${weekday})`;
};
