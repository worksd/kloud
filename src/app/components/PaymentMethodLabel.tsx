import { BankCode, BankOrCardIcon, pickBankKey } from "@/app/components/Bank";
import React from "react";

export const PaymentMethodLabel = ({ paymentMethod }: { paymentMethod: string }) => {

  return (
    <div className="flex w-full items-center justify-center gap-1">
      {paymentMethod && (
        <BankOrCardIcon name={paymentMethod} size={20} />
      )}
      <span className="text-sm leading-none">{paymentMethod}</span>
    </div>
  );
};