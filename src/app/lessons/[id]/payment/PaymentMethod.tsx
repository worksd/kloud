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

export const PaymentMethodComponent = ({
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
                                         setDepositorAction
                                       }: {
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
}) => {
  const [mounted, setMounted] = useState(false);
  const {t} = useLocale();
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return;

  return (
    <div className="flex flex-col gap-y-4 px-6">

      <div className="text-base font-bold text-left text-black">{<TranslatableText
        titleResource={'payment_method'}/>}</div>
      {paymentOptions.length > 0 ? paymentOptions.map((option) => (
        <div
          key={option.id}
          className={'flex flex-col'}>
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

          {passes && passes.length > 0 && selectedMethod == 'pass' && option.type == 'pass' && selectPass && selectedPass &&
            <SelectablePassList passItems={passes} onSelect={selectPass}
                                selectedPassId={selectedPass.id}/>
          }
          {selectedMethod === 'account_transfer' && option.type == 'account_transfer' &&
            <div className="flex flex-col w-full space-y-3 text-black mt-3">
              {/* 입력 필드 */}
              <div className="flex flex-col space-y-3 ">
                <div className={'flex flex-row items-center space-x-1'}>
                  <TranslatableText className={'text-base text-left font-bold'} titleResource={'depositor_name'}/>
                  <TranslatableText titleResource={'required'} className={'text-[#E55B5B] text-[14px] font-medium'}/>
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
            </div>
          }
          {selectedMethod === 'billing' && option.type == 'billing' && selectBillingCard &&
            <div className={'flex flex-col'}>
              <SelectableBillingList
                billingCards={cards ?? []}
                selectedBillingKey={selectedBillingCard}
                onSelectAction={selectBillingCard}
              />
              <button
                onClick={handleAddPaymentMethod} // 함수는 필요 시 너가 정의
                className="mt-2 py-2 rounded-xl border border-dashed border-gray-400 text-gray-600 text-sm hover:bg-gray-100 transition"
              >
                <TranslatableText titleResource={'add_payment_method_button'}/>
              </button>
            </div>


          }

        </div>
      )) : (
        <TranslatableText className={'text-black font-medium text-center'}
                          titleResource={'no_available_payment_method'}></TranslatableText>
      )}
    </div>
  )
}