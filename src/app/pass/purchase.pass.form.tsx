'use client'
import React, { useState } from "react";
import { PassSelectStudio } from "@/app/pass/PassSelectStudio";
import { PurchaseStudioPassForm } from "@/app/pass/PurchaseStudioPassForm";
import ArrowLeftIcon from "../../../public/assets/left-arrow.svg";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

type PassStep = 'studio' | 'purchase'

export const PurchasePassForm = () => {
  const [step, setStep] = useState<PassStep>('studio');
  const [studio, setStudio] = useState<GetStudioResponse | null>(null);

  const handleClickBack = () => {
    if (step == 'purchase') {
      setStep('studio');
    }
    else if (step == 'studio') {
      window.KloudEvent?.back()
    }
  }

  return (
    <div className="absolute inset-0 mt-14 overflow-y-auto no-scrollbar">
      <div className="fixed top-0 left-0 right-0 bg-white z-10">
        <div className="flex h-14 justify-center items-center">
          <div className="absolute left-6">
            <button className="flex items-center justify-center text-black rounded-full" onClick={() => {handleClickBack()}}>
              <ArrowLeftIcon className="w-6 h-6"/>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1">
        {step === 'studio' && (
          <PassSelectStudio onClickAction={(studio: GetStudioResponse) => {
            setStudio(studio)
            setStep('purchase')
          }}/>
        )}
        {step === 'purchase' && (
          <PurchaseStudioPassForm studio={studio} />
        )}
      </div>
    </div>
  )
}