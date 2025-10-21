'use client'
import { useEffect, useRef, useState } from "react";
import { CreateBillingRequest } from "@/app/endpoint/billing.endpoint";
import { addBillingAction } from "@/app/profile/setting/paymentMethod/add.billing.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";

export const PaymentMethodSheetForm = ({
                                         title,
                                         baseRoute,
                                         cardNumberPlaceholderText,
                                         expirationDateText,
                                         cardBirthdayText,
                                         cardPasswordTwoDigitsText,
                                         cancelText,
                                         confirmText
                                       }: {
  title: string,
  baseRoute: string,
  cardNumberPlaceholderText: string,
  expirationDateText: string,
  cardBirthdayText: string,
  cardPasswordTwoDigitsText: string,
  cancelText: string,
  confirmText: string
}) => {


  const [form, setForm] = useState<CreateBillingRequest>({
    cardNumber: '',
    expiryYear: '',
    expiryMonth: '',
    birthOrBusinessRegistrationNumber: '',
    passwordTwoDigits: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false); // isSubmitting 상태 추가

  // refs for focusing
  const cardRef = useRef<HTMLInputElement>(null);
  const expiryYearRef = useRef<HTMLInputElement>(null);
  const expiryMonthRef = useRef<HTMLInputElement>(null);
  const birthRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);


  const handleSubmit = async () => {
    setIsSubmitting(true); // 제출 시작 시 isSubmitting true로 설정
    const res = await addBillingAction(form)
    if ('billingKey' in res) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 이 코드 없으면 갱신안됨
      window.KloudEvent.closeBottomSheet()
      window.KloudEvent.refresh(baseRoute)
    } else {
      const dialog = await createDialog({
        id: 'Simple',
        message: res.message ?? await translate('billing_register_fail')
      })
      window.KloudEvent.showDialog(JSON.stringify(dialog))
    }
    setIsSubmitting(false); // 제출 완료 후 isSubmitting false로 설정

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
    <main className="min-h-screen bg-white text-black px-5 py-8">
      <div className="text-2xl font-bold mb-10 tracking-tight">{title}</div>
      {/* Dimmed Background and Spinner */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-black"></div>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <div className="block text-sm text-gray-500 mb-1">{cardNumberPlaceholderText}</div>
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
          <div className="block text-sm text-gray-500 mb-1">{expirationDateText}</div>
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
          <div className="block text-sm text-gray-500 mb-1">{cardBirthdayText}</div>
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
          <div className="block text-sm text-gray-500 mb-1">{cardPasswordTwoDigitsText}</div>
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
        <div
          onClick={() => {
            window.KloudEvent.closeBottomSheet()
          }}
          className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition text-center"
          >{cancelText}</div>
        <div
          onClick={handleSubmit}
          className="w-1/2 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition text-center"
        >{confirmText}</div>
      </div>
    </main>
  )
}