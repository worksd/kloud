/**
 * 키오스크에서 GetLessonResponse를 사람이 읽기 쉬운 문자열로 포맷하는 헬퍼들.
 * KioskLessonListForm / KioskLessonDetailModal 양쪽에서 쓴다.
 */

import { GetLessonResponse, LessonStatus } from "@/app/endpoint/lesson.endpoint";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const STATUS_LABEL_KEY: Record<string, StringResourceKey> = {
  [LessonStatus.Pending]: 'kiosk_lesson_status_pending',
  [LessonStatus.NotForSale]: 'kiosk_lesson_status_not_for_sale',
  [LessonStatus.PreSale]: 'kiosk_lesson_status_pre_sale',
  [LessonStatus.Recruiting]: 'kiosk_lesson_status_recruiting',
  [LessonStatus.Ready]: 'kiosk_lesson_status_ready',
  [LessonStatus.Cancelled]: 'kiosk_lesson_status_cancelled',
  [LessonStatus.Completed]: 'kiosk_lesson_status_completed',
  [LessonStatus.SaleClosed]: 'kiosk_lesson_status_sale_closed',
};

const INTL_LOCALE: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  jp: 'ja-JP',
  zh: 'zh-CN',
};

const NON_PAYABLE_STATUSES: ReadonlySet<string> = new Set([
  LessonStatus.Completed,    // 수업 종료
  LessonStatus.Cancelled,    // 수업 취소
  LessonStatus.SaleClosed,   // 결제 마감
  LessonStatus.NotForSale,   // 판매 예정
  LessonStatus.Pending,      // 공개 예정
]);

/** 수업이 결제 가능한 상태인지. price가 없거나 status가 비결제 상태면 false. */
export const isLessonPayable = (lesson: Pick<GetLessonResponse, 'status' | 'price'>): boolean => {
  if (lesson.price == null) return false;
  return !lesson.status || !NON_PAYABLE_STATUSES.has(lesson.status);
};

/** status 코드를 다국어 라벨로 변환. (예: Completed → '수업 종료' / 'Ended' / 'レッスン終了' / '已结束') */
export const lessonStatusLabel = (status: string | undefined, locale: Locale): string => {
  if (!status) return '';
  const key = STATUS_LABEL_KEY[status];
  return key ? getLocaleString({ locale, key }) : '';
};

/** 결제 불가 사유 라벨 — price 없으면 '구매불가' 우선, 그 외엔 status 라벨. 결제 가능한 수업이면 빈 문자열. */
export const lessonBlockLabel = (lesson: Pick<GetLessonResponse, 'status' | 'price'>, locale: Locale): string => {
  if (lesson.price == null) return getLocaleString({ locale, key: 'kiosk_lesson_unavailable' });
  if (lesson.status && NON_PAYABLE_STATUSES.has(lesson.status)) return lessonStatusLabel(lesson.status, locale);
  return '';
};

// "HH:mm" 문자열을 로케일 자연 포맷의 시간으로 (예: 오후 7:00 / 7:00 PM / 午後7:00 / 下午7:00)
const toAmPm = (hhmm: string, locale: Locale): string => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(INTL_LOCALE[locale], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
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

export const formatLessonStart = (lesson: GetLessonResponse, locale: Locale): string => {
  const t = startHHMM(lesson);
  return t ? toAmPm(t, locale) : '';
};

export const formatLessonTimeRange = (lesson: GetLessonResponse, locale: Locale): string => {
  const s = startHHMM(lesson);
  const e = endHHMM(lesson);
  if (s && e) return `${toAmPm(s, locale)} - ${toAmPm(e, locale)}`;
  if (s) return toAmPm(s, locale);
  return '';
};

export const formatLessonDuration = (lesson: GetLessonResponse, locale: Locale): string =>
  lesson.duration ? `${lesson.duration}${getLocaleString({ locale, key: 'kiosk_minutes_suffix' })}` : '';

export const formatLessonDate = (lesson: GetLessonResponse, locale: Locale): string => {
  const raw = lesson.startDate ?? lesson.date;
  if (!raw) return '';
  const datePart = raw.split(' ')[0].replace(/\./g, '-');
  const parts = datePart.split('-').map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return '';
  const [y, m, d] = parts;
  return new Date(y, m - 1, d).toLocaleDateString(INTL_LOCALE[locale], {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};
