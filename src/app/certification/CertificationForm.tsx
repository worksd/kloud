'use client';

import React, { useEffect, useState } from 'react';
import ArrowLeftIcon from '../../../public/assets/left-arrow.svg';
import { CertificationCodeInput } from "@/app/certification/CertificationCodeInput";
import { NamePhoneInput } from "@/app/certification/NamePhoneInput";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { DialogInfo } from "@/app/setting/setting.menu.item";

const getHeaderTitle = (step: number) => {
  if (step == 1) return '본인인증'
  else return '인증번호'
};

export const CertificationForm = () => {

  const [step, setStep] = useState(1);
  const [code, setCode] = useState(0);
  const [name, setName] = useState('');
  const [rrn, setRrn] = useState('');
  const [phone, setPhone] = useState('');

  const onClickBack = () => {
    if (step == 1) {
      window.KloudEvent?.back()
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
        <span className="text-[16px] font-bold text-black">{getHeaderTitle(step)}</span>
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
          () => {
            setCode(Math.floor(100000 + Math.random() * 900000))
          }
        } certificatePhone={async () => {
          const res = await updateUserAction({
            phone: phone,
            name: name,
            rrn: rrn,
          })
          if (res.success && res.user?.phone) {
            window.KloudEvent?.back()
            setInterval(() => {
              const dialogInfo = {
                id: 'Empty',
                type: 'SIMPLE',
                title: '본인인증 성공',
                message: '본인인증에 성공하였습니다',
              }
              window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
            }, 1000)
          }
        }}/>
      )}
    </div>
  );
};