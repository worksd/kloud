import { CreateBillingRequest, GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { useState } from "react";

export default function CreateBillingDialog({
                                              isOpen,
                                              onClose,
                                              onSubmit,
                                            }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateBillingRequest) => void
}) {
  const [form, setForm] = useState<CreateBillingRequest>({
    cardNumber: '',
    expiryYear: '',
    expiryMonth: '',
    birthOrBusinessRegistrationNumber: '',
    passwordTwoDigits: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSubmit(form)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white text-black rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-6">결제 정보 입력</h2>

        <div className="space-y-4">
          <input
            type="text"
            name="cardNumber"
            placeholder="카드 번호"
            value={form.cardNumber}
            onChange={handleChange}
            className="w-full bg-white text-black border border-gray-300 px-4 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <div className="flex gap-2">
            <input
              type="text"
              name="expiryYear"
              placeholder="유효 년도 (YY)"
              value={form.expiryYear}
              onChange={handleChange}
              className="w-1/2 bg-white text-black border border-gray-300 px-4 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              name="expiryMonth"
              placeholder="유효 월 (MM)"
              value={form.expiryMonth}
              onChange={handleChange}
              className="w-1/2 bg-white text-black border border-gray-300 px-4 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <input
            type="text"
            name="birthOrBusinessRegistrationNumber"
            placeholder="생년월일 또는 사업자등록번호"
            value={form.birthOrBusinessRegistrationNumber}
            onChange={handleChange}
            className="w-full bg-white text-black border border-gray-300 px-4 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            name="passwordTwoDigits"
            placeholder="비밀번호 앞 2자리"
            value={form.passwordTwoDigits}
            onChange={handleChange}
            className="w-full bg-white text-black border border-gray-300 px-4 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            제출
          </button>
        </div>
      </div>
    </div>
  )
}

