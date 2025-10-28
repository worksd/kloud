'use client'

import { PhoneVerification } from "@/app/components/PhoneVerification";
import { useEffect, useRef, useState } from "react";
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import BackIcon from "../../../../public/assets/ic_back.svg";
import { kloudNav } from "@/app/lib/kloudNav";
import { VerificationCodeForm } from "@/app/login/phone/VerificationCodeForm";
import { checkVerificationCodeAction } from "@/app/login/phone/check.verification.code.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { LoginAuthNavigation } from "@/app/login/loginAuthNavigation";
import AsyncCommonSubmitButton from "@/app/components/buttons/AsyncCommonSubmitButton";
import { flushSync } from "react-dom";
import { loginSuccessAction } from "@/app/login/action/login.success.action";
import { Locale } from "@/shared/StringResource";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { KloudScreen } from "@/shared/kloud.screen";

type PhoneVerificationStep = 'phone' | 'code';
export type PhoneVerificationStepConfig = {
  id: PhoneVerificationStep;
  message: string;
  buttonText: string;
  placeholder?: string;
}

export default function PhoneVerificationForm({steps, locale, isFromLogin}: {
  steps: PhoneVerificationStepConfig[],
  locale: Locale,
  isFromLogin: boolean
}) {

  const [step, setStep] = useState<PhoneVerificationStep>('phone');
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState<string>('KR');
  const [code, setCode] = useState<string>('')
  const [disabled, setDisabled] = useState<boolean>(true);
  const phoneRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const el = phoneRef.current;
      if (!el) return;
      try {
        el.focus({preventScroll: true} as any);
      } catch {
        el.focus(); // fallback
      }
    }, 300); // 300~500ms 권장 (1초까지는 보통 필요 없음)
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step == 'phone') {
      setDisabled(phone.length < 6)
    } else if (step == 'code') {
      setDisabled(code.length !== 6)
    }
  }, [phone, step, code])

  const handleOnClick = async () => {
    if (step === 'phone') {
      const res = await sendVerificationSMS({phone, countryCode, isNew: false})
      if ('ttl' in res) {
        flushSync(() => {
          setStep('code');
          setCode('');
        });
        codeRef?.current?.focus();
      } else if ('message' in res && res.message) {
        const title = await translate('send_code_fail_title')
        const dialog = await createDialog({id: 'Simple', message: res.message, title});
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }

    } else if (step === 'code') {
      if (isFromLogin) {
        const res = await checkVerificationCodeAction({code, phone, countryCode})
        if ('accessToken' in res && res.accessToken) {
          await loginSuccessAction({
            accessToken: res.accessToken,
            userId: res.user.id,
          })
          await LoginAuthNavigation({status: res.user.status, window})
        } else {
          const resendDialog = await createDialog({
            id: 'Simple',
            message: await translate('certification_code_mismatch'),
            title: await translate('certification')
          })
          window.KloudEvent.showDialog(JSON.stringify(resendDialog))
        }
      } else {
        const res = await updateUserAction({ phone, countryCode, code })
        if ('success' in res && res.success) {
          const completeDialog = await createDialog({
            id: 'CertificationComplete',
            message: await translate('certification_success_message'),
          })
          window.KloudEvent.showDialog(JSON.stringify(completeDialog))
        }
      }
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id == 'Simple') {
        await kloudNav.navigateMain({
          route: KloudScreen.MyAccount
        })
      }
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
      <div className={'pt-4'} onClick={handleOnClickBack}>
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
              locale={locale}
              ref={phoneRef}
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
              ref={codeRef}
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