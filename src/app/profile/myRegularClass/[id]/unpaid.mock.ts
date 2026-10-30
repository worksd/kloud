// TODO(2026-10-26): 정규반 미납 정보 목 — UI 확인용 임시 코드. 서버가 미납 정보(금액·결제 경로)를 내려주면 main 배포 전 반드시 교체할 것.
// 결제하기는 정규반 등록(item=regular-class, id=반 id)으로 — 정규반 상품은 패스권(item=pass-plan)으로 사지 않는다.
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

export type UnpaidInfo = {
  /** 결제할 금액(원) */
  amount: number;
  /** 결제할 반 — 결제하기는 정규반 등록(item=regular-class)으로 보낸다. 0 이면 버튼을 숨긴다 */
  regularClassId: number;
  planName: string;
  /** 미납분 이용 기간 'yyyy.MM.dd' */
  startDate: string;
  endDate: string;
};

/**
 * 미납(Unpaid) 상품이면 미납 정보, 아니면 null. force(?unpaidMock=1)면 상태와 무관하게 띄운다 — UI 확인용.
 * 미납이어도 수업 이용은 멈추지 않으므로 결제 기한은 없다.
 */
export const getUnpaidInfoMock = (pass: GetPassResponse, regularClassId: number | undefined, force: boolean): UnpaidInfo | null => {
  if ((pass.status as string) !== 'Unpaid' && !force) return null;
  return {
    amount: pass.price || pass.passPlan?.price || 30000,
    regularClassId: regularClassId ?? pass.passPlan?.regularClass?.id ?? 0,
    planName: pass.passPlan?.name ?? '',
    startDate: pass.startDate,
    endDate: pass.endDate,
  };
};
