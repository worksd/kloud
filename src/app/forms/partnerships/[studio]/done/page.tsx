// 파트너십 신청 완료 — 보냈다는 확인과 "다음에 무슨 일이 일어나는지".
// 담당자 연락처 같은 개인정보는 URL 에 싣지 않는다 — 스튜디오 이름만 다시 조회해 쓴다.

import React from 'react';
import { fs } from '@/app/forms/form.i18n';
import { getLocale } from '@/utils/translate';
import { loadFormStudio } from '../studio.load';

export default async function PartnershipRequestDonePage({params}: { params: Promise<{ studio: string }> }) {
  const { studio: key } = await params;
  const locale = await getLocale();
  const studio = await loadFormStudio(key);
  const studioName = studio?.name ?? fs(locale, 'pr_the_studio');

  const next = [
    { title: fs(locale, 'pr_step2_title'), body: fs(locale, 'pr_done_next1', {studio: studioName}) },
    { title: fs(locale, 'pr_step3_title'), body: fs(locale, 'pr_done_next2') },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-md px-5 pt-24 pb-16 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[52px]">📨</span>
          <h1 className="text-[22px] font-bold text-black leading-snug">{fs(locale, 'pr_done_title')}</h1>
          <p className="text-[15px] text-[#6B7280] whitespace-pre-line">{fs(locale, 'pr_done_msg', {studio: studioName})}</p>
        </div>

        <section className="w-full flex flex-col gap-3">
          <h2 className="text-[14px] font-bold text-[#6B7280]">{fs(locale, 'pr_done_next')}</h2>
          <ol className="flex flex-col gap-2">
            {next.map((step, i) => (
              <li key={step.title} className="flex gap-3 rounded-2xl bg-[#F7F8FA] p-4">
                <span className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[13px] font-bold text-[#9CA3AF] shrink-0">
                  {i + 2}
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[15px] font-bold text-black">{step.title}</span>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
