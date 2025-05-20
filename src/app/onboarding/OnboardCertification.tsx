'use client';

import React, { useEffect, useState } from 'react';
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import { TranslatableText } from "@/utils/TranslatableText";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { useLocale } from "@/hooks/useLocale";
import { translate } from "@/utils/translate";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { CertificationPage } from "@/app/certification/CertificationForm";
import { OnboardingForeignCertificationForm } from "@/app/onboarding/OnboaradingForeignCertificationForm";

type OnboardCertificationProps = {
  appVersion: string;
  user: GetUserResponse;
  page: CertificationPage;
  code: number;
  name: string;
  phone: string;
  rrn: string;
  myCode: string;
  birthDate: string;
  gender: string;
  country: string;
  setBirthDateAction: (value: string) => void;
  setGenderAction: (value: string) => void;
  setCountryAction: (value: string) => void;
  setNameAction: (name: string) => void;
  setPhoneAction: (phone: string) => void;
  setRrnAction: (rrn: string) => void;
  setCodeAction: (code: number) => void;
  setMyCodeAction: (myCode: string) => void;
  setPageAction: (page: CertificationPage) => void;
};

export const OnboardCertification = ({
                                       appVersion,
                                       user,
                                       page,
                                       code,
                                       myCode,
                                       name,
                                       phone,
                                       rrn,
                                       birthDate,
                                       gender,
                                       country,
                                       setNameAction,
                                       setPhoneAction,
                                       setRrnAction,
                                       setCodeAction,
                                       setMyCodeAction,
                                       setPageAction,
                                       setBirthDateAction,
                                       setGenderAction,
                                       setCountryAction
                                     }: OnboardCertificationProps) => {


  const [isCodeSent, setIsCodeSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const {t} = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePhoneChange = (value: string) => {
    setIsCodeSent(false);
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 11) {
      const formatted = numbers.length <= 3
        ? numbers
        : numbers.length <= 7
          ? `${numbers.slice(0, 3)}-${numbers.slice(3)}`
          : `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
      setPhoneAction(formatted);
    }
  };

  const handleNameChange = (value: string) => {
    setIsCodeSent(false);
    setNameAction(value);
  }

  const handleRrnChange = (value: string) => {
    setIsCodeSent(false);
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 7) setRrnAction(numbers);
  };

  const sendCertificationCode = async () => {

    try {
      if (isSending) return;
      setIsSending(true);
      const newCode = Math.floor(100000 + Math.random() * 900000);
      const res = await sendVerificationSMS({phone: phone.replace(/-/g, ''), code: newCode});

      if (res) {
        if (code != 0) {
          const resendDialog = await createDialog('Simple', await translate('resend_code_message'))
          window.KloudEvent.showDialog(JSON.stringify(resendDialog))
        }
        setIsCodeSent(true);
        setCodeAction(newCode);
      } else {
        const dialog = await createDialog('CertificationMismatch');
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {
      if (dialogInfo.id == 'CertificationComplete') {
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: '',
        });
        window.KloudEvent?.navigateMain(bootInfo);
      }
    }
  }, []);


  return (
    <div className="flex flex-col overflow-hidden">
      {page === 'certification' && (
        <div className="flex flex-col flex-1 p-6 text-black">

          {/* 이름 */}
          <TranslatableText titleResource="input_personal_information" className="text-[18px] font-bold mb-2"/>
          <TranslatableText titleResource="input_personal_information_message" className="mb-6"/>

          {/* 인증번호 입력 */}
          {isCodeSent && (
            <div className="flex flex-col mt-5">
              <TranslatableText titleResource="certification_code" className="text-[14px] font-medium"/>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={myCode}
                onChange={(e) => setMyCodeAction(e.target.value)}
                className="mt-2 w-full text-[14px] font-medium border border-gray-300 focus:border-black focus:outline-none rounded-md mb-3 p-4"
              />
              <div className="flex justify-end">
                <TranslatableText
                  titleResource="resend_code"
                  className="text-[#989DA2] font-medium cursor-pointer"
                  onClick={sendCertificationCode}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <TranslatableText titleResource="name" className="text-[14px] font-medium"/>
              <TranslatableText titleResource="required" className="text-[10px] text-[#E55B5B]"/>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={mounted ? t('input_name_message') : ''}
              className="w-full text-[14px] font-medium border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
            />
          </div>

          {/* 주민등록번호 */}
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <TranslatableText titleResource="rrn" className="text-[14px] font-medium"/>
              <TranslatableText titleResource="required" className="text-[10px] text-[#E55B5B]"/>
            </div>
            <div className="flex gap-2 items-center">
              <input
                id="rrnFirst"
                type="tel"
                maxLength={6}
                value={rrn.slice(0, 6)}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 6);
                  handleRrnChange(value);
                  if (value.length === 6) document.getElementById('rrnLast')?.focus();
                }}
                placeholder={mounted ? t('birthday') : ''}
                className="w-1/2 text-[14px] font-medium border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
              />
              <span>-</span>
              <input
                id="rrnLast"
                type="tel"
                maxLength={1}
                value={rrn.slice(6, 7)}
                onChange={(e) => {
                  handleRrnChange(rrn.slice(0, 6) + e.target.value);
                  if (e.target.value.length === 1) document.getElementById('phone')?.focus();
                }}
                placeholder="*"
                className="w-[60px] text-center text-[14px] font-medium border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
              />
              <span className="text-[14px] text-gray-500">******</span>
            </div>
          </div>

          {/* 휴대폰 번호 */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <TranslatableText titleResource="cellphone_number" className="text-[14px] font-medium"/>
              <TranslatableText titleResource="required" className="text-[10px] text-[#E55B5B]"/>
            </div>
            <div className="flex items-center gap-2 w-full">
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={mounted ? t('input_birthday_message') : ''}
                className="flex-grow text-[14px] font-medium border border-gray-300 focus:border-black focus:outline-none rounded-md p-4 min-w-0"
              />
              {!isCodeSent && (
                <TranslatableText
                  onClick={sendCertificationCode}
                  className={`
    text-[13px] bg-black text-white font-bold rounded-[8px] px-4 py-3
    transition-all duration-150 select-none text-center whitespace-nowrap flex-shrink-0
    ${phone.length > 0 && name.length > 0 && rrn.length > 0
                    ? "active:scale-[0.98] cursor-pointer"
                    : "opacity-50 pointer-events-none cursor-default"}
  `}
                  titleResource="submit_code"
                />
              )}
            </div>
            {!isCodeSent &&
              <div
                onClick={() => setPageAction('foreigner')}
                className="mt-4 text-right text-[#BCBFC2] cursor-pointer"
              >
                Don&#39;t have a Korean phone number?
              </div>
            }
          </div>
        </div>
      )}

      {page === 'foreigner' && (
        <OnboardingForeignCertificationForm
          email={user.email}
          name={name}
          setName={setNameAction}
          birthDate={birthDate}
          setBirthDate={setBirthDateAction}
          country={country}
          setCountry={setCountryAction}
          gender={gender}
          setGender={setGenderAction}/>
      )}
    </div>
  );
};
