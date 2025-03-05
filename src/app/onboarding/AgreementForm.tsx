'use client'

import { ChangeEvent } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { useLocale } from "@/hooks/useLocale";

export const AgreementForm = ({checkboxes, handleCheckboxChangeAction}: {
  checkboxes: {
    terms: boolean,
    privacy: boolean,
    all: boolean,
  }, handleCheckboxChangeAction: (e: ChangeEvent<HTMLInputElement>) => void
}) => {

  const { t } = useLocale()

  const onClickTerms = () => {
    window.KloudEvent?.push(KloudScreen.Terms)
  }

  const onClickPrivacy = () => {
    window.KloudEvent?.push(KloudScreen.Privacy)
  }


  return (
    <div className="p-6">
      <header className="flex items-center gap-2">
        <h1 className="text-lg text-black font-semibold text-[24px]">{t('agreement_message')}</h1>
      </header>

      <main className="flex-1 space-y-4 mt-12">
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-lg text-black font-bold">{t('all_agreement')}</span>
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
            <div className="flex flex-row items-center gap-1 mb-1 mr-2">
                  <span className={`${checkboxes.terms ? 'text-black font-medium' : 'text-gray-300'}`}
                        onClick={onClickTerms}>{t('service_terms_agreement_required')}</span>
              <RightArrow isChecked={checkboxes.terms}/>
            </div>
            <input
              type="checkbox"
              name="terms"
              checked={checkboxes.terms}
              onChange={handleCheckboxChangeAction}
              className="w-5 h-5 accent-black"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-row items-center gap-1 mb-1 mr-2">
                  <span className={`${checkboxes.privacy ? 'text-black font-medium' : 'text-gray-300'}`}
                        onClick={onClickPrivacy}>{t('service_privacy_agreement_required')}</span>
              <RightArrow isChecked={checkboxes.privacy}/>
            </div>
            <input
              type="checkbox"
              name="privacy"
              checked={checkboxes.privacy}
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