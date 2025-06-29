'use client'
import { useRef, useState } from "react";
import { CreateBillingRequest } from "@/app/endpoint/billing.endpoint";
import { addBillingAction } from "@/app/profile/setting/paymentMethod/add.billing.action";

export const PaymentMethodSheetForm = ({baseRoute}: { baseRoute: string }) => {

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
      window.KloudEvent.closeBottomSheet()
      window.KloudEvent.refresh(baseRoute)
    }
  }

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
      <h1 className="text-2xl font-bold mb-10 tracking-tight">결제 정보 입력</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-500 mb-1">카드 번호</label>
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
          <label className="block text-sm text-gray-500 mb-1">유효기간</label>
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
          <label className="block text-sm text-gray-500 mb-1">생년월일 또는 사업자등록번호</label>
          <input
            type="text"
            name="birthOrBusinessRegistrationNumber"
            placeholder="ex. 880101 또는 1234567890"
            inputMode="numeric"
            ref={birthRef}
            value={form.birthOrBusinessRegistrationNumber}
            onChange={handleChange}
            className="w-full bg-gray-50 text-black px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">비밀번호 앞 2자리</label>
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
        <button
          onClick={() => {
            window.KloudEvent.closeBottomSheet()
          }}
          className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          className="w-1/2 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition"
        >
          제출
        </button>
      </div>
    </main>
  )
}