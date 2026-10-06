import { LessonStatus } from '@/app/endpoint/lesson.endpoint';
import { getLessonsByDate } from '@/app/kiosk/get.lessons.by.date.action';
import { formatLessonTimeRange } from '@/app/kiosk/kiosk.lesson';
import { Locale } from '@/shared/StringResource';
import type { AdminSheetLesson } from '@/app/admin/AdminShortcuts';

/** Vercel 서버는 UTC — '오늘'은 KST 기준으로 계산해야 새벽에 어제 수업이 뜨지 않는다. 'yyyy.MM.dd' */
export const todayKst = (): string => {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${kst.getUTCFullYear()}.${pad(kst.getUTCMonth() + 1)}.${pad(kst.getUTCDate())}`;
};

/**
 * 관리자 홈 숏컷·현장결제 페이지용 하루 수업 — 취소 제외, 썸네일 + 제목 + 시간/강사·룸 라벨을 서버에서 미리 포맷.
 * date는 'yyyy.MM.dd'. 조회 실패는 빈 배열.
 */
export const getAdminLessonsByDate = async (studioId: number, date: string, locale: Locale): Promise<AdminSheetLesson[]> => {
  const res = await getLessonsByDate(studioId, date);
  const lessons = 'lessons' in res ? res.lessons.filter((l) => l.status !== LessonStatus.Cancelled) : [];
  return lessons.map((l) => ({
    id: l.id,
    title: l.title ?? '-',
    thumbnailUrl: l.thumbnailUrl,
    timeLabel: formatLessonTimeRange(l, locale) || undefined,
    subLabel: [l.artists?.[0]?.nickName, l.room?.name].filter(Boolean).join(' · ') || undefined,
    price: l.price,
  }));
};

/** 오늘(KST) 수업 */
export const getTodayAdminLessons = (studioId: number, locale: Locale) => getAdminLessonsByDate(studioId, todayKst(), locale);
