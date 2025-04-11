import React, { useEffect, useState } from "react";
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import { createDialog } from "@/utils/dialog.factory";
import { TranslatableText } from "@/utils/TranslatableText";
import { useLocale } from "@/hooks/useLocale";
import { sendVerificationEmailAction } from "@/app/certification/send.verification.email.action";

export const NamePhoneInput = ({
                                 name,
                                 phone,
                                 rrn,
                                 setName,
                                 email,
                                 onClickCertificateEmail,
                                 setPhone,
                                 onClickSubmit,
                                 setRrn
                               }: {
  name: string,
  phone: string,
  rrn: string,
  email: string,
  onClickSubmit: ({code}: { code: number }) => void,
  onClickCertificateEmail: (code: string) => void,
  setName: (name: string) => void,
  setPhone: (phone: string) => void,
  setRrn: (rn: string) => void,
}) => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useEmailInstead, setUseEmailInstead] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd 형식
  const [gender, setGender] = useState<"M" | "F" | "">("M"); // 성별
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

  const isFormInvalid = useEmailInstead
    ? !name || birthDate.length == 0 || gender === ""
    : !name || rrn.length < 7 || phone.length < 13;

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
      if (useEmailInstead) {
        const [year, month, day] = birthDate.split('-'); // ['1999', '05', '13']
        const yy = year.slice(-2); // '99'
        const genderCode = (() => {
          const y = parseInt(year, 10);
          if (y >= 2000) return gender === 'M' ? '3' : '4';
          if (y >= 1900) return gender === 'M' ? '1' : '2';
          return gender === 'M' ? '9' : '0'; // 1800년대 fallback
        })();

        const rrn = `${yy}${month}${day}${genderCode}`;
        setRrn(rrn);
        setIsEmailSubmitting(true); // ✅ dim + spinner 활성화
        try {
          const res = await sendVerificationEmailAction();
          if ('code' in res) {
            onClickCertificateEmail(res.code);
          }
        } catch (e) {
          // 오류 처리 필요시 추가
        } finally {
          setIsEmailSubmitting(false); // ✅ dim + spinner 해제
        }
      } else {
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

        {/* 주민등록번호 입력 */}
        {!useEmailInstead &&
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
        }

        {/* 전화번호 입력 */}
        {!useEmailInstead &&
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
        }

        {useEmailInstead && (
          <div className="flex flex-col space-y-4 my-2">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="text-[14px] font-medium text-gray-800 leading-none">
                  <TranslatableText titleResource={'email'}/>
                </label>
                <TranslatableText
                  titleResource={'required'}
                  className="text-[10px] text-[#E55B5B] leading-none"
                />
              </div>
              <div className="text-[14px] text-gray-900 px-4 py-2 bg-gray-100 rounded-md border border-gray-300">
                {email}
              </div>
            </div>
            {/* 생년월일 */}
            <form onReset={() => {
              setBirthDate('');
              }}>
              <div className="flex items-center gap-1 mb-2">
                <label htmlFor="birthDate" className="text-[14px] font-medium text-gray-800 leading-none">
                  <TranslatableText titleResource={'real_birthday'}/>
                </label>
                <TranslatableText
                  titleResource={'required'}
                  className="text-[10px] text-[#E55B5B] leading-none"
                />
              </div>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full border border-gray-300 focus:border-black focus:outline-none rounded-md px-4 py-2 text-[14px]"
              />
            </form>

            {/* 성별 */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label htmlFor="birthDate" className="text-[14px] font-medium text-gray-800 leading-none">
                  <TranslatableText titleResource={'sex'}/>
                </label>
                <TranslatableText
                  titleResource={'required'}
                  className="text-[10px] text-[#E55B5B] leading-none"
                />
              </div>
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    value="M"
                    checked={gender === 'M'}
                    onChange={() => setGender('M')}
                    className="accent-black"
                  />
                  <TranslatableText titleResource={'man'}/>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    value="F"
                    checked={gender === 'F'}
                    onChange={() => setGender('F')}
                    className="accent-black"
                  />
                  <TranslatableText titleResource={'woman'}/>
                </label>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-end">
          <input
            type="checkbox"
            checked={useEmailInstead}
            onChange={() => setUseEmailInstead(!useEmailInstead)}
            id="useEmailCheckbox"
            className="w-4 h-4 text-black accent-black mr-2"
          />
          <label
            htmlFor="useEmailCheckbox"
            className="text-sm text-gray-400 font-medium cursor-pointer"
          >
            <TranslatableText titleResource={'are_you_foreigner'}/>
          </label>
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
    </div>
  );
}