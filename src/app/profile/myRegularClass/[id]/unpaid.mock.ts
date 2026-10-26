// TODO(2026-10-26): 정규반 미납 정보 목 — UI 확인용 임시 코드. 서버가 미납 정보(금액·결제 기한·결제 경로)를 내려주면 main 배포 전 반드시 교체할 것.
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

export type UnpaidInfo = {
  /** 결제할 금액(원) */
  amount: number;
  /** 결제 대상 가격정책 — 결제하기는 이 가격정책 결제로 보낸다 */
  passPlanId: number;
  planName: string;
  /** 미납분 이용 기간 'yyyy.MM.dd' */
  startDate: string;
  endDate: string;
  /** 이 날까지 결제 안 하면 이용이 멈춘다 'yyyy.MM.dd' */
  dueDate: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
const plusDays = (s: string, n: number) => {
  const m = s.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
  const base = m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : Date.now() + 9 * 3600000;
  const d = new Date(base + n * 86400000);
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
};

/**
 * 미납(Unpaid) 상품이면 미납 정보, 아니면 null. force(?unpaidMock=1)면 상태와 무관하게 띄운다 — UI 확인용.
 * 결제 기한은 미납분 시작일 + 7일로 가정(서버 규칙 미정).
 */
export const getUnpaidInfoMock = (pass: GetPassResponse, force: boolean): UnpaidInfo | null => {
  if ((pass.status as string) !== 'Unpaid' && !force) return null;
  return {
    amount: pass.price || pass.passPlan?.price || 30000,
    passPlanId: pass.passPlan?.id ?? 0,
    planName: pass.passPlan?.name ?? '',
    startDate: pass.startDate,
    endDate: pass.endDate,
    dueDate: plusDays(pass.startDate, 7),
  };
};
