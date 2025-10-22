'use client'

import { PhoneVerification } from "@/app/components/PhoneVerification";
import { useEffect, useState } from "react";
import CommonSubmitButton from "../../components/buttons/CommonSubmitButton";
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import BackIcon from "../../../../public/assets/ic_back.svg";
import { kloudNav } from "@/app/lib/kloudNav";
import { VerificationCodeForm } from "@/app/login/phone/VerificationCodeForm";
import { checkVerificationCodeAction } from "@/app/login/phone/check.verification.code.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { createDialog } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import AsyncCommonSubmitButton from "@/app/components/buttons/AsyncCommonSubmitButton";

type PhoneVerificationStep = 'phone' | 'code';
export type PhoneVerificationStepConfig = {
  id: PhoneVerificationStep;
  message: string;
  buttonText: string;
  placeholder?: string;
}

export default function PhoneVerificationForm({steps}: { steps: PhoneVerificationStepConfig[] }) {

  const [step, setStep] = useState<PhoneVerificationStep>('phone');
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState<string>('KR');
  const [code, setCode] = useState<string>('')
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (step == 'phone') {
      setDisabled(phone.length < 6)
    } else if (step == 'code') {
      setDisabled(code.length !== 6)
    }
  }, [phone, step, code])

  const handleOnClick = async () => {
    if (step === 'phone') {
      setStep('code');
      setCode('');
      await sendVerificationSMS({phone, countryCode})
    } else if (step === 'code') {
      const res = await checkVerificationCodeAction({code, phone, countryCode})
      if ('accessToken' in res && res.accessToken) {
        await LoginAuthNavigation({status: res.user.status, window})
      } else {
        const resendDialog = await createDialog({id: 'Simple', message: await translate('certification_code_mismatch'), title: await translate('certification')})
        window.KloudEvent.showDialog(JSON.stringify(resendDialog))
      }
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async () => {

    }
  })

  const handleOnClickBack = () => {
    if (step === 'phone') {
      kloudNav.back()
    } else if (step === 'code') {
      setStep('phone')
    }
  }

  return (
    <div className="fixed inset-0 bg-white overflow-hidden px-6">
      <div className={'pt-16'} onClick={handleOnClickBack}>
        <BackIcon/>
      </div>
      {/* 위 컨텐츠: 버튼과 겹치지 않도록 아래 여백만 확보 */}
      <div className="pt-24 pb-4">
        <div className="text-black font-bold text-[22px]">
          {steps.find((value) => value.id == step)?.message}
        </div>
        {step === 'phone' && (
          <div className="mt-9">
            <PhoneVerification
              phone={phone}
              countryCode={countryCode}
              onChangeCountryCodeAction={(value: string) => setCountryCode(value)}
              onChangePhoneAction={(value: string) => {
                setPhone(value);
              }}/>
          </div>
        )}
        {step === 'code' && (
          <div className="mt-9">
            <VerificationCodeForm
              placeholder={steps.find((value) => value.id == 'code')?.placeholder ?? ''}
              value={code}
              handleChangeAction={(value: string) => {
                setCode(value)
              }}
            />
          </div>
        )}

      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed left-0 right-0 pb-6 px-6 bg-white/70">
        <AsyncCommonSubmitButton
          disabled={disabled}
          onClick={handleOnClick}>
          {steps.find((value) => value.id == step)?.buttonText}
        </AsyncCommonSubmitButton>
      </div>
    </div>
  );

}