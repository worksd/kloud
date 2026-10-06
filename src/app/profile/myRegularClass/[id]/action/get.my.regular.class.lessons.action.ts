'use server'

import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { MyRegularClassLessonsResponse, MyRegularClassLessonResponse } from "@/app/endpoint/studio.endpoint";

/**
 * 내 정규반 수업(회차) 목록 — ⚠️ 지금은 MOCK. BE API 가 아직 없어 패스(상품)의 기간·요일로 회차를 만들어 낸다.
 * 화면은 isMock 을 보고 Mock 표시를 띄운다. API 가 나오면 이 함수 몸통만 api 호출로 바꾸고 isMock 을 뺀다.
 *
 * 만드는 규칙: 시작일~종료일 사이 다니는 요일(days, 없으면 화·목)마다 1회차, 20:00~21:20.
 *   지난 회차는 출석(4회마다 1번 결석), 오늘 이후는 예정. 제목은 반 이름.
 */
export const getMyRegularClassLessonsAction = async ({ pass }: { pass: GetPassResponse }): Promise<MyRegularClassLessonsResponse> => {
  const start = parseDate(pass.startDate);
  const end = parseDate(pass.endDate);
  if (!start || !end) return { lessons: [], isMock: true };

  const days = (pass.days && pass.days.length > 0) ? pass.days : [2, 4];
  const title = pass.passPlan?.regularClass?.name ?? pass.passPlan?.name ?? '';
  const studioName = pass.passPlan?.studio?.name;
  const now = Date.now();

  const lessons: MyRegularClassLessonResponse[] = [];
  let seq = 0;
  for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
    if (!days.includes(d.getDay())) continue;
    seq += 1;
    const startAt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0);
    const endAt = new Date(startAt.getTime() + 80 * 60 * 1000);
    const isPast = startAt.getTime() < now;
    lessons.push({
      // 가짜 id — 실제 수업이 아니라 상세로 이동시키지 않는다 (목록 컴포넌트가 isMock 이면 탭을 막는다)
      id: 900000 + seq,
      title: `${title} ${seq}회차`,
      startDate: fmt(startAt),
      endDate: fmt(endAt),
      thumbnailUrl: null,
      room: studioName ? { id: 1, name: 'A홀' } : null,
      artist: null,
      attendance: isPast ? (seq % 4 === 0 ? 'Absent' : 'Attended') : 'Upcoming',
      ticketId: isPast ? 800000 + seq : undefined,
    });
  }
  return { lessons, isMock: true };
};

// 'yyyy.MM.dd' | 'yyyy-MM-dd' → 로컬 Date(00:00)
const parseDate = (input?: string): Date | null => {
  if (!input) return null;
  const [y, m, d] = input.split(/[-.]/).map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
