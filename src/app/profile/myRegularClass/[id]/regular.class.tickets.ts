// 정규반 상품(pass)으로 발급된 내 수강권 전부 — 새 형식 passRule(단일)과 옛 형식 passRules[] 어느 쪽이 와도 모은다. id 중복 제거.
import { GetPassResponse, PassRuleTicket } from "@/app/endpoint/pass.endpoint";

export const collectRegularClassTickets = (pass: GetPassResponse): PassRuleTicket[] => {
  const all = [
    ...(pass.passRule?.tickets ?? []),
    ...(pass.passRules ?? []).flatMap((r) => r.tickets ?? []),
  ];
  const seen = new Set<number>();
  return all.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
};
