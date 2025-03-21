'use client';
import React, { ChangeEvent, useEffect, useState } from "react";
import { AgreementForm } from "@/app/onboarding/AgreementForm";
import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import { FavoriteStudioForm } from "@/app/onboarding/FavoriteStudioForm";
import { CommonSubmitButton } from "@/app/components/buttons";
import ArrowLeftIcon from "../../../public/assets/left-arrow.svg";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { UserStatus } from "@/entities/user/user.status";
import { checkDuplicateNickName } from "@/app/onboarding/action/check.duplicate.nickname.action";
import { followStudio } from "@/app/search/studio.follow.action";
import { useLocale } from "@/hooks/useLocale";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";

type Step = 'profile' | 'favorite' | 'agreement';

export const OnboardForm = () => {
  const { t } = useLocale();
  const [step, setStep] = useState<Step>('profile');
  const [user, setUser] = useState<GetUserResponse | null>(null);
  const [studios, setStudios] = useState<GetStudioResponse[]>([]);
  const [selectedIdList, setSelectedIdList] = useState<number[]>([]);
  const [nickName, setNickName] = useState<string | undefined>(undefined);
  const [inputErrorMessage, setInputErrorMessage] = useState<string | null>(null);

  const [allChecked, setAllChecked] = useState(false); // 모든 체크박스 체크 상태
  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    privacy: false,
    all: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const headerTitle = {
    'profile' : t('onboarding_profile'),
    'favorite': t('onboarding_favorite_studio'),
    'agreement' : t('onboarding_agreement'),
  };

  const isNextButtonDisabled = () => {
    switch (step) {
      case 'profile':
        return !nickName || nickName.length === 0;
      case 'favorite':
        return false;
      case 'agreement':
        return !allChecked; // allCheckboxes 상태 추가 필요
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


  useEffect(() => {
    const fetchStudios = async () => {
      if (studios.length !== 0) return
      try {
        const res = await getStudioList({});
        if (res.studios) {
          setStudios(res.studios);
        }
      } catch (error){

      }
    };

    fetchStudios();
  }, [studios]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserAction()
        if (res && 'id' in res) {
          setUser(res);
          setNickName(res.name || '');
        }
      } catch (e) {

      }
    }
    fetchUser();
  }, [])

  const hideKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleNickNameChanged = (value: string) => {
    setNickName(value)
    setInputErrorMessage(null)
  }

  const handleSelectFavoriteStudio = (id: number) => {
    setSelectedIdList(currentIds => {
      const isSelected = currentIds.includes(id);
      return isSelected
        ? currentIds.filter(selectedId => selectedId !== id)
        : [...currentIds, id];
    });
  };

  const onClickButton = async () => {
    hideKeyboard()
    if (step === "profile") {
      const res = await checkDuplicateNickName({nickName: nickName ?? ''})
      if ('success' in res) {
        if (res.success) {
          setStep("favorite")
        } else {
          setInputErrorMessage(t('duplicate_nick_name_message'))
        }
      } else {}
    } else if (step === "favorite") {
      setStep("agreement")
    } else if (step === "agreement") {
      setIsLoading(true); // 로딩 시작

      try {
        for (const id of selectedIdList) {
          await followStudio({ studioId: id });
        }
        const res = await updateUserAction({
          nickName: nickName,
        });

        if (res.success && res.user?.status == UserStatus.Ready) {
          const bootInfo = JSON.stringify({
            bottomMenuList: await getBottomMenuList(),
            route: '',
            withFcmToken: true,
          });
          window.KloudEvent?.navigateMain(bootInfo);
        }
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    }
  }

  const onClickBack = () => {
    if (step === "profile") {
      window.KloudEvent?.clearAndPush(KloudScreen.Login)
    } else if (step === "favorite") {
      setStep("profile")
    } else if (step === "agreement") {
      setStep("favorite")
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
              nickName={nickName || ''}
              profileImageUrl={user?.profileImageUrl ?? ''}
              inputErrorMessage={inputErrorMessage}
              onNickNameChanged={handleNickNameChanged}
            />
          )}
          {step === 'favorite' && (
            <FavoriteStudioForm
              studios={studios}
              selectedIdList={selectedIdList}
              onSelectStudioAction={handleSelectFavoriteStudio}
            />
          )}
          {step === 'agreement' && (
            <AgreementForm
              checkboxes={checkboxes}
              handleCheckboxChangeAction={handleCheckboxChange}
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
          {t('next')}
        </CommonSubmitButton>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center">
            {/* 스피너 */}
            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold text-black">
              {t('welcome_title')}<br/>
              {t('welcome_message')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};