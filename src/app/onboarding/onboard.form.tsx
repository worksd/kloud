'use client';
import React, { ChangeEvent, useEffect, useState } from "react";
import { AgreementForm } from "@/app/onboarding/AgreementForm";
import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import { CommonSubmitButton } from "@/app/components/buttons";
import ArrowLeftIcon from "../../../public/assets/left-arrow.svg";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { UserStatus } from "@/entities/user/user.status";
import { checkDuplicateNickName } from "@/app/onboarding/action/check.duplicate.nickname.action";
import { useLocale } from "@/hooks/useLocale";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { useRouter } from "next/navigation";
import { TranslatableText } from "@/utils/TranslatableText";
import { OnboardCertification } from "@/app/onboarding/OnboardCertification";
import { CertificationPage } from "@/app/certification/CertificationForm";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import Image from "next/image";

type Step = 'profile' | 'agreement' | 'certification';

const DELAY_TIME = 2000

export const OnboardForm = ({user, studios, appVersion, returnUrl}: {
  user: GetUserResponse,
  studios: GetStudioResponse[],
  appVersion: string,
  returnUrl: string
}) => {
  const {t} = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');
  const [nickName, setNickName] = useState<string | undefined>(user.nickName);
  const [inputErrorMessage, setInputErrorMessage] = useState<string | null>(null);

  const [allChecked, setAllChecked] = useState(false); // 모든 체크박스 체크 상태
  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    privacy: false,
    all: false,
  });

  const [certificationPage, setCertificationPage] = useState<CertificationPage>('certification');
  const [code, setCode] = useState(0);
  const [myCode, setMyCode] = useState("");
  const [name, setName] = useState('');
  const [rrn, setRrn] = useState('');
  const [phone, setPhone] = useState('');
  const isCertificationFormValid = !name || rrn.length < 7 || phone.length < 13 || myCode.length < 6;

  /**
   * For Foreigner
   */
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const headerTitle = {
    'profile': t('onboarding_profile'),
    'certification': t('do_certification'),
    'agreement': t('onboarding_agreement'),
  };

  const isNextButtonDisabled = () => {
    switch (step) {
      case 'profile':
        return !nickName || nickName.length === 0;
      case 'agreement':
        return !allChecked;
      case 'certification':
        return certificationPage == 'certification' ? isCertificationFormValid : birthDate == '' || gender == '' || country == '';
      default:
        return false;
    }
  };

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

  const hideKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const onClickSkip = async () => {
    const dialog = await createDialog('SkipCertification')
    window.KloudEvent.showDialog(JSON.stringify(dialog));
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {

      if (data.id == 'SkipCertification') {
        setIsLoading(true);
        setTimeout(async () => {
          const res = await updateUserAction({
            nickName: nickName,
          });


          if (res.success && res.user?.status == UserStatus.Ready) {
            if (appVersion == '') {
              router.replace(returnUrl)
            } else {
              const bootInfo = JSON.stringify({
                bottomMenuList: await getBottomMenuList(),
                route: '',
                withFcmToken: true,
              });
              window.KloudEvent?.navigateMain(bootInfo);
            }
          }
        }, DELAY_TIME)
      }
      else if (data.id == 'ForeignerVerificationRequest') {
        await onClickForeignVerification()
      }
    }
  })

  const handleNickNameChanged = (value: string) => {
    setNickName(value)
    setInputErrorMessage(null)
  }

  const onClickButton = async () => {
    hideKeyboard()
    if (step === "profile") {
      const res = await checkDuplicateNickName({nickName: nickName ?? ''})
      if ('success' in res) {
        if (res.success) {
          setStep("agreement")
        } else {
          setInputErrorMessage(t('duplicate_nick_name_message'))
        }
      } else {
      }
    } else if (step === 'agreement') {
      setStep('certification')
    } else if (step === "certification") {

      if (certificationPage == 'certification') {
        if (code.toString() != myCode) {
          const dialogInfo = await createDialog('CertificationFail')
          window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
          return
        }
        setIsLoading(true); // 로딩 시작

        setTimeout(async () => {
          try {
            const res = await updateUserAction({
              nickName: nickName,
              phone: phone,
              name: name,
              rrn: rrn,
            });

            if (res.success && res.user?.status == UserStatus.Ready) {
              if (appVersion == '') {
                router.replace(returnUrl)
              } else {
                const bootInfo = JSON.stringify({
                  bottomMenuList: await getBottomMenuList(),
                  route: '',
                  withFcmToken: true,
                });
                window.KloudEvent?.navigateMain(bootInfo);
              }
            }
          } finally {
            setIsLoading(false); // 로딩 종료
          }
        }, DELAY_TIME)
      }
      else if (certificationPage == 'foreigner') {
        await showCertificationDialog()
      }
    }
  }

  const onClickBack = () => {
    if (step === "profile") {
      if (appVersion == '') {
        router.replace(KloudScreen.Login(returnUrl))
      } else {
        window.KloudEvent?.clearAndPush(KloudScreen.Login(returnUrl))
      }
    } else if (step === "agreement") {
      setStep("profile")
    } else if (step === 'certification') {
      if (certificationPage == 'foreigner') {
        setCertificationPage('certification')
      } else if (certificationPage == 'certification') {
        setStep('agreement')
      }
    }
  }

  const showCertificationDialog = async () => {
    if (appVersion === '') {
      await onClickForeignVerification();
      return;
    }

    const confirmationDialogText = ({
                                      birthDate,
                                      email,
                                      country,
                                      gender,
                                      name,
                                    }: {
      birthDate: string;
      email: string;
      country: string;
      gender: string;
      name: string;
    }): string => {
      const genderText = gender === 'M' ? 'Male' : 'Female';

      return `
🤔 Are you ready to verify yourself?

Please confirm that the following information is correct:

- Name: ${name}
- Birthday: ${birthDate}
- Email: ${email}
- Country: ${country}
- Gender: ${genderText}

If everything looks good, tap the [Confirm] button below to complete your verification.
⚠️ If the information is inaccurate, access to the service may be restricted.
`.trim();
    };

    const message = confirmationDialogText({ birthDate, email: user.email, country, gender, name });
    const dialog = await createDialog('ForeignerVerificationRequest', message);

    window.KloudEvent.showDialog(JSON.stringify(dialog));
  };


  const onClickForeignVerification = async () => {
    const [year, month, day] = birthDate.split('-'); // ['1999', '05', '13']
    const yy = year.slice(-2); // '99'
    const genderCode = (() => {
      const y = parseInt(year, 10);
      if (y >= 2000) return gender === 'M' ? '3' : '4';
      if (y >= 1900) return gender === 'M' ? '1' : '2';
      return gender === 'M' ? '9' : '0'; // 1800년대 fallback
    })();

    const rrn = `${yy}${month}${day}${genderCode}`;
    const res = await updateUserAction({
      rrn,
      country,
      name,
      emailVerified: true,
    })
    if (res.success && res.user?.emailVerified == true) {
      const bottomMenuList = await getBottomMenuList();
      const bootInfo = JSON.stringify({
        bottomMenuList: bottomMenuList,
        route: '',
      });
      window.KloudEvent?.navigateMain(bootInfo);
    }
  }

  return (
    <div className="relative h-screen bg-white overflow-hidden">
      {/* TopBar - fixed position */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10">
        <div className="flex h-14 justify-center items-center">
          <div className="absolute left-4">
            <button className="flex items-center justify-center text-black rounded-full" onClick={onClickBack}>
              <ArrowLeftIcon className="w-6 h-6"/>
            </button>
          </div>
          <span className="text-[16px] font-bold text-black">{headerTitle[step]}</span>
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 컨테이너 */}
      <div className="absolute inset-0 mt-14 mb-[72px] overflow-y-auto">
        <div className="flex-1">
          {step === 'profile' && (
            <ProfileEditForm
              isOnboarding={true}
              nickName={nickName || ''}
              profileImageUrl={user?.profileImageUrl ?? ''}
              inputErrorMessage={inputErrorMessage}
              onNickNameChanged={handleNickNameChanged}
            />
          )}
          {step === 'agreement' && (
            <AgreementForm
              checkboxes={checkboxes}
              handleCheckboxChangeAction={handleCheckboxChange}
            />
          )}
          {step == 'certification' && (
            <OnboardCertification
              appVersion={appVersion}
              user={user}
              page={certificationPage}
              name={name}
              rrn={rrn}
              phone={phone}
              birthDate={birthDate}
              gender={gender}
              country={country}
              setNameAction={setName}
              setPhoneAction={setPhone}
              setRrnAction={setRrn}
              setPageAction={setCertificationPage}
              setCodeAction={setCode}
              setMyCodeAction={setMyCode}
              setBirthDateAction={setBirthDate}
              setGenderAction={setGender}
              setCountryAction={setCountry}
              code={code}
              myCode={myCode}
            />
          )}
        </div>
      </div>

      {/* 하단 버튼 - fixed position */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4">
        <CommonSubmitButton
          originProps={{
            onClick: onClickButton,
            disabled: isNextButtonDisabled()
          }}
        >
          {step == 'certification' ? t('confirm') : t('next')}
        </CommonSubmitButton>
        {step == 'certification' &&
          <TranslatableText
            titleResource={'skip'}
            className={'flex justify-center text-[#787878] mt-3'}
            onClick={onClickSkip}
          />
        }
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center mx-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 mb-3">
              <Image
                src={user.profileImageUrl ?? ''}
                alt="studio logo"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={'flex flex-row text-[20px] font-bold text-black'}>
              <div>{nickName}</div>
              <TranslatableText titleResource={'welcome_title'}/>
            </div>

            <TranslatableText className="text-[14px] font-medium text-black text-center"
                              titleResource={'welcome_message'}/>
          </div>
        </div>
      )}
    </div>
  );
};