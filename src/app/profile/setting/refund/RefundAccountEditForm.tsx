'use client'
import React, { useEffect, useState } from "react";
import { InputComponent } from "@/app/components/InputComponent";
import { CommonSubmitButton } from "@/app/components/buttons";
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
  // ✅ 상태: 은행명(라벨) / 계좌번호 / 예금주
  const [refundAccountBank, setRefundAccountBank] = useState(initialAccountBank ?? "");
  const [refundAccountNumber, setRefundAccountNumber] = useState(initialAccountNumber ?? "");
  const [refundAccountDepositor, setRefundAccountDepositor] = useState(initialAccountDepositor ?? "");

  // ✅ 상태: 은행 선택 바텀시트
  const [isBankSheetOpen, setIsBankSheetOpen] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState<BankCode | undefined>(
    () => pickBankKey(initialAccountBank ?? '')
  );
  const handleClickSubmit = async () => {
    const bank = refundAccountBank.trim();
    const depositor = refundAccountDepositor.trim();
    const number = refundAccountNumber.trim();

    if (bank.length === 0 || depositor.length === 0 || number.length === 0) {
      const dialog = await createDialog({id: "EmptyAccountInformation"});
      window.KloudEvent.showDialog(JSON.stringify(dialog));
      return;
    }

    const res = await updateUserAction({
      refundAccountBank: bank,                       // ⚠️ 서버가 코드가 아니라 "라벨"을 원한다면 이대로 사용
      refundAccountNumber: number.replace(/-/g, ""), // 모든 하이픈 제거
      refundDepositor: depositor,
    });

    if (res.success) {
      const dialog = await createDialog({id: "RefundAccountUpdateSuccess"});
      window.KloudEvent.showDialog(JSON.stringify(dialog));
    }
  };

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
    };
  }, [baseRoute, isFromBottomSheet]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white pt-24">
      {/* 본문 */}
      <div className="flex flex-col px-4 space-y-2 pt-[24px] pb-[16px]">
        <button
          type="button"
          onClick={() => setIsBankSheetOpen(true)}
          className={[
            "w-full rounded-xl border border-gray-200 px-4 py-3 text-left",
            "flex items-center justify-between hover:bg-gray-50 transition",
          ].join(" ")}
          aria-label={refundBankText}
        >
          {/* 왼쪽: 아이콘 + 텍스트 */}
          <div className="flex items-center gap-3">
            {/* 아이콘 박스 */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white">
              {selectedBankCode ? (
                <BankOrCardIcon name={selectedBankCode} scale={50}/>
              ) : (
                // 기본(플레이스홀더) 아이콘
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

            {/* 라벨/값 */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{refundBankText}</span>
              <span className={refundAccountBank ? "text-black" : "text-gray-400"}>
        {refundAccountBank || refundBankPlaceholder}
      </span>
            </div>
          </div>

          {/* 오른쪽: 화살표 */}
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

        <InputComponent
          label={refundAccountText}
          placeholder={refundAccountPlaceholder}
          value={refundAccountNumber}
          onValueChangeAction={(value: string) => setRefundAccountNumber(value)}
        />

        <InputComponent
          label={refundDepositorText}
          placeholder={refundDepositorPlaceholder}
          value={refundAccountDepositor}
          onValueChangeAction={(value: string) => setRefundAccountDepositor(value)}
        />
      </div>

      {/* 남는 공간을 먹는 스페이서 */}
      <div className="flex-1"/>

      {/* 하단 버튼 (안전영역 포함) */}
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <CommonSubmitButton originProps={{onClick: handleClickSubmit}}>
          {confirmText ?? "확인"}
        </CommonSubmitButton>
      </div>

      <BankSelectBottomSheet
        open={isBankSheetOpen}
        selected={selectedBankCode}
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
