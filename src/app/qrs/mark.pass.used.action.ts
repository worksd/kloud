'use server';

import { api } from "@/app/api.client";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

// QR 스캔값의 willUsePassId로 패스권 사용 — POST /passes/:id/use. 성공하면 해당 수업 티켓이 발급되어 돌아온다.
// 이어서 그 티켓을 useAction(POST /tickets/:id/use)으로 출석 처리한다.
export async function markPassUsedAction({ passId, lessonId }: { passId: number; lessonId: number }): Promise<TicketResponse | GuinnessErrorCase> {
  return await api.pass.use({ passId, lessonId });
}
