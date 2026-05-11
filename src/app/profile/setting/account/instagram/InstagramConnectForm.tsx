'use client'

import React, { useMemo, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { CommonSubmitButton } from "@/app/components/buttons";
import { verifyInstagramAction } from "@/app/profile/setting/account/instagram/verify.instagram.action";

const INSTAGRAM_USERNAME = 'rawgraphy.inc';
const INSTAGRAM_DM_UNIVERSAL_LINK = `https://ig.me/m/${INSTAGRAM_USERNAME}`;

type Step = 1 | 2 | 3;

type Props = {
  locale: Locale;
  name: string;
  phone?: string;
  email?: string;
};

const buildMessage = ({ name, phone, email }: { name: string; phone?: string; email?: string }) => {
  const parts: string[] = [];
  if (phone) parts.push(phone);
  if (email) parts.push(email);
  const contact = parts.join(' 또는 ');
  return `안녕하세요 댄서 ${name}입니다. ${contact} 계정과의 Rawgraphy 연동을 원합니다.`;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    /* fallback below */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch {}
  document.body.removeChild(ta);
};

const StepIndicator = ({ current }: { current: Step }) => (
  <div className={'flex items-center justify-center gap-2 py-4'}>
    {[1, 2, 3].map((n) => {
      const active = n <= current;
      return (
        <React.Fragment key={n}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
              active ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {n}
          </div>
          {n < 3 && (
            <div className={`h-[2px] w-8 ${n < current ? 'bg-black' : 'bg-gray-200'}`}/>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export const InstagramConnectForm = ({ locale, name, phone, email }: Props) => {
  const [step, setStep] = useState<Step>(1);
  const [toast, setToast] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const hasContact = Boolean(phone || email);
  const message = useMemo(
    () => buildMessage({ name, phone, email }),
    [name, phone, email],
  );

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 3000);
  };

  const onCopy = async () => {
    if (!hasContact) return;
    await copyToClipboard(message);
    showToast(getLocaleString({ locale, key: 'instagram_connect_copied' }));
    setStep(2);
  };

  const onOpenInstagram = () => {
    if (window.KloudEvent) {
      window.KloudEvent.openExternalBrowser(INSTAGRAM_DM_UNIVERSAL_LINK);
    } else {
      window.open(INSTAGRAM_DM_UNIVERSAL_LINK, '_blank');
    }
    setStep(3);
  };

  const onAlreadySent = () => setStep(3);

  const onVerify = async () => {
    setVerifyMessage('');
    setIsVerifying(true);
    try {
      const res = await verifyInstagramAction();
      if (res.status === 'connected') {
        setIsConnected(true);
        setVerifyMessage(getLocaleString({ locale, key: 'instagram_verify_success' }));
      } else if (res.status === 'pending') {
        setVerifyMessage(getLocaleString({ locale, key: 'instagram_verify_pending' }));
      } else {
        setVerifyMessage(res.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={'flex flex-col flex-1 px-6 pb-32'}>
      <StepIndicator current={step}/>

      {/* Step 1 */}
      {step === 1 && (
        <div className={'mt-2 flex flex-col'}>
          <div className={'text-[16px] font-semibold text-black'}>
            {getLocaleString({ locale, key: 'instagram_step1_title' })}
          </div>
          <p className={'mt-2 text-[13px] text-[#5C5C5C] whitespace-pre-line leading-5'}>
            {getLocaleString({ locale, key: 'instagram_connect_description' })}
          </p>

          <div className={'mt-5 rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-4 text-[14px] text-black whitespace-pre-line leading-6'}>
            {hasContact
              ? message
              : getLocaleString({ locale, key: 'instagram_connect_no_contact' })}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className={'mt-2 flex flex-col'}>
          <div className={'text-[16px] font-semibold text-black'}>
            {getLocaleString({ locale, key: 'instagram_step2_title' })}
          </div>
          <p className={'mt-2 text-[13px] text-[#5C5C5C] whitespace-pre-line leading-5'}>
            {getLocaleString({ locale, key: 'instagram_step2_desc' })}
          </p>

          <div className={'mt-5 rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-4 text-[14px] text-black whitespace-pre-line leading-6'}>
            {message}
          </div>

          <button
            type={'button'}
            onClick={onAlreadySent}
            className={'mt-4 self-end text-[13px] text-[#5C5C5C] underline'}
          >
            {getLocaleString({ locale, key: 'instagram_step2_already_sent' })}
          </button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className={'mt-2 flex flex-col'}>
          <div className={'text-[16px] font-semibold text-black'}>
            {getLocaleString({ locale, key: 'instagram_step3_title' })}
          </div>
          <p className={'mt-2 text-[13px] text-[#5C5C5C] whitespace-pre-line leading-5'}>
            {getLocaleString({ locale, key: 'instagram_step3_desc' })}
          </p>

          {verifyMessage && (
            <div
              className={`mt-5 rounded-[12px] p-4 text-[13px] whitespace-pre-line leading-5 ${
                isConnected ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF4E5] text-[#A05A00]'
              }`}
            >
              {verifyMessage}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className={'fixed left-1/2 -translate-x-1/2 bottom-28 z-20 max-w-[90%] rounded-[12px] bg-black/85 px-4 py-3 text-center text-[13px] text-white whitespace-pre-line leading-5'}>
          {toast}
        </div>
      )}

      <div className={'fixed bottom-4 left-0 right-0 px-6 flex flex-col gap-2'}>
        {step > 1 && !isConnected && (
          <button
            type={'button'}
            onClick={() => setStep((step - 1) as Step)}
            className={'w-full p-3 text-[14px] text-[#5C5C5C]'}
          >
            {getLocaleString({ locale, key: 'instagram_step_prev' })}
          </button>
        )}

        {step === 1 && (
          <CommonSubmitButton
            originProps={{ onClick: onCopy }}
            disabled={!hasContact}
          >
            <span className={'text-white'}>
              {getLocaleString({ locale, key: 'instagram_step1_cta' })}
            </span>
          </CommonSubmitButton>
        )}

        {step === 2 && (
          <CommonSubmitButton originProps={{ onClick: onOpenInstagram }}>
            <span className={'text-white'}>
              {getLocaleString({ locale, key: 'instagram_step2_cta' })}
            </span>
          </CommonSubmitButton>
        )}

        {step === 3 && !isConnected && (
          <CommonSubmitButton
            originProps={{ onClick: onVerify }}
            isLoading={isVerifying}
            disabled={isVerifying}
          >
            <span className={'text-white'}>
              {getLocaleString({ locale, key: 'instagram_step3_cta' })}
            </span>
          </CommonSubmitButton>
        )}
      </div>
    </div>
  );
};
