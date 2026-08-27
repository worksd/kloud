// 파트너십 신청 인트로 조각 — 인트로 라우트의 본문이자 폼 라우트(PC)의 좌측 열.
// 구성원 신청과 달리 "현황" 이 없다. 대신 이 신청이 전체 흐름의 어디인지(신청 → 승인 → 구성원 신청)를 보여준다.

import React from 'react';
import { Locale } from '@/shared/StringResource';
import { fs } from '@/app/forms/form.i18n';
import { FormStudio } from './studio.load';

export const StudioHeader = ({studio, locale, compact}: { studio: FormStudio; locale: Locale; compact?: boolean }) => (
  <header className="flex flex-col gap-3">
    {!compact && (
      <span className="inline-flex self-start px-2.5 py-1 rounded-md bg-black text-white text-[11px] font-bold tracking-wide">
        {fs(locale, 'pr_badge')}
      </span>
    )}
    <div className="flex items-center gap-3.5">
      <div className="w-[56px] h-[56px] rounded-2xl overflow-hidden bg-[#F1F3F6] shrink-0">
        {studio.profileImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={studio.profileImageUrl} alt={studio.name} className="w-full h-full object-cover"/>
        )}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[18px] font-bold text-black truncate">{studio.name}</span>
        {(studio.roadAddress || studio.address) && (
          <span className="text-[13px] text-[#9CA3AF] truncate">{studio.roadAddress ?? studio.address}</span>
        )}
      </div>
    </div>
  </header>
);

export const PartnershipRequestIntro = ({studio, locale}: { studio: FormStudio; locale: Locale }) => {
  const steps = [
    { title: fs(locale, 'pr_step1_title'), body: fs(locale, 'pr_step1_body'), current: true },
    { title: fs(locale, 'pr_step2_title'), body: fs(locale, 'pr_step2_body'), current: false },
    { title: fs(locale, 'pr_step3_title'), body: fs(locale, 'pr_step3_body'), current: false },
  ];

  return (
    <div className="flex flex-col gap-8">
      <StudioHeader studio={studio} locale={locale}/>

      <div className="flex flex-col gap-2.5">
        <h1 className="text-[26px] lg:text-[32px] font-bold text-black leading-tight">
          {fs(locale, 'pr_title', {studio: studio.name})}
        </h1>
        <p className="text-[15px] text-[#6B7280] leading-relaxed">{fs(locale, 'pr_subtitle')}</p>
      </div>

      {/* 신청 → 승인 → 구성원 신청. 지금 어디인지 첫 칸에 표시 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[16px] font-bold text-black">{fs(locale, 'pr_how_it_works')}</h2>
        <ol className="flex flex-col rounded-2xl bg-[#F7F8FA] p-4 gap-0">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${
                  step.current ? 'bg-black text-white' : 'bg-white text-[#9CA3AF] border border-[#E5E7EB]'
                }`}>
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className="w-px flex-1 my-1 bg-[#E5E7EB]"/>}
              </div>
              <div className={`flex flex-col gap-1 min-w-0 ${i < steps.length - 1 ? 'pb-5' : ''}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[15px] font-bold ${step.current ? 'text-black' : 'text-[#4E5968]'}`}>{step.title}</span>
                  {step.current && (
                    <span className="px-2 py-0.5 rounded-md bg-[#EFF4FF] text-[11px] font-bold text-[#2F6FED]">
                      {fs(locale, 'pr_you_are_here')}
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#6B7280] leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-[12px] text-[#9CA3AF]">{fs(locale, 'pr_no_payment')}</p>
      </section>
    </div>
  );
};
