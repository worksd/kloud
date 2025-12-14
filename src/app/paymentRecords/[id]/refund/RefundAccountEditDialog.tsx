'use client'

import { useState, useEffect } from "react";
import { BankSelectBottomSheet } from "@/app/components/BankSheet";
import { BankCode, BankOrCardIcon, pickBankKey } from "@/app/components/Bank";
import { InputComponent } from "@/app/components/InputComponent";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { CommonDialog } from "@/app/components/CommonDialog";

type RefundAccountEditDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: (account: { bank: string; number: string; depositor: string }) => void;
  initialBank?: string | null;
  initialNumber?: string | null;
  initialDepositor?: string | null;
  locale: Locale;
}

export const RefundAccountEditDialog = ({
  open,
  onClose,
  onUpdate,
  initialBank,
  initialNumber,
  initialDepositor,
  locale,
}: RefundAccountEditDialogProps) => {
  const [refundAccountBank, setRefundAccountBank] = useState(initialBank ?? "");
  const [refundAccountNumber, setRefundAccountNumber] = useState(initialNumber ?? "");
  const [refundAccountDepositor, setRefundAccountDepositor] = useState(initialDepositor ?? "");
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState<BankCode | undefined>(
    () => pickBankKey(initialBank ?? '')
  );

  useEffect(() => {
    setRefundAccountBank(initialBank ?? "");
    setRefundAccountNumber(initialNumber ?? "");
    setRefundAccountDepositor(initialDepositor ?? "");
    setSelectedBankCode(pickBankKey(initialBank ?? ''));
  }, [initialBank, initialNumber, initialDepositor, open]);

  const handleSubmit = async () => {
    const bank = refundAccountBank.trim();
    const depositor = refundAccountDepositor.trim();
    const number = refundAccountNumber.trim();

    if (bank.length === 0 || depositor.length === 0 || number.length === 0) {
      const dialog = await createDialog({id: "EmptyAccountInformation"});
      if (window.KloudEvent && dialog) {
        window.KloudEvent.showDialog(JSON.stringify(dialog));
      }
      return;
    }

    const res = await updateUserAction({
      refundAccountBank: bank,
      refundAccountNumber: number.replace(/-/g, ""),
      refundDepositor: depositor,
    });

    if (res.success) {
      onUpdate({ bank, number, depositor });
      const dialog = await createDialog({id: "RefundAccountUpdateSuccess"});
      if (window.KloudEvent && dialog) {
        window.KloudEvent.showDialog(JSON.stringify(dialog));
      }
      onClose();
    }
  };

  return (
    <>
      <CommonDialog open={open} onClose={onClose}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {getLocaleString({locale, key: 'edit_refund_account'})}
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="p-2 -m-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* 은행 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getLocaleString({locale, key: 'refund_account_bank'})}
              </label>
              <button
                type="button"
                onClick={() => setIsBankSheetOpen(true)}
                className={[
                  "w-full rounded-xl border border-gray-200 px-4 py-3 text-left",
                  "flex items-center justify-between hover:bg-gray-50 transition",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white">
                    {selectedBankCode ? (
                      <BankOrCardIcon name={selectedBankCode} scale={50}/>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 10l9-6 9 6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 10h16v8H4z" strokeLinecap="round"/>
                        <path d="M7 14h0M12 14h0M17 14h0" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={refundAccountBank ? "text-black" : "text-gray-400"}>
                    {refundAccountBank || getLocaleString({locale, key: 'input_refund_account_bank'})}
                  </span>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* 계좌번호 */}
            <InputComponent
              label={getLocaleString({locale, key: 'refund_account_number'})}
              placeholder={getLocaleString({locale, key: 'input_refund_account_number'})}
              value={refundAccountNumber}
              onValueChangeAction={(value: string) => setRefundAccountNumber(value)}
            />

            {/* 예금주 */}
            <InputComponent
              label={getLocaleString({locale, key: 'depositor_name'})}
              placeholder={getLocaleString({locale, key: 'input_refund_account_depositor'})}
              value={refundAccountDepositor}
              onValueChangeAction={(value: string) => setRefundAccountDepositor(value)}
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              {getLocaleString({locale, key: 'cancel'})}
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
            >
              {getLocaleString({locale, key: 'confirm'})}
            </button>
          </div>
        </div>
      </CommonDialog>

      <BankSelectBottomSheet
        open={isBankSheetOpen}
        selected={selectedBankCode}
        onClose={() => setIsBankSheetOpen(false)}
        onSelect={(code, label) => {
          setSelectedBankCode(code);
          setRefundAccountBank(label);
          setIsBankSheetOpen(false);
        }}
        title={getLocaleString({locale, key: 'refund_account_bank'})}
      />
    </>
  );
};

