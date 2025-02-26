import React, { useState } from "react";
import { sendVerificationSMS } from "@/app/certification/send.message.action";

export const NamePhoneInput = ({name, phone, rrn, setName, setPhone, onClickSubmit, setRrn}: {
  name: string,
  phone: string,
  rrn: string,
  onClickSubmit: ({code}: { code: number }) => void,
  setName: (name: string) => void,
  setPhone: (phone: string) => void,
  setRrn: (rn: string) => void,
}) => {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');

    if (numbers.length <= 11) {
      let formattedNumber = '';
      if (numbers.length <= 3) {
        formattedNumber = numbers;
      } else if (numbers.length <= 7) {
        formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
      }
      setPhone(formattedNumber);
    }
  };

  const handleRrnChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 7) {
      setRrn(numbers);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const newCode = Math.floor(100000 + Math.random() * 900000);

    try {
      const res = await sendVerificationSMS({
        phone: phone.replaceAll('-', ''),
        code: newCode,
      });

      if (res) {
        onClickSubmit({ code: newCode });
        console.log('Submit:', { name, phone });
      } else {
        const dialogInfo = {
          id: 'Empty',
          type: 'SIMPLE',
          title: '개인정보 불일치',
          message: '이름과 휴대전화 번호를 다시 입력해주십시오',
        };
        window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      }
    } catch (error) {
      console.error('SMS 전송 실패:', error);
    } finally {
      setIsSubmitting(false); // 요청 완료 후 다시 활성화
    }
  };

  return (
    <div className="flex flex-col">

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-6 text-black">
        <h1 className="text-[18px] font-bold mb-8">
          본인인증을 위해 정보를 입력해주세요
        </h1>

        {/* 이름 입력 */}
        <div className="text-black">
          <div className="flex items-center gap-1 mb-2">
            <label className="text-[14px] font-medium">이름</label>
            <span className="text-[10px] text-[#E55B5B]">필수</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
            className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
          />
        </div>

        {/* 주민등록번호 입력 */}
        <div className="text-black mb-2">
          <div className="flex items-center gap-1 mb-2">
            <label className="text-[14px] font-medium">주민등록번호</label>
            <span className="text-[10px] text-[#E55B5B]">필수</span>
          </div>
          <div className="flex gap-2 items-center">
            <input
              id="rrnFirst"
              type="tel"
              value={rrn.slice(0, 6)}
              onChange={(e) => {
                const value = e.target.value.slice(0, 6);
                handleRrnChange(value);
                if (value.length === 6) {
                  document.getElementById("rrnLast")?.focus();
                }
              }}
              maxLength={6}
              placeholder="앞자리(생년월일)"
              className="w-1/2 text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
            />
            <span className="flex items-center">-</span>
            <input
              id="rrnLast"
              type="tel"
              value={rrn.slice(6, 7)}
              onChange={(e) => {
                handleRrnChange(rrn.slice(0, 6) + e.target.value)
                if (e.target.value.length === 1) {
                  document.getElementById("phone")?.focus();
                }
              }}
              maxLength={1}
              placeholder="*"
              className="w-[60px] text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4 text-center"
            />
            <span className="text-[14px] font-medium text-gray-500">******</span>
          </div>
        </div>

        {/* 전화번호 입력 */}
        <div className="text-black">
          <div className="flex items-center gap-1 mb-2">
            <label className="text-[14px] font-medium">휴대폰 번호</label>
            <span className="text-[10px] text-[#E55B5B]">필수</span>
          </div>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="휴대폰 번호를 입력해주세요"
            className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="p-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name || phone.length < 13 || rrn.length < 7}
          className={`w-full py-4 rounded-lg text-[16px] font-medium
            ${isSubmitting || !name || phone.length < 13 || rrn.length < 7
            ? 'bg-[#BCBFC2] text-white cursor-not-allowed'
            : 'bg-black text-white'}`}
        >
          {isSubmitting ? '전송 중...' : '인증번호 발송'}
        </button>
      </div>
    </div>
  );
}