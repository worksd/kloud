// TODO(2026-10-26): 정규반 수업 일정 변경 목 — UI 확인용 임시 코드. 서버 API(일정 변경 · 남은 횟수 · 변경 이력) 붙으면 main 배포 전 반드시 교체할 것.
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

/** 일정 변경 1건 — 이력 목록 한 줄이자 변경 API 응답에 실릴 모양(서버 스펙 나오면 맞춘다). */
export type RescheduleRecord = {
  id: number;
  /** 옮기기 전 수강권 id */
  ticketId: number;
  title: string;
  roomName?: string;
  /** 'yyyy.MM.dd HH:mm' KST */
  fromStartDate: string;
  fromEndDate?: string;
  toStartDate: string;
  toEndDate?: string;
  /** 'yyyy.MM.dd HH:mm' KST */
  changedAt: string;
};

export type RescheduleResult = {
  record: RescheduleRecord;
  remainingCount: number;
};

/** 정규반(pass) 1건의 일정 변경 한도/사용 횟수 — 서버 필드가 생기기 전 고정값. */
export const getRescheduleQuotaMock = (): { limit: number; used: number } => ({ limit: 2, used: 0 });

/** 변경 이력 — 서버 이력이 없어 빈 목록에서 시작, 이 화면에서 바꾼 것만 쌓인다. */
export const getRescheduleHistoryMock = (): RescheduleRecord[] => [];

const pad = (n: number) => String(n).padStart(2, '0');
const nowKst = () => {
  const d = new Date(Date.now() + 9 * 3600000);
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};

/**
 * 수업 일정 변경 목. 0.6초 뒤 성공(남은 횟수 1 감소), 남은 횟수가 없으면 LESSON_POSTPONE_LIMIT_EXCEEDED.
 * 새 일정은 화면이 계산해 넘긴 값을 그대로 확정한다 — 실제 서버는 배정·시점·횟수를 직접 판정한다.
 */
export const rescheduleTicketMock = async (
  { remaining, ...rest }: Omit<RescheduleRecord, 'id' | 'changedAt'> & { remaining: number },
): Promise<RescheduleResult | GuinnessErrorCase> => {
  await new Promise((r) => setTimeout(r, 600));
  if (remaining <= 0) return { code: 'LESSON_POSTPONE_LIMIT_EXCEEDED', message: '' };
  return { record: { ...rest, id: Date.now(), changedAt: nowKst() }, remainingCount: remaining - 1 };
};
