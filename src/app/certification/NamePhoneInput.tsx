import React, { useEffect, useState } from "react";
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import { createDialog } from "@/utils/dialog.factory";
import { TranslatableText } from "@/utils/TranslatableText";
import { useLocale } from "@/hooks/useLocale";

export const NamePhoneInput = ({
                                 name,
                                 phone,
                                 rrn,
                                 setName,
                                 onClickForeigner,
                                 setPhone,
                                 onClickSubmit,
                                 setRrn
                               }: {
  name: string,
  phone: string,
  rrn: string,
  onClickSubmit: ({code}: { code: number }) => void,
  onClickForeigner: () => void,
  setName: (name: string) => void,
  setPhone: (phone: string) => void,
  setRrn: (rn: string) => void,
}) => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, [])

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

  const isFormInvalid = !name || rrn.length < 7 || phone.length < 13;

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
        onClickSubmit({code: newCode});
      } else {
        const dialog = await createDialog('CertificationMismatch')
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }

    } catch (error) {
    } finally {
      setIsSubmitting(false); // 요청 완료 후 다시 활성화
    }
  };
  const {t} = useLocale()

  return (
    <div className="flex flex-col">

      {isEmailSubmitting && (
        <div
          className="absolute inset-0 z-50 bg-black bg-opacity-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"/>
          <TranslatableText className="text-white text-sm font-medium" titleResource={'submitting_email'}/>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-6 text-black">
        <TranslatableText className="text-[18px] font-bold mb-8" titleResource={'input_personal_information'}/>
        {/* 이름 입력 */}
        <div className="text-black">
          <div className="flex items-center gap-1 mb-2">
            <TranslatableText titleResource={'name'} className="text-[14px] font-medium"/>
            <TranslatableText titleResource={'required'} className="text-[10px] text-[#E55B5B]"/>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mounted ? t('input_name_message') : ''}
            className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
          />
        </div>
        <div className="text-black mb-2">
          <div className="flex items-center gap-1 mb-2">
            <TranslatableText titleResource={'rrn'} className="text-[14px] font-medium"/>
            <TranslatableText titleResource={'required'} className="text-[10px] text-[#E55B5B]"/>
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
              placeholder={mounted ? t('birthday') : ''}
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

        <div className="text-black">
          <div className="flex items-center gap-1 mb-2">
            <TranslatableText titleResource={'cellphone_number'} className="text-[14px] font-medium"/>
            <TranslatableText titleResource={'required'} className="text-[10px] text-[#E55B5B]"/>
          </div>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={mounted ? t('input_birthday_message') : ''}
            className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="p-6 flex flex-col">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isFormInvalid}
          className={`w-full py-4 rounded-lg text-[16px] font-medium
    ${isSubmitting || isFormInvalid
            ? 'bg-[#BCBFC2] text-white cursor-not-allowed'
            : 'bg-black text-white'}`}
        >
          <TranslatableText titleResource={isSubmitting ? 'submitting' : 'submit_code'}/>
        </button>
      </div>

      <div
        onClick={onClickForeigner}
        className="flex items-center justify-end px-6 text-[#BCBFC2]">
        Don&#39;t have a Korean phone number?
      </div>
    </div>
  );
}