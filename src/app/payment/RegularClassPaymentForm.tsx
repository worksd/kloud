'use client'

import React from "react";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { Locale } from "@/shared/StringResource";
import { useRegularClassPayment } from "@/app/payment/RegularClassPaymentContext";

/**
 * 정규반 결제 — 선택된 패스권의 견적으로 결제 폼을 그린다.
 * UnifiedPaymentInfo 는 payment 로 내부 상태(결제수단·할인·구독)를 초기화하므로, 패스권이 바뀌면 key 로 새로 마운트해
 * 이전 패스권의 선택이 새 견적에 섞이지 않게 한다.
 */
export const RegularClassPaymentForm = (props: {
  url: string;
  appVersion: string;
  os?: string;
  beforeDepositor: string;
  actualPayerUserId?: number;
  isProxyPayment: boolean;
  locale: Locale;
  buttonSlotId?: string;
}) => {
  const ctx = useRegularClassPayment();
  if (!ctx) return null;
  return (
    <UnifiedPaymentInfo
      key={ctx.selectedPlanId}
      type="pass-plan"
      payment={ctx.payment}
      {...props}
    />
  );
};
