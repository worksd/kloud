'use client';

import React, { useState } from 'react';
import ArrowLeftIcon from '../../../public/assets/left-arrow.svg';
import { CertificationCodeInput } from "@/app/certification/CertificationCodeInput";
import { NamePhoneInput } from "@/app/certification/NamePhoneInput";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import { StringResourceKey } from "@/shared/StringResource";
import { TranslatableText } from "@/utils/TranslatableText";
import { useRouter } from "next/navigation";
import { createDialog } from "@/utils/dialog.factory";

const getHeaderTitleResource = (step: number): StringResourceKey => {
  if (step == 1) return 'certification'
  else return 'certification_code'
};

export const CertificationForm = ({appVersion}: { appVersion: string}) => {

  const [step, setStep] = useState(1);
  const [code, setCode] = useState(0);
  const [name, setName] = useState('');
  const [rrn, setRrn] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const onClickBack = () => {
    if (step == 1) {
      if (appVersion == '') {
        router.back();
      } else {
        window.KloudEvent?.back()
      }
    } else {
      setStep(step - 1)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex h-14 justify-center items-center">
        <div className="absolute left-4">
          <button className="flex items-center justify-center text-black rounded-full" onClick={onClickBack}>
            <ArrowLeftIcon className="w-6 h-6"/>
          </button>
        </div>
        <TranslatableText titleResource={getHeaderTitleResource(step)} className="text-[16px] font-bold text-black"/>
      </div>
      {step === 1 ? (
        <NamePhoneInput
          name={name}
          phone={phone}
          rrn={rrn}
          onClickSubmit={({code}: { code: number }) => {
            setStep(step + 1)
            setCode(code)
          }}
          setName={(name) => setName(name)}
          setPhone={setPhone}
          setRrn={setRrn}
        />
      ) : (
        <CertificationCodeInput code={code} generateNewCode={
          async () => {
            const newCode = Math.floor(100000 + Math.random() * 900000)
            const res = await sendVerificationSMS({
              phone: phone.replaceAll('-', ''),
              code: newCode,
            });
            if (res) {
              setCode(newCode);
            }
          }
        } certificatePhone={async () => {
          const res = await updateUserAction({
            phone: phone,
            name: name,
            rrn: rrn,
          })
          if (res.success && res.user?.phone) {
            if (appVersion == '') {
              router.back()
            } else {
              window.KloudEvent?.back()
            }
            setTimeout(() => {
              const dialogInfo = createDialog('CertificationSuccess')
              window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
            }, 1000)
          }
        }}/>
      )}
    </div>
  );
};