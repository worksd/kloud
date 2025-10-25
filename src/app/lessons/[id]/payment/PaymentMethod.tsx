'use client'
import React, { useEffect, useState } from "react";
import { TranslatableText } from "@/utils/TranslatableText";
import { useLocale } from "@/hooks/useLocale";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { SelectablePassList } from "@/app/lessons/[id]/payment/SelectablePassList";
import { GetPaymentMethodResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { SelectableBillingList } from "@/app/profile/setting/paymentMethod/BillingCardForm";
import { KloudScreen } from "@/shared/kloud.screen";
import { BankOrCardIcon } from "@/app/components/Bank";
import { kloudNav } from "@/app/lib/kloudNav";

type RefundAccount = {
  bankName?: string;
  accountNumber?: string; // 원문 계좌번호(마스킹에서 사용)
  holderName?: string;
};

export const PaymentMethodComponent = ({
                                         baseRoute,
                                         paymentOptions,
                                         passes,
                                         cards,
                                         selectedPass,
                                         selectPass,
                                         selectedMethod,
                                         selectedBillingCard,
                                         handleAddPaymentMethod,
                                         selectBillingCard,
                                         selectPaymentMethodAction,
                                         depositor,
                                         setDepositorAction,
                                         refundAccount,
                                       }: {
  baseRoute: string;
  paymentOptions: GetPaymentMethodResponse[],
  passes?: GetPassResponse[],
  cards?: GetBillingResponse[],
  selectedPass?: GetPassResponse,
  selectPass?: (pass: GetPassResponse) => void,
  handleAddPaymentMethod?: () => void,
  selectedBillingCard?: GetBillingResponse,
  selectBillingCard?: (billing: GetBillingResponse) => void,
  selectedMethod?: PaymentMethodType,
  selectPaymentMethodAction: (method: PaymentMethodType) => void,
  depositor: string,
  setDepositorAction: (value: string) => void,
  refundAccount?: RefundAccount | null,
}) => {
  const [mounted, setMounted] = useState(false);
  const {t} = useLocale();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const maskAccount = (num: string) => {
    // 숫자만 추출 후 뒤 4자리만 노출
    const digits = num.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    const masked = "*".repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
    // 원본 포맷이 있으면 간단 포맷 재적용
    return masked.replace(/(.{4})/g, "$1 ").trim();
  };

  const goRefundAccount = () => {
    kloudNav.push(KloudScreen.RefundAccountSetting);
  };

  return (
    <div className="flex flex-col gap-y-4 px-6">
      <div className="text-base font-bold text-left text-black">
        <TranslatableText titleResource="payment_method"/>
      </div>

      {paymentOptions.length > 0 ? paymentOptions.map((option) => (
        <div key={option.id} className="flex flex-col">
          <label
            className={`w-full flex items-center h-[52px] relative gap-2 pl-4 pr-2 py-2 rounded-lg border 
              ${selectedMethod === option.type ? "border-black bg-gray-100" : "border-gray-300"}
              cursor-pointer transition-all`}
          >
            <input
              type="checkbox"
              checked={selectedMethod === option.type}
              onChange={() => selectPaymentMethodAction(option.type)}
              className="w-5 h-5 accent-black cursor-pointer"
            />
            <div className="flex-grow text-sm font-medium text-left text-black">
              {option.name}
            </div>
          </label>

          {/* PASS 목록 */}
          {passes && passes.length > 0 && selectedMethod === 'pass' && option.type === 'pass' && selectPass && selectedPass &&
            <SelectablePassList passItems={passes} onSelect={selectPass} selectedPassId={selectedPass.id}/>
          }

          {/* 계좌이체 섹션 */}
          {selectedMethod === 'account_transfer' && option.type === 'account_transfer' && (
            <div className="flex flex-col w-full space-y-4 text-black mt-3">
              {/* 예금주 입력 */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-1">
                  <TranslatableText className="text-black text-base text-left font-bold"
                                    titleResource="depositor_name"/>
                  <TranslatableText titleResource="required" className="text-[#E55B5B] text-[14px] font-medium"/>
                </div>
                <input
                  type="text"
                  placeholder={mounted ? t('input_name_message') : ''}
                  className="border border-gray-300 rounded-lg p-4 text-[14px] w-full disabled:bg-gray-100
                             focus:border-black focus:text-black focus:outline-none"
                  value={depositor}
                  onChange={(e) => setDepositorAction(e.target.value)}
                />
              </div>

              {/* 환불계좌 카드 */}
              {refundAccount?.accountNumber ? (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  {/* 타이틀 영역 */}
                  <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        <TranslatableText titleResource="refund_account"/>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={goRefundAccount}
                      className="text-xs font-medium px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition"
                    >
                      <TranslatableText titleResource="edit"/>
                    </button>
                  </div>

                  {/* 본문 영역 */}
                  <div className="flex items-start gap-3 p-4">
                    {/* 아이콘 */}
                    {refundAccount.bankName && (
                      <BankOrCardIcon name={refundAccount.bankName} scale={100}/>
                    )}
                    {/* 계좌 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {refundAccount.bankName}
                        {refundAccount.holderName && (
                          <span className="ml-1 text-sm text-gray-500">
                            ({refundAccount.holderName})
                          </span>
                        )}
                      </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700">
                        {maskAccount(refundAccount.accountNumber)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 환불계좌 없을 때 경고/안내 카드 + CTA
                <div className="rounded-xl border border-[#FFE1C8] bg-[#FFF7F0] p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-full bg-white/80 flex items-center justify-center border border-[#FFD7B4]">
                      <span aria-hidden className="text-base">!</span>
                    </div>
                    <div className="flex-1">
                      <TranslatableText titleResource={'no_registered_refund_title'} className="text-sm font-semibold text-[#6B3A00]"/>
                      <TranslatableText titleResource={'no_registered_refund_desc'} className="text-xs text-[#8C4A10] mt-1"/>
                      <button
                        type="button"
                        onClick={goRefundAccount}
                        className="mt-3 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium
                                   bg-black text-white hover:opacity-90 active:scale-[0.98] transition"
                        aria-label="환불계좌 등록하러 가기"
                      >
                        <TranslatableText titleResource={'go_registered_refund_button_title'}/>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 빌링 카드 섹션 */}
          {selectedMethod === 'billing' && option.type === 'billing' && selectBillingCard && (
            <div className="flex flex-col">
              <SelectableBillingList
                billingCards={cards ?? []}
                selectedBillingKey={selectedBillingCard}
                onSelectAction={selectBillingCard}
              />
              <button
                onClick={handleAddPaymentMethod}
                className="mt-2 py-2 rounded-xl border border-dashed border-gray-400 text-gray-600 text-sm hover:bg-gray-100 transition"
              >
                <TranslatableText titleResource="add_payment_method_button"/>
              </button>
            </div>
          )}
        </div>
      )) : (
        <TranslatableText className="text-black font-medium text-center" titleResource="no_available_payment_method"/>
      )}
    </div>
  );
};
