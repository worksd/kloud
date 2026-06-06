'use client';

import { ChangeEvent } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const AgreementForm = ({checkboxes, handleCheckboxChangeAction, locale}: {
  checkboxes: {
    terms: boolean,
    privacy: boolean,
    marketing: boolean,
    all: boolean,
  }, handleCheckboxChangeAction: (e: ChangeEvent<HTMLInputElement>) => void,
  locale: Locale,
}) => {

  return (
    <div className="py-6">

      <main className="flex-1 space-y-4 mt-12">
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-lg text-black font-bold">{getLocaleString({locale, key: 'all_agreement'})}</span>
          <input
            type="checkbox"
            name="all"
            checked={checkboxes.all}
            onChange={handleCheckboxChangeAction}
            className="w-5 h-5 accent-black"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <NavigateClickWrapper method={'push'} route={KloudScreen.Terms}>
              <div className="flex flex-row items-center gap-1 mb-1 mr-2">
                <span className={`${checkboxes.terms ? 'text-black font-medium' : 'text-gray-300'}`}>
                  {getLocaleString({locale, key: 'service_terms_agreement_required'})}
                </span>
                <RightArrow isChecked={checkboxes.terms}/>
              </div>
            </NavigateClickWrapper>
            <input
              type="checkbox"
              name="terms"
              checked={checkboxes.terms}
              onChange={handleCheckboxChangeAction}
              className="w-5 h-5 accent-black"
            />
          </div>

          <div className="flex items-center justify-between">
            <NavigateClickWrapper method={'push'} route={KloudScreen.Privacy}>
              <div className="flex flex-row items-center gap-1 mb-1 mr-2">
                <span className={`${checkboxes.privacy ? 'text-black font-medium' : 'text-gray-300'}`}>
                  {getLocaleString({locale, key: 'service_privacy_agreement_required'})}
                </span>
                <RightArrow isChecked={checkboxes.privacy}/>
              </div>
            </NavigateClickWrapper>
            <input
              type="checkbox"
              name="privacy"
              checked={checkboxes.privacy}
              onChange={handleCheckboxChangeAction}
              className="w-5 h-5 accent-black"
            />
          </div>

          {/* 광고성 정보 수신 동의 — 선택 항목, 진행 차단 안 함 */}
          <div className="flex items-center justify-between">
            <NavigateClickWrapper method={'push'} route={KloudScreen.MarketingAgreement}>
              <div className="flex flex-row items-center gap-1 mb-1 mr-2">
                <span className={`${checkboxes.marketing ? 'text-black font-medium' : 'text-gray-300'}`}>
                  {getLocaleString({locale, key: 'marketing_agreement_optional'})}
                </span>
                <RightArrow isChecked={checkboxes.marketing}/>
              </div>
            </NavigateClickWrapper>
            <input
              type="checkbox"
              name="marketing"
              checked={checkboxes.marketing}
              onChange={handleCheckboxChangeAction}
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
