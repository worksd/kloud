'use client';
import React, { ChangeEvent, useEffect, useState } from "react";
import { onboardAction } from "@/app/onboarding/onboard.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBottomMenuList } from "@/utils";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export const OnboardForm = () => {
  const [name, setName] = useState(""); // 이름 상태 관리
  const [isNameSubmitted, setIsNameSubmitted] = useState(false); // 이름 제출 상태 관리
  const [allChecked, setAllChecked] = useState(false); // 모든 체크박스 체크 상태
  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    privacy: false,
    all: false,
  });

  const handleNameSubmit = () => {
    if (name.trim() === "") {
      alert("이름을 입력해주세요.");
      return;
    }
    setIsNameSubmitted(true); // 이름 제출 완료
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

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

  const onClickTerms = () => {
    window.KloudEvent?.push(KloudScreen.Terms)
  }

  const onClickPrivacy = () => {
    window.KloudEvent?.push(KloudScreen.Privacy)
  }

  const onClickCompleteOnboard = async () => {
    if (!isNameSubmitted) {
      handleNameSubmit()
      return
    }

    const res = await onboardAction({ name })
    if (res.success) {
      const bootInfo = JSON.stringify({
        bottomMenuList: getBottomMenuList(),
        route: '',
      });
      console.log('bootInfo = ' + bootInfo);
      window.KloudEvent?.navigateMain(bootInfo)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="가입하기"/>
      </div>
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-1 mb-2">
          <label className="text-[14px] font-medium text-black">이름</label>
          <span className="text-[10px] font-normal text-[#E55B5B]">필수</span>
        </div>
        <input
          className="text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md mb-2 p-4"
          id="name"
          name="name"
          onChange={onNameChange}
          value={name}
          placeholder='이름(본명)을 입력해주세요'
        />
      </div>

      {/* 약관 동의 부분: 이름 제출 후 렌더링 */}
      {isNameSubmitted && (
        <div className="p-6">
          <header className="flex items-center gap-2">
            <h1 className="text-lg text-black font-semibold text-[24px]">서비스를 위해 동의해 주세요!</h1>
          </header>

          <main className="flex-1 space-y-4 mt-12">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-lg text-black font-bold">모두 동의하기</span>
              <input
                type="checkbox"
                name="all"
                checked={checkboxes.all}
                onChange={handleCheckboxChange}
                className="w-5 h-5 accent-black"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-1 mb-1 mr-2">
                  <span className={`${checkboxes.terms ? 'text-black font-medium' : 'text-gray-300'}`}
                        onClick={onClickTerms}>[필수] 서비스 이용약관</span>
                  <RightArrow isChecked={checkboxes.terms}/>
                </div>
                <input
                  type="checkbox"
                  name="terms"
                  checked={checkboxes.terms}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 accent-black"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center gap-1 mb-1 mr-2">
                  <span className={`${checkboxes.privacy ? 'text-black font-medium' : 'text-gray-300'}`}
                        onClick={onClickPrivacy}>[필수] 개인정보 수집 및 이용동의</span>
                  <RightArrow isChecked={checkboxes.privacy}/>
                </div>
                <input
                  type="checkbox"
                  name="privacy"
                  checked={checkboxes.privacy}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 accent-black"
                />
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 다음으로 버튼 - 화면 맨 아래 고정 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white">
        <button
          onClick={onClickCompleteOnboard}
          disabled={
            (!isNameSubmitted && name.length < 2) ||
            (isNameSubmitted && (name.length < 2 || !checkboxes.all))
          }
          className={`flex items-center justify-center text-lg font-semibold rounded-lg h-14 shadow-lg w-full ${
            (!isNameSubmitted && name.length < 2) ||
            (isNameSubmitted && (name.length < 2 || !checkboxes.all))
              ? "bg-[#BCBFC2] text-white"
              : "bg-black text-white"
          }`}
        >
          다음으로
        </button>
      </div>
    </div>
  );
};

const RightArrow = ({isChecked}: { isChecked: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke={isChecked ? "#000000" : "#BCBFC2"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);