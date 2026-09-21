'use client'

import React, { createContext, useContext, useState, ReactNode } from "react";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";

/**
 * 정규반 결제 — 가격정책(패스권) 선택 상태.
 *
 * 결제 견적(결제 id·할인·구독 가능 여부)은 GET /payment 가 패스권 하나 기준으로 주므로, 페이지 진입 때
 * 그 반의 패스권 전부의 견적을 한 번에 받아 두고(page.tsx) 여기서 선택만 바꾼다 — 옵션을 눌러도 재로딩 없음.
 * 헤더(모바일 본문 / PC 우측 카드)와 결제 폼(좌측)이 다른 컬럼에 있어 컨텍스트로 공유한다.
 */
type Ctx = {
  plans: GetPassPlanResponse[];
  payments: Record<number, GetPaymentResponse>;
  selectedPlanId: number;
  select: (planId: number) => void;
  /** 현재 선택된 패스권의 결제 견적 */
  payment: GetPaymentResponse;
};

const RegularClassPaymentCtx = createContext<Ctx | null>(null);

export const useRegularClassPayment = () => useContext(RegularClassPaymentCtx);

export function RegularClassPaymentProvider({ plans, payments, initialPlanId, children }: {
  plans: GetPassPlanResponse[];
  payments: Record<number, GetPaymentResponse>;
  initialPlanId: number;
  children: ReactNode;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const payment = payments[selectedPlanId] ?? payments[initialPlanId];
  if (!payment) return <>{children}</>;

  return (
    <RegularClassPaymentCtx.Provider value={{
      plans,
      payments,
      selectedPlanId,
      select: (id) => { if (payments[id]) setSelectedPlanId(id); },
      payment,
    }}>
      {children}
    </RegularClassPaymentCtx.Provider>
  );
}
