import React from "react";
import { PaymentMethodIcon } from "@/app/components/PaymentMethodIcon";
import { PaymentMethodType } from "@/app/endpoint/payment.endpoint";

// 결제수단 라벨 — 카드사/은행 로고 또는 방식별 플랫 아이콘(PaymentMethodIcon) + 텍스트
export const PaymentMethodLabel = ({ paymentMethod, methodType }: { paymentMethod: string; methodType?: PaymentMethodType | null }) => {
  return (
    <div className="flex w-full items-center justify-center gap-1">
      {paymentMethod && (
        <PaymentMethodIcon methodType={methodType} label={paymentMethod} size={20} />
      )}
      <span className="text-sm leading-none">{paymentMethod}</span>
    </div>
  );
};
