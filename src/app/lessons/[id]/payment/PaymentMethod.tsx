'use client'
import React from "react";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { SelectablePassList } from "@/app/lessons/[id]/payment/SelectablePassList";
import { GetPaymentMethodResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { SelectableBillingList } from "@/app/profile/setting/paymentMethod/BillingCardForm";
import { KloudScreen } from "@/shared/kloud.screen";
import { BankOrCardIcon } from "@/app/components/Bank";
import { kloudNav } from "@/app/lib/kloudNav";
import { PaymentMethodAddButton } from "@/app/components/popup/PaymentMethodBottomSheet";
import { Locale } from "@/shared/StringResource";
import { getBillingListAction } from "@/app/profile/setting/paymentMethod/get.billing.list.action";
import { getLocaleString } from "@/app/components/locale";
import { formatAccountNumber } from "@/utils/format.account";

type RefundAccount = {
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
};

const PaymentMethodIcon = ({type}: { type: PaymentMethodType }) => {
  switch (type) {
    case 'credit':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'account_transfer':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M13 4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="10" cy="11" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 9V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'pass':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 7.5H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M2 12.5H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 7.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 12.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'billing':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
};

const RadioIndicator = ({selected}: { selected: boolean }) => (
  <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
    ${selected ? 'border-black bg-black' : 'border-[#D1D5DB]'}`}>
    {selected && (
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
);

export const PaymentMethodComponent = ({
                                         locale,
                                         paymentOptions,
                                         passes,
                                         cards,
                                         onCardsChangeAction,
                                         selectedPass,
                                         selectPass,
                                         selectedMethod,
                                         selectedBillingCard,
                                         selectBillingCard,
                                         selectPaymentMethodAction,
                                         depositor,
                                         setDepositorAction,
                                         refundAccount,
                                       }: {
  locale: Locale,
  paymentOptions: GetPaymentMethodResponse[],
  passes?: GetPassResponse[],
  cards: GetBillingResponse[],
  onCardsChangeAction: (billing: GetBillingResponse[]) => void,
  selectedPass?: GetPassResponse,
  selectPass?: (pass: GetPassResponse) => void,
  selectedBillingCard?: GetBillingResponse,
  selectBillingCard?: (billing: GetBillingResponse) => void,
  selectedMethod?: PaymentMethodType,
  selectPaymentMethodAction: (method: PaymentMethodType) => void,
  depositor: string,
  setDepositorAction: (value: string) => void,
  refundAccount?: RefundAccount | null,
}) => {


  const goRefundAccount = () => {
    kloudNav.push(KloudScreen.RefundAccountSetting);
  };

  const handleOnSuccessAddBillingCard = async () => {
    const res = await getBillingListAction()
    if ('billings' in res) {
      onCardsChangeAction(res.billings)
    }
  }

  return (
    <div className="flex flex-col gap-y-3 px-6">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({locale, key: 'payment_method'})}
      </div>

      {paymentOptions.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {paymentOptions.map((option) => {
            const isSelected = selectedMethod === option.type;
            return (
              <div key={option.id} className="flex flex-col">
                <div
                  onClick={() => selectPaymentMethodAction(option.type)}
                  className={`w-full flex items-center gap-3 px-4 py-[14px] rounded-xl border cursor-pointer
                    transition-all duration-200 select-none active:scale-[0.98]
                    ${isSelected
                    ? 'border-black bg-[#F8F8F8] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'border-[#E8E8E8] bg-white hover:border-[#CDCDCD]'}`}
                >
                  <div className={`transition-colors duration-200 ${isSelected ? 'text-black' : 'text-[#ACACAC]'}`}>
                    <PaymentMethodIcon type={option.type}/>
                  </div>
                  <div className={`flex-grow text-[14px] font-semibold transition-colors duration-200
                    ${isSelected ? 'text-black' : 'text-[#6B6B6B]'}`}>
                    {option.name}
                  </div>
                  <RadioIndicator selected={isSelected}/>
                </div>

                {/* PASS 목록 */}
                {isSelected && option.type === 'pass' && (
                  passes && passes.length > 0 && selectPass && selectedPass ? (
                    <SelectablePassList
                      passItems={passes}
                      onSelect={selectPass}
                      selectedPassId={selectedPass.id}
                      locale={locale}
                    />
                  ) : (
                    <div className="mt-3 py-4 text-center text-[13px] text-[#999] bg-[#F8F8F8] rounded-xl">
                      {getLocaleString({locale, key: 'no_available_pass'})}
                    </div>
                  )
                )}

                {/* 계좌이체 섹션 */}
                {isSelected && option.type === 'account_transfer' && (
                  <div className="flex flex-col w-full space-y-4 text-black mt-3">
                    {/* 예금주 입력 */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-1">
                        <div className="text-black text-[14px] text-left font-bold">{getLocaleString({
                          locale,
                          key: 'depositor_name'
                        })}</div>
                        <div className="text-[#E55B5B] text-[13px] font-medium">{getLocaleString({
                          locale,
                          key: 'required'
                        })}</div>
                      </div>
                      <input
                        type="text"
                        placeholder={getLocaleString({locale, key: 'input_name_message'})}
                        className="border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-[14px] w-full
                                   focus:border-black focus:text-black focus:outline-none transition-colors"
                        value={depositor}
                        onChange={(e) => setDepositorAction(e.target.value)}
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.target.scrollIntoView({behavior: 'smooth', block: 'center'});
                          }, 300);
                        }}
                      />
                      <div className="flex items-start gap-1.5 mt-2 px-1">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-px">
                          <circle cx="7" cy="7" r="6" stroke="#ACACAC" strokeWidth="1.2"/>
                          <path d="M7 6V10" stroke="#ACACAC" strokeWidth="1.2" strokeLinecap="round"/>
                          <circle cx="7" cy="4.5" r="0.7" fill="#ACACAC"/>
                        </svg>
                        <span className="text-[12px] text-[#999] leading-tight">
                          {getLocaleString({locale, key: 'depositor_name_warning'})}
                        </span>
                      </div>
                    </div>

                    {/* 환불계좌 카드 */}
                    {refundAccount?.accountNumber ? (
                      <div className="rounded-xl border border-[#E8E8E8] bg-white">
                        <div className="px-4 pt-3 pb-2.5 border-b border-[#F2F2F2] flex items-center justify-between">
                          <span className="text-[13px] font-bold text-black">
                            {getLocaleString({locale, key: 'refund_account'})}
                          </span>
                          <button
                            type="button"
                            onClick={goRefundAccount}
                            className="text-[12px] font-medium px-2.5 py-1 rounded-lg border border-[#E0E0E0] text-[#6B6B6B]
                                       active:bg-gray-50 transition-colors"
                          >
                            {getLocaleString({locale, key: 'edit'})}
                          </button>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                          {refundAccount.bankName && (
                            <BankOrCardIcon name={refundAccount.bankName} scale={100}/>
                          )}
                          <div className="flex-1">
                            <div className="text-[14px] font-semibold text-black">
                              {refundAccount.bankName}
                              {refundAccount.holderName && (
                                <span className="ml-1 text-[13px] text-[#888] font-normal">
                                  ({refundAccount.holderName})
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[13px] text-[#888] tracking-wide">
                              {formatAccountNumber(refundAccount.accountNumber, refundAccount.bankName)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#FFE1C8] bg-[#FFF7F0] p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-9 w-9 rounded-full bg-white/80 flex items-center justify-center border border-[#FFD7B4] flex-shrink-0">
                            <span aria-hidden className="text-[14px] font-bold text-[#E8930C]">!</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-[13px] font-semibold text-[#6B3A00]">{getLocaleString({
                              locale,
                              key: 'no_registered_refund_title'
                            })}</div>
                            <div className="text-[12px] text-[#8C4A10] mt-1 leading-relaxed">{getLocaleString({
                              locale,
                              key: 'no_registered_refund_desc'
                            })}</div>
                            <button
                              type="button"
                              onClick={goRefundAccount}
                              className="mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-semibold
                                         bg-black text-white active:scale-[0.98] transition-transform"
                              aria-label="환불계좌 등록하러 가기"
                            >
                              {getLocaleString({locale, key: 'go_registered_refund_button_title'})}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 빌링 카드 섹션 */}
                {isSelected && option.type === 'billing' && selectBillingCard && (
                  <div className="flex flex-col">
                    <SelectableBillingList
                      billingCards={cards ?? []}
                      selectedBillingKey={selectedBillingCard}
                      onSelectAction={selectBillingCard}
                      locale={locale}
                    />
                    <PaymentMethodAddButton locale={locale} onSuccessAction={() => handleOnSuccessAddBillingCard()}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-[#888] font-medium text-center py-8">{getLocaleString({
          locale,
          key: 'no_available_payment_method'
        })}</div>
      )}
    </div>
  );
};
