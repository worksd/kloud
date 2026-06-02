'use client'
import React, { useEffect, useState } from "react";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { BankSelectBottomSheet } from "@/app/components/BankSheet";
import { BankCode, BankOrCardIcon, pickBankKey } from "@/app/components/Bank";

export const RefundAccountEditForm = ({
                                        initialAccountNumber,
                                        initialAccountBank,           // 초기 은행명(라벨) 문자열이 들어온다고 가정
                                        initialAccountDepositor,
                                        baseRoute,
                                        isFromBottomSheet,
                                        confirmText,
                                        refundBankText,
                                        refundBankPlaceholder,
                                        refundAccountText,
                                        refundAccountPlaceholder,
                                        refundDepositorText,
                                        refundDepositorPlaceholder,
                                      }: {
  initialAccountNumber?: string;
  initialAccountBank?: string;
  initialAccountDepositor?: string;
  baseRoute?: string;
  isFromBottomSheet?: boolean;
  confirmText?: string;
  refundBankText: string;
  refundBankPlaceholder: string;
  refundAccountText: string;
  refundAccountPlaceholder: string;
  refundDepositorText: string;
  refundDepositorPlaceholder: string;
}) => {
  const [refundAccountBank, setRefundAccountBank] = useState(initialAccountBank ?? "");
  const [refundAccountNumber, setRefundAccountNumber] = useState(initialAccountNumber ?? "");
  const [refundAccountDepositor, setRefundAccountDepositor] = useState(initialAccountDepositor ?? "");

  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState<BankCode | 'other' | undefined>(
    () => pickBankKey(initialAccountBank ?? '')
  );

  // 3개 필드 모두 채워졌을 때만 제출 활성
  const canSubmit =
    refundAccountBank.trim().length > 0 &&
    refundAccountNumber.trim().length > 0 &&
    refundAccountDepositor.trim().length > 0;

  const handleClickSubmit = async () => {
    if (!canSubmit) {
      const dialog = await createDialog({ id: "EmptyAccountInformation" });
      window.KloudEvent.showDialog(JSON.stringify(dialog));
      return;
    }

    const res = await updateUserAction({
      refundAccountBank: refundAccountBank.trim(),
      refundAccountNumber: refundAccountNumber.trim().replace(/-/g, ""), // 하이픈 제거
      refundDepositor: refundAccountDepositor.trim(),
    });

    if (res.success) {
      const dialog = await createDialog({ id: "RefundAccountUpdateSuccess" });
      window.KloudEvent.showDialog(JSON.stringify(dialog));
    }
  };

  useEffect(() => {
    window.onDialogConfirm = async (_data: DialogInfo) => {
    };
  }, [baseRoute, isFromBottomSheet]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F7F8F9]">
      {/* 안내 */}
      <div className="px-6 pt-6 pb-5">
        <p className="text-[13px] text-[#86898C] leading-relaxed">
          결제 취소·환불 시 입금받을 계좌입니다.<br/>
          예금주는 본인 명의로 등록해주세요.
        </p>
      </div>

      {/* 폼 카드 — 3개 필드를 하나의 흰 카드에 divider로 묶음 */}
      <div className="px-4">
        <div className="bg-white rounded-2xl divide-y divide-[#F1F3F6] overflow-hidden">
          {/* 은행 선택 */}
          <button
            type="button"
            onClick={() => setIsBankSheetOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#F7F8F9] transition-colors"
            aria-label={refundBankText}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F1F3F6] flex items-center justify-center shrink-0">
                {selectedBankCode ? (
                  <BankOrCardIcon name={selectedBankCode} size={22}/>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#BFC2C5]" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 10l9-6 9 6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 10h16v8H4z" strokeLinecap="round"/>
                    <path d="M7 14h0M12 14h0M17 14h0" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[11px] text-[#86898C]">{refundBankText}</span>
                <span className={`text-[15px] font-medium truncate ${refundAccountBank ? 'text-black' : 'text-[#BFC2C5]'}`}>
                  {refundAccountBank || refundBankPlaceholder}
                </span>
              </div>
            </div>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#BFC2C5] shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 계좌번호 */}
          <label className="block px-4 py-3 cursor-text">
            <span className="text-[11px] text-[#86898C]">{refundAccountText}</span>
            <input
              type="text"
              inputMode="numeric"
              value={refundAccountNumber}
              onChange={(e) => setRefundAccountNumber(e.target.value)}
              placeholder={refundAccountPlaceholder}
              className="w-full mt-0.5 text-[15px] font-medium text-black placeholder:text-[#BFC2C5] bg-transparent outline-none p-0 border-0"
            />
          </label>

          {/* 예금주 */}
          <label className="block px-4 py-3 cursor-text">
            <span className="text-[11px] text-[#86898C]">{refundDepositorText}</span>
            <input
              type="text"
              value={refundAccountDepositor}
              onChange={(e) => setRefundAccountDepositor(e.target.value)}
              placeholder={refundDepositorPlaceholder}
              className="w-full mt-0.5 text-[15px] font-medium text-black placeholder:text-[#BFC2C5] bg-transparent outline-none p-0 border-0"
            />
          </label>
        </div>
      </div>

      <div className="flex-1"/>

      {/* 제출 — 입력 미완 시 비활성 */}
      <div className="px-4 pb-6 pt-3 bg-[#F7F8F9]">
        <button
          type="button"
          onClick={handleClickSubmit}
          disabled={!canSubmit}
          className={`w-full h-[52px] rounded-[14px] text-[15px] font-bold transition-all ${
            canSubmit
              ? 'bg-black text-white active:scale-[0.98]'
              : 'bg-[#E5E7EB] text-[#BFC2C5]'
          }`}
        >
          {confirmText ?? "확인"}
        </button>
      </div>

      <BankSelectBottomSheet
        open={isBankSheetOpen}
        selected={selectedBankCode}
        selectedLabel={refundAccountBank}
        onClose={() => setIsBankSheetOpen(false)}
        onSelect={(code, label) => {
          setSelectedBankCode(code);
          setRefundAccountBank(label);
          setIsBankSheetOpen(false);
        }}
        title={refundBankText}
      />
    </div>
  );
};
