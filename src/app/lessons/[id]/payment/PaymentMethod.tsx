'use client'
import { StringResourceKey } from "@/shared/StringResource";
import { PaymentMethod } from "@/app/passPlans/[id]/payment/PassPaymentInfo";
import { useEffect, useState } from "react";
import { TranslatableText } from "@/utils/TranslatableText";
import { useLocale } from "@/hooks/useLocale";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { SelectablePassList } from "@/app/lessons/[id]/payment/SelectablePassList";

export const PaymentMethodComponent = ({
                                         paymentOptions,
                                         passes,
                                         selectedPass,
                                         selectPass,
                                         selectedMethod,
                                         selectPaymentMethodAction,
                                         depositor,
                                         setDepositorAction
                                       }: {
  paymentOptions: { id: PaymentMethod, label: StringResourceKey }[],
  passes?: GetPassResponse[],
  selectedPass?: GetPassResponse,
  selectPass?: (pass: GetPassResponse) => void,
  selectedMethod: PaymentMethod,
  selectPaymentMethodAction: (method: PaymentMethod) => void,
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
      {paymentOptions.map((option) => (
        <div
          key={option.id}
          className={'flex flex-col'}>
          <label

            className={`w-full flex items-center h-[52px] relative gap-2 pl-4 pr-2 py-2 rounded-lg border 
            ${selectedMethod === option.id ? "border-black bg-gray-100" : "border-gray-300"}
            cursor-pointer transition-all`}
          >
            <input
              type="checkbox"
              checked={selectedMethod === option.id}
              onChange={() => selectPaymentMethodAction(option.id)}
              className="w-5 h-5 accent-black cursor-pointer"
            />
            <div className="flex-grow text-sm font-medium text-left text-black">
              <TranslatableText titleResource={option.label}/>
            </div>
          </label>

          {passes && passes.length > 0 && selectedMethod == 'pass' && option.id == 'pass' && selectPass && selectedPass &&
            <SelectablePassList passItems={passes} onSelect={selectPass}
                                selectedPassId={selectedPass.id}/>
          }
          {selectedMethod === 'account_transfer' && option.id == 'account_transfer' &&
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

        </div>
      ))}
    </div>
  )
}