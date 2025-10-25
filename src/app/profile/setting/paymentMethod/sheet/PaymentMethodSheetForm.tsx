'use client'
import { useEffect, useRef, useState } from "react";
import { CreateBillingRequest } from "@/app/endpoint/billing.endpoint";
import { addBillingAction } from "@/app/profile/setting/paymentMethod/add.billing.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import CloseIcon from "@/../public/assets/ic_close.svg"
import AsyncCommonSubmitButton from "@/app/components/buttons/AsyncCommonSubmitButton";

export const PaymentMethodSheetForm = ({
                                         locale,
                                         onCloseAction,
                                         onSuccessAction,
                                       }: {
  locale: Locale,
  onCloseAction: () => void,
  onSuccessAction: () => void,
}) => {

  const [form, setForm] = useState<CreateBillingRequest>({
    cardNumber: '',
    expiryYear: '',
    expiryMonth: '',
    birthOrBusinessRegistrationNumber: '',
    passwordTwoDigits: '',
  })
  // refs for focusing
  const cardRef = useRef<HTMLInputElement>(null);
  const expiryYearRef = useRef<HTMLInputElement>(null);
  const expiryMonthRef = useRef<HTMLInputElement>(null);
  const birthRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const res = await addBillingAction(form)
    if ('billingKey' in res) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 이 코드 없으면 갱신안됨
      onSuccessAction()
      onCloseAction()
    } else {
      const dialog = await createDialog({
        id: 'Simple',
        message: res.message ?? ''
      })
      window.KloudEvent.showDialog(JSON.stringify(dialog))
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {

    }
  })

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ''); // 숫자만 남기기
    const formatted = raw
      .match(/.{1,4}/g)  // 4자리씩 끊기
      ?.join(' ')        // 공백으로 연결
      .trim() || '';

    setForm(prev => ({
      ...prev,
      cardNumber: formatted,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setForm(prev => ({...prev, [name]: value}));

    if (name == 'cardNumber' && value.length == 16) {
      expiryYearRef.current?.focus();
    }
    if (name === 'expiryMonth' && value.length === 2) {
      expiryYearRef.current?.focus();
    }

    if (name === 'expiryYear' && value.length === 2) {
      birthRef.current?.focus();
    }

    if (name === 'birthOrBusinessRegistrationNumber' && (value.length === 6 || value.length === 10)) {
      passwordRef.current?.focus();
    }
  };


  return (
    <main className="bg-white text-black px-5 py-8 rounded-[16px]">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tight">
          {getLocaleString({ locale, key: 'payment_information_input' })}
        </div>

        <button
          type="button"
          onClick={onCloseAction}
          aria-label="close">
          <CloseIcon className="h-5 w-5 text-black" />
        </button>
      </div>
      <div className="space-y-6 mt-4">
        <div>
          <div className="block text-sm text-gray-500 mb-1">{getLocaleString({
            locale,
            key: 'card_number_placeholder'
          })}</div>
          <input
            type="text"
            name="cardNumber"
            ref={cardRef}
            placeholder="1234 5678 9012 3456"
            value={form.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19} // 16자리 + 3공백
            inputMode="numeric"
            className="w-full bg-gray-50 text-black px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
          />
        </div>

        <div>
          <div className="block text-sm text-gray-500 mb-1">{getLocaleString({locale, key: 'expiration_date'})}</div>
          <div className="flex gap-3">
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              ref={expiryMonthRef}
              inputMode="numeric"
              value={form.expiryMonth}
              onChange={handleChange}
              className="w-1/2 bg-gray-50 text-black px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
            />
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              ref={expiryYearRef}
              inputMode="numeric"
              value={form.expiryYear}
              onChange={handleChange}
              className="w-1/2 bg-gray-50 text-black px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <div className="block text-sm text-gray-500 mb-1">{getLocaleString({
            locale,
            key: 'card_birthday_placeholder'
          })}</div>
          <input
            type="text"
            name="birthOrBusinessRegistrationNumber"
            placeholder="ex. 880101"
            inputMode="numeric"
            ref={birthRef}
            value={form.birthOrBusinessRegistrationNumber}
            onChange={handleChange}
            className="w-full bg-gray-50 text-black px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
          />
        </div>

        <div>
          <div className="block text-sm text-gray-500 mb-1">{getLocaleString({
            locale,
            key: 'card_password_two_digits_placeholder'
          })}</div>
          <input
            type="password"
            name="passwordTwoDigits"
            placeholder="••"
            inputMode="numeric"
            ref={passwordRef}
            value={form.passwordTwoDigits}
            onChange={handleChange}
            className="w-full bg-gray-50 text-black px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-between gap-4">
        <AsyncCommonSubmitButton disabled={form.passwordTwoDigits.length < 2} onClick={() => handleSubmit()}>
          <div className={'text-white'}>
            {getLocaleString({locale, key: 'confirm'})}
          </div>
        </AsyncCommonSubmitButton>
      </div>
    </main>
  )
}