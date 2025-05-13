'use client';

import React, { useEffect, useState } from 'react';
import ArrowLeftIcon from '../../../public/assets/left-arrow.svg';
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import { TranslatableText } from "@/utils/TranslatableText";
import { useRouter } from "next/navigation";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { useLocale } from "@/hooks/useLocale";
import { ForeignCertificationForm } from "@/app/certification/ForeignCertificationForm";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { translate } from "@/utils/translate";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";

export type CertificationPage = 'certification' | 'foreigner';

export const CertificationForm = ({appVersion, user, isFromPayment}: { appVersion: string, user: GetUserResponse, isFromPayment: boolean }) => {
  const [page, setPage] = useState<CertificationPage>('certification');
  const [code, setCode] = useState(0);
  const [myCode, setMyCode] = useState("");
  const [name, setName] = useState('');
  const [rrn, setRrn] = useState('');
  const [phone, setPhone] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const {t} = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 11) {
      const formatted = numbers.length <= 3
        ? numbers
        : numbers.length <= 7
          ? `${numbers.slice(0, 3)}-${numbers.slice(3)}`
          : `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
      setPhone(formatted);
    }
  };

  const handleConfirm = async () => {
    if (code.toString() == myCode) {
      const res = await updateUserAction({
        phone: phone,
        name: name,
        rrn: rrn,
      })
      if (res.success) {
        const dialog = await createDialog('CertificationComplete')
        window.KloudEvent.showDialog(JSON.stringify(dialog))
      }
    }
    else {
      const dialogInfo = await createDialog('CertificationFail')
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    }
  }

  useEffect(() => {

  }, []);

  const handleRrnChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 7) setRrn(numbers);
  };

  const isFormInvalid = !name || rrn.length < 7 || phone.length < 13;

  const sendCertificationCode = async () => {
    setIsSubmitting(true);

    try {
      const newCode = Math.floor(100000 + Math.random() * 900000);
      const res = await sendVerificationSMS({phone: phone.replace(/-/g, ''), code: newCode});

      if (res) {
        if (code != 0) {
          const resendDialog = await createDialog('Simple', await translate('resend_code_message'))
          window.KloudEvent.showDialog(JSON.stringify(resendDialog))
        }
        setIsCodeSent(true);
        setCode(newCode);
      } else {
        const dialog = await createDialog('CertificationMismatch');
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClickBack = () => {
    if (page === 'certification') {
      if (appVersion == '') {
        router.back()
      } else {
        window.KloudEvent?.back()
      }
    } else {
      setRrn('');
      setPage('certification');
    }
  };

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {
      if (dialogInfo.id == 'CertificationComplete') {
        if (isFromPayment) {
          if (appVersion == '') {
            router.back()
          } else {
            window.KloudEvent?.back()
          }
        } else {
          const bottomMenuList = await getBottomMenuList();
          const bootInfo = JSON.stringify({
            bottomMenuList: bottomMenuList,
            route: '',
          });
          window.KloudEvent?.navigateMain(bootInfo);
        }
      }
    }
    }, [isFromPayment]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex h-14 justify-center items-center">
        <div className="absolute left-4">
          <button onClick={onClickBack} className="flex items-center justify-center text-black rounded-full">
            <ArrowLeftIcon className="w-6 h-6"/>
          </button>
        </div>
        <TranslatableText titleResource="certification" className="text-[16px] font-bold text-black"/>
      </div>

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
                onChange={(e) => setMyCode(e.target.value)}
                className="mt-2 w-full text-[14px] font-medium border border-gray-300 focus:border-black focus:outline-none rounded-md mb-3 p-4"
              />
              <div className="fixed bottom-0 left-0 right-0 px-6 pb-5 bg-white z-50">
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || isFormInvalid}
                  className={`w-full py-4 rounded-lg text-[16px] font-medium bg-black text-white`}
                >
                  <TranslatableText titleResource={isSubmitting ? 'submitting' : 'confirm'}/>
                </button>
              </div>
              <TranslatableText
                titleResource={'resend_code'}
                className="flex justify-end text-[#989DA2] font-medium"
                onClick={sendCertificationCode}
              />
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
              disabled={isCodeSent}
              onChange={(e) => setName(e.target.value)}
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
                disabled={isCodeSent}
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
                disabled={isCodeSent}
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
                  className="text-[13px] bg-black text-white font-bold rounded-[8px] px-4 py-3 active:scale-[0.98] transition-all duration-150 select-none text-center whitespace-nowrap flex-shrink-0"
                  titleResource="submit_code"
                />
              )}
            </div>
            {!isCodeSent &&
              <div
                onClick={() => setPage('foreigner')}
                className="mt-4 text-right text-[#BCBFC2] cursor-pointer"
              >
                Don&#39;t have a Korean phone number?
              </div>
            }
          </div>


        </div>
      )}

      {page === 'foreigner' && (
        <ForeignCertificationForm email={user.email} appVersion={appVersion} isFromPayment={isFromPayment}/>
      )}
    </div>
  );
};
