import { BankCode, BankOrCardIcon, pickBankKey } from "@/app/components/Bank";
import React from "react";

export const PaymentMethodLabel = ({ paymentMethod }: { paymentMethod: string }) => {

  return (
    <div className="flex w-full items-center justify-center gap-2">
      {paymentMethod && (
        <span
          className="inline-flex h-4 w-4 items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <BankOrCardIcon name={paymentMethod} scale={80} />
        </span>
      )}
      <span className="text-sm leading-none">{paymentMethod}</span>
    </div>
  );
};