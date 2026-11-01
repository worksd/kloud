// 내 정규반 상세 — 미납 안내 카드 데이터. GET /passes/:id 가 저장 상태 Unpaid 인 패스에만 route(미납 결제 페이지 경로)를 실어 준다(BE 1990cda0).
// 결제하기는 그 route 를 그대로 push — FE 가 item/id/paymentId 를 조립하지 않는다. 미납이어도 수업 이용은 멈추지 않으므로 결제 기한은 없다.
import { GetPassResponse, PassSubscriptionResponse } from "@/app/endpoint/pass.endpoint";

export type UnpaidInfo = {
  /** 결제할 금액(원) — 가격정책 가격 */
  amount: number;
  /** 미납 결제 페이지 경로(서버 값 그대로) */
  route: string;
  planName: string;
  /** 미납분 이용 기간 'yyyy.MM.dd' */
  startDate: string;
  endDate: string;
  /** 자동결제가 걸린 패스의 실패/해지 정보 — 있으면 카드에 한 줄 덧붙인다 */
  subscription?: PassSubscriptionResponse | null;
};

/** route 가 오면 미납 — 유효기간이 지나 표시 status 가 Expired 여도 route 는 오므로 status 가 아니라 route 로 판정 */
export const getUnpaidInfo = (pass: GetPassResponse): UnpaidInfo | null => {
  if (!pass.route) return null;
  return {
    amount: pass.passPlan?.price ?? pass.price ?? 0,
    route: pass.route,
    planName: pass.passPlan?.name ?? '',
    startDate: pass.startDate,
    endDate: pass.endDate,
    subscription: pass.subscription ?? null,
  };
};
