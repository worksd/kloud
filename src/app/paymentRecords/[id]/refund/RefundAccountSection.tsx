'use client'

import {useEffect, useState} from "react";
import {BankCode, BankOrCardIcon, pickBankKey} from "@/app/components/Bank";
import {BankSelectBottomSheet} from "@/app/components/BankSheet";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";
import {RefundAccountEditDialog} from "./RefundAccountEditDialog";
import {formatAccountNumber} from "@/utils/format.account";
import {GetRefundPreviewResponse} from "@/app/endpoint/payment.record.endpoint";

type RefundAccountSectionProps = {
  refundPreview: GetRefundPreviewResponse;
  locale: Locale;
}

export const RefundAccountSection = ({
                                       refundPreview,
                                       locale,
                                     }: RefundAccountSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    bank: refundPreview.refundAccountBank ?? "",
    number: refundPreview.refundAccountNumber ?? "",
    depositor: refundPreview.refundDepositor ?? "",
  });
  const [selectedBankCode, setSelectedBankCode] = useState<BankCode | undefined>(
      () => pickBankKey(accountInfo.bank)
  );

  useEffect(() => {
    setAccountInfo({
      bank: refundPreview.refundAccountBank ?? "",
      number: refundPreview.refundAccountNumber ?? "",
      depositor: refundPreview.refundDepositor ?? "",
    });
    setSelectedBankCode(pickBankKey(refundPreview.refundAccountBank ?? ''));
  }, [refundPreview.refundAccountBank, refundPreview.refundAccountNumber, refundPreview.refundDepositor]);

  const handleAccountUpdate = (account: { bank: string; number: string; depositor: string }) => {
    setAccountInfo(account);
    setSelectedBankCode(pickBankKey(account.bank));
  };

  const handleBankSelect = (code: BankCode, label: string) => {
    setSelectedBankCode(code);
    setAccountInfo(prev => ({...prev, bank: label}));
    setIsBankSheetOpen(false);
  };

  if (refundPreview.methodType !== 'account_transfer' && refundPreview.methodType !== 'admin') {
    return null;
  }

  return (
      <>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-black">
              {getLocaleString({locale, key: 'refund_account_bank'})}
            </span>
            <button
              onClick={() => setIsBankSheetOpen(true)}
              className="flex items-center gap-1 active:opacity-70"
            >
              {accountInfo.bank && selectedBankCode ? (
                <>
                  <BankOrCardIcon name={selectedBankCode} scale={75}/>
                  <span className="text-[14px] font-medium text-[#191f28]">{accountInfo.bank}</span>
                </>
              ) : (
                <span className="text-[14px] font-medium text-[#191f28]">{accountInfo.bank || "-"}</span>
              )}
            </button>
          </div>

          {/* 환불 계좌 번호 */}
          <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-black">
            {getLocaleString({locale, key: 'refund_account_number'})}
          </span>
            <span className="text-[14px] font-medium text-[#191f28] text-right">
            {accountInfo.number ? formatAccountNumber(accountInfo.number, accountInfo.bank) : "-"}
          </span>
          </div>

          {/* 예금주 */}
          <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-black">
            {getLocaleString({locale, key: 'depositor_name'})}
          </span>
            <span className="text-[14px] font-medium text-[#191f28] text-right">
            {accountInfo.depositor || "-"}
          </span>
          </div>
        </div>

        <BankSelectBottomSheet
            open={isBankSheetOpen}
            selected={selectedBankCode}
            onClose={() => setIsBankSheetOpen(false)}
            onSelect={handleBankSelect}
            title={getLocaleString({locale, key: 'refund_account_bank'})}
        />

        <RefundAccountEditDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onUpdate={handleAccountUpdate}
            initialBank={accountInfo.bank}
            initialNumber={accountInfo.number}
            initialDepositor={accountInfo.depositor}
            locale={locale}
        />
      </>
  );
};

