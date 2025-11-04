'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import BackIcon from "../../../public/assets/ic_back.svg";
import CommonSubmitButton from "../components/buttons/CommonSubmitButton";
import { CommonLoginInputBox } from "@/app/components/InputBox";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { PhoneVerificationStepConfig } from "@/app/login/phone/PhoneVerificationForm";
import { PhoneVerification } from "@/app/components/PhoneVerification";
import { VerificationCodeForm } from "@/app/login/phone/VerificationCodeForm";
import { flushSync } from "react-dom";
import { AgreementForm } from "@/app/onboarding/ServiceAgreementForm";
import { kloudNav } from "@/app/lib/kloudNav";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { GenderBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { KloudScreen } from "@/shared/kloud.screen";
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import { checkVerificationCodeAction } from "@/app/login/phone/check.verification.code.action";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import CircleCloseIcon from "@/../public/assets/ic_circle_check.svg"
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { translate } from "@/utils/translate";
import { checkDuplicateUser } from "@/app/onboarding/action/check.duplicate.nickname.action";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";

const EASE = [0.16, 1, 0.3, 1] as const;

const onlyDigits = (s = '') => s.replace(/\D/g, '').slice(0, 8);
const birthDigitsLenOk = (s: string) => onlyDigits(s).length === 8;


const formatBirthDisplay = (digits: string) => {
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  if (digits.length <= 4) return y;
  if (digits.length <= 6) return `${y}.${m}`;
  return `${y}.${m}.${d}`;
};

// 더 샤르르: y 이동폭↑ + scale + blur
const fadeUp = {
  initial: {opacity: 0, y: 24, scale: 0.98, filter: 'blur(2px)'},
  animate: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: {duration: 0.42, ease: EASE}
  },
  exit: {
    opacity: 0, y: -10, scale: 0.995, filter: 'blur(1px)',
    transition: {duration: 0.20, ease: EASE}
  },
} as const;

type OnboardStep = 'onboard' | 'phone' | 'code' | 'agreement' | 'complete';

export const OnboardingForm = ({
                                 user,
                                 inputNameMessage,
                                 inputBirthMessage,
                                 inputGenderMessage,
                                 inputNickNameMessage,
                                 agreementMessage,
                                 confirmText,
                                 phoneVerificationSteps,
                                 failSignUpText,
                                 locale
                               }: {
  user: GetUserResponse,
  inputNameMessage: string,
  inputBirthMessage: string,
  inputGenderMessage: string,
  inputNickNameMessage: string,
  confirmText: string,
  agreementMessage: string,
  failSignUpText: string,
  phoneVerificationSteps: PhoneVerificationStepConfig[],
  locale: Locale,
}) => {
  const [isNameInputVisible, setIsNameInputVisible] = useState(true);
  const [isBirthInputVisible, setIsBirthInputVisible] = useState(false);
  const [isGenderInputVisible, setIsGenderInputVisible] = useState(false);
  const [isNickNameInputVisible, setIsNickNameInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [nickName, setNickName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('KR');
  const [code, setCode] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const birthRef = useRef<HTMLInputElement>(null);
  const nickRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<OnboardStep>('onboard');

  const [allChecked, setAllChecked] = useState(false); // 모든 체크박스 체크 상태
  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    privacy: false,
    all: false,
  });
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = e.target;
    const updatedCheckboxes = {
      ...checkboxes,
      [name]: checked,
    };
    if (name === 'all') {
      updatedCheckboxes.terms = checked;
      updatedCheckboxes.privacy = checked;
    }
    updatedCheckboxes.all =
      updatedCheckboxes.terms && updatedCheckboxes.privacy;
    setCheckboxes(updatedCheckboxes);
    setAllChecked(updatedCheckboxes.terms && updatedCheckboxes.privacy);
  };

  const sendSmsCode = async () => {
    const res = await sendVerificationSMS({phone, countryCode})
    if ('ttl' in res) {
      flushSync(() => {
        setStep('code');
        setCode('');
      });
      focusField('code')
    } else if ('message' in res && res.message) {
      const dialog = await createDialog({id: 'Simple', message: res.message});
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    }
  }

  const handleOnClick = async () => {
    if (step == 'complete') {
      await kloudNav.navigateMain({})
    } else if (step == 'agreement') {
      setStep('complete')
    } else if (step == 'code') {
      const res = await updateUserAction({ phone, countryCode, code })
      if ('success' in res && res.success) {
        setStep('agreement')
      }
    } else if (step == 'phone') {
      const errorTitle = await translate('send_code_fail_title')
      const duplicateCheck = await checkDuplicateUser({phone})
      if ('success' in duplicateCheck && duplicateCheck.success) {
        await sendSmsCode()
      } else if ('message' in duplicateCheck) {
        if (duplicateCheck.code == ExceptionResponseCode.PHONE_TYPE_USER_EXISTS) {
          const dialog = await createDialog({id: 'Simple', message: duplicateCheck.message, title: errorTitle});
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        } else if (duplicateCheck.code == ExceptionResponseCode.PHONE_ALREADY_EXISTS) {
          const dialog = await createDialog({id: 'ChangePhoneNumber'})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      }
    } else if (isNickNameInputVisible) {
      const res = await updateUserAction({
        name,
        nickName,
        birth,
        gender
      })
      if (user.loginType === 'Phone' || user.phone) {
        if ('success' in res && res.success) {
          setStep('agreement');
        } else if ('errorMessage' in res && res.errorMessage) {
          const dialog = await createDialog({id: 'Simple', message: res.errorMessage});
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      } else {
        if ('success' in res && res.success) {
          flushSync(() => {
            setStep('phone');
          });
          focusField('phone')
        } else if ('errorMessage' in res && res.errorMessage) {
          const dialog = await createDialog({id: 'Simple', message: res.errorMessage, title: failSignUpText});
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }

      }
    } else if (isGenderInputVisible) {
      flushSync(() => {
        setIsNickNameInputVisible(true);
      });
      focusField('nickname');
    } else if (isBirthInputVisible) {
      flushSync(() => {
        setIsGenderInputVisible(true);
      });
      focusField('gender');
    } else if (isNameInputVisible) {
      flushSync(() => {
        setIsBirthInputVisible(true);
      });
      focusField('birth');
    }
  };

  const currentOnboardField: 'nickname' | 'gender' | 'birth' | 'name' =
    isNickNameInputVisible ? 'nickname' :
      isGenderInputVisible ? 'gender' :
        isBirthInputVisible ? 'birth' : 'name';

  const message = useMemo(() => {
    if (step === 'onboard') {
      switch (currentOnboardField) {
        case 'name':
          return inputNameMessage;
        case 'birth':
          return inputBirthMessage;
        case 'gender':
          return inputGenderMessage;
        case 'nickname':
          return inputNickNameMessage;
      }
    }
    if (step === 'phone') {
      return phoneVerificationSteps.find(v => v.id === 'phone')?.message ?? '';
    }
    if (step === 'code') {
      return phoneVerificationSteps.find(v => v.id === 'code')?.message ?? '';
    }
    if (step === 'agreement') {
      return agreementMessage;
    }
    if (step === 'complete') {
      return getLocaleString({
        locale,
        key: 'sign_up_complete_message_1'
      }) + '\n' + (name ?? nickName) + getLocaleString({locale, key: 'sign_up_complete_message_2'}) + '\n';
    }
    return '';
  }, [
    step,
    currentOnboardField,
    inputNameMessage,
    inputBirthMessage,
    inputGenderMessage,
    inputNickNameMessage,
    phoneVerificationSteps,
  ]);

  const handleOnClickBack = () => {
    if (step == 'phone') {
      setStep('onboard')
    } else if (step == 'code') {
      setStep('phone')
    } else if (step == 'agreement') {
      if (user.loginType == 'Phone' || user.phone) {
        setStep('onboard')
      } else {
        setStep('phone')
      }
    } else if (step == 'complete') {
      setStep('agreement')
    } else if (step == 'onboard') {
      kloudNav.clearAndPush(KloudScreen.Login(''))
    }
  };


  const focusField = (key: 'name' | 'birth' | 'gender' | 'nickname' | 'code' | 'phone') => {
    const map = {
      name: nameRef,
      birth: birthRef,
      gender: null,
      nickname: nickRef,
      code: codeRef,
      phone: phoneRef
    } as const;
    map[key]?.current?.focus({preventScroll: true});
  };

  useEffect(() => {
    if (step !== 'onboard') return;
    const target =
      currentOnboardField === 'name' ? nameRef.current :
        currentOnboardField === 'birth' ? birthRef.current :
          currentOnboardField === 'nickname' ? nickRef.current : null;

    if (target) {
      const id = requestAnimationFrame(() => target.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [step, currentOnboardField]);

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id == 'ChangePhoneNumber') {
        await sendSmsCode()
      }

    }
  }, [phone, countryCode, sendSmsCode])


  const disabled = useMemo(() => {
    if (step === 'onboard') {
      switch (currentOnboardField) {
        case 'nickname':
          return nickName.trim().length === 0;
        case 'gender'  :
          return gender === '';
        case 'birth'   :
          return !birthDigitsLenOk(birth); // YYYYMMDD 8자리
        case 'name'    :
          return name.trim().length < 2;
      }
    }
    if (step === 'phone') {
      return onlyDigits(phone).length < 6;
    }
    if (step === 'code') {
      return onlyDigits(code).length < 6; // 6자리 코드
    }
    if (step === 'agreement') {
      return !allChecked;
    }
    return false;
  }, [step, currentOnboardField, nickName, gender, birth, name, phone, code, allChecked]);

  const [genderSheetOpen, setGenderSheetOpen] = useState(false);

// 성별 표시 텍스트
  const genderLabel = gender === 'female' ? '여성' : gender === 'male' ? '남성' : '';

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white px-6">
        <div className="pt-16" onClick={handleOnClickBack}>
          <BackIcon/>
        </div>

        <div className="pt-16 pb-6">

          <div className="text-black font-bold text-[22px] whitespace-pre-line">
            {message}
          </div>

          {step == 'onboard' && (
            <div className="mt-9 space-y-6">
              <AnimatePresence>
                {isNickNameInputVisible && (
                  <motion.div key="nickname" {...fadeUp} layout>
                    <CommonLoginInputBox
                      ref={nickRef}
                      value={nickName}
                      handleChangeAction={(v: string) => setNickName(v)}
                      placeholder="닉네임"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isGenderInputVisible && (
                  <motion.div key="gender" {...fadeUp} layout>
                    <button
                      type="button"
                      onClick={() => setGenderSheetOpen(true)}
                      className={[
                        'w-full rounded-[20px] border border-gray-200 bg-white px-4 py-3 text-left',
                        'text-[17px] outline-none focus:ring-2 focus:ring-black/20 transition',
                      ].join(' ')}
                    >
                      {genderLabel ? (
                        <span className="text-black">{genderLabel}</span>
                      ) : (
                        <span className="text-[#8B95A1]">성별</span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isBirthInputVisible && (
                  <motion.div key="birth" {...fadeUp} layout>
                    <CommonLoginInputBox
                      ref={birthRef}
                      value={formatBirthDisplay(birth)}               // 표시용 포맷
                      handleChangeAction={(v: string) => setBirth(onlyDigits(v))} // 숫자만 저장
                      placeholder="yyyy.MM.dd"
                      inputMode={'numeric'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isNameInputVisible && (
                  <motion.div key="name" {...fadeUp} layout>
                    <CommonLoginInputBox
                      ref={nameRef}
                      value={name}
                      handleChangeAction={(v: string) => setName(v)}
                      placeholder="이름"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {step == 'complete' && (
            <div className="w-full flex justify-center mt-20">
              <CircleCloseIcon className="scale-75"/>
            </div>
          )}
          {step === 'phone' && (
            <div className="mt-9">
              <PhoneVerification
                locale={locale}
                ref={phoneRef}
                phone={phone}
                countryCode={countryCode}
                onChangeCountryCodeAction={(v: string) => setCountryCode(v)}
                onChangePhoneAction={(value: string) => {
                  setPhone(value);
                }}/>
              <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center">
                {/* 위쪽 경계 살짝 분리용 그라데이션 (옵션) */}
                <div className="pointer-events-none h-4 w-full bg-gradient-to-t from-white to-transparent"/>

                <button
                  type="button"
                  onClick={() => {
                    setStep('agreement')
                  }}
                  className={[
                    'mb-4 rounded-full px-5',
                    'h-11 min-h-[44px]', // 모바일 터치 타깃 확보
                    'text-sm font-medium',
                    disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-black active:opacity-80',
                  ].join(' ')}
                >
                  나중에 하기
                </button>
              </div>
            </div>
          )}
          {step === 'code' && (
            <div className="mt-9">
              <VerificationCodeForm
                ref={codeRef}
                placeholder={phoneVerificationSteps.find((value) => value.id == 'code')?.placeholder ?? ''}
                value={code}
                handleChangeAction={(value: string) => {
                  setCode(value)
                }}
              />
            </div>
          )}
          {step === 'agreement' && (
            <div className="mt-9">
              <AgreementForm checkboxes={checkboxes} handleCheckboxChangeAction={handleCheckboxChange}/>
            </div>
          )}


        </div>

        {/* 하단 고정 버튼 */}
        <div className="left-0 right-0 pb-6 bg-white/70">
          <CommonSubmitButton
            disabled={disabled}
            originProps={{onClick: handleOnClick}}
            isLoading={isLoading}
          >
            {confirmText}
          </CommonSubmitButton>
        </div>

        <GenderBottomSheet
          open={genderSheetOpen}
          value={gender as any}
          onCloseAction={() => setGenderSheetOpen(false)}
          onSelectAction={(g) => {
            setGender(g);
            setGenderSheetOpen(false);
          }}
        />
      </div>
    </MotionConfig>
  );
};
