'use client'

import {useState} from "react";
import {BankCode, BankOrCardIcon, pickBankKey} from "@/app/components/Bank";
import {BankSelectBottomSheet} from "@/app/components/BankSheet";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";
import {RefundAccountEditDialog} from "./RefundAccountEditDialog";
import {GetRefundPreviewResponse} from "@/app/endpoint/payment.record.endpoint";
import EditIcon from "../../../../../public/assets/ic_edit.svg";

type RefundMethodTitleProps = {
  refundPreview: GetRefundPreviewResponse;
  locale: Locale;
}

export const RefundMethodTitle = ({
                                    refundPreview,
                                    locale,
                                  }: RefundMethodTitleProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    bank: refundPreview.refundAccountBank ?? "",
    number: refundPreview.refundAccountNumber ?? "",
    depositor: refundPreview.refundDepositor ?? "",
  });
  const [selectedBankCode, setSelectedBankCode] = useState<BankCode | undefined>(
      () => pickBankKey(accountInfo.bank ?? '')
  );

  const handleAccountUpdate = (account: { bank: string; number: string; depositor: string }) => {
    setAccountInfo(account);
    setSelectedBankCode(pickBankKey(account.bank));
  };

  const handleBankSelect = (code: BankCode, label: string) => {
    setSelectedBankCode(code);
    setAccountInfo(prev => ({...prev, bank: label}));
    setIsBankSheetOpen(false);
  };

  return (
      <>
        <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1 text-[14px] font-medium text-[#191f28] active:opacity-70"
        >
          <EditIcon className="w-4 h-4"/>
          <span>
            {locale === 'ko'
                ? '수정하기'
                : locale === 'en'
                    ? 'Edit'
                    : locale === 'jp'
                        ? '編集'
                        : '编辑'}
          </span>
        </button>
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

