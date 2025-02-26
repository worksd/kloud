'use client'

import { ChangeEvent } from "react";
import { KloudScreen } from "@/shared/kloud.screen";

export const AgreementForm = ({checkboxes, handleCheckboxChange}: {
  checkboxes: {
    terms: boolean,
    privacy: boolean,
    all: boolean,
  }, handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void
}) => {

  const onClickTerms = () => {
    window.KloudEvent?.push(KloudScreen.Terms)
  }

  const onClickPrivacy = () => {
    window.KloudEvent?.push(KloudScreen.Privacy)
  }


  return (
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
  )
}

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