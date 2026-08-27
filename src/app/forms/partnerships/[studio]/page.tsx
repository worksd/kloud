// 파트너십 신청 인트로 — form.rawgraphy.com/partnerships/{studio} (proxy가 /forms/partnerships/{studio}로 rewrite).
// 구성원 신청(/lessons/{code})보다 한 단계 앞이다:
//   ① 단체 담당자가 이 신청서를 보냄 → ② 스튜디오가 관리자에서 검토·승인 → ③ 제휴가 열리면 구성원들이 /lessons/{code} 로 각자 신청.
// 여기서는 어느 스튜디오에 무엇을 신청하는지와 이 순서를 보여주고, "신청서 작성하기"로 /apply 라우트에 넘긴다.

import React from 'react';
import Link from 'next/link';
import { fs } from '@/app/forms/form.i18n';
import { formBasePath } from '@/app/forms/form.path';
import { Notice } from '@/app/forms/Notice';
import { getLocale } from '@/utils/translate';
import { loadFormStudio } from './studio.load';
import { PartnershipRequestIntro } from './PartnershipRequestIntro';

export const dynamic = 'force-dynamic';

export default async function PartnershipRequestIntroPage({params}: { params: Promise<{ studio: string }> }) {
  const { studio: key } = await params;
  const locale = await getLocale();
  const studio = await loadFormStudio(key);
  if (!studio) {
    return <Notice emoji="🔗" title={fs(locale, 'pr_studio_notfound_title')} message={fs(locale, 'pr_studio_notfound_msg')}/>;
  }

  const applyHref = `${await formBasePath(`/partnerships/${encodeURIComponent(key)}`)}/apply`;

  return (
    <div className="min-h-screen bg-white">

      {/* ── 모바일 ── */}
      <div className="lg:hidden">
        <div className="mx-auto w-full max-w-md px-5 pt-8 pb-32">
          <PartnershipRequestIntro studio={studio} locale={locale}/>
        </div>
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-[#F1F3F6]">
          <div className="mx-auto w-full max-w-md px-5 py-4 flex flex-col gap-1.5">
            <Link href={applyHref}
                  className="block w-full py-4 rounded-xl bg-black text-white text-[16px] font-bold text-center active:bg-[#333]">
              {fs(locale, 'pr_start')}
            </Link>
            <p className="text-[11px] text-[#C4C8CE] text-center">{fs(locale, 'pr_takes_minute')}</p>
          </div>
        </div>
      </div>

      {/* ── PC ── */}
      <div className="hidden lg:block">
        <div className="mx-auto w-full max-w-5xl px-8 pt-14 pb-24 grid grid-cols-[minmax(0,1fr)_440px] gap-x-12 items-start">
          <PartnershipRequestIntro studio={studio} locale={locale}/>
          <aside className="sticky top-10 flex flex-col gap-4">
            <div className="rounded-2xl border border-[#F1F3F6] p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] text-[#6B7280]">{fs(locale, 'pr_card_label')}</span>
                <span className="text-[20px] font-bold text-black leading-snug">{fs(locale, 'pr_card_title', {studio: studio.name})}</span>
              </div>
              <ul className="flex flex-col gap-1.5 text-[14px] text-[#4E5968]">
                <li>· {fs(locale, 'pr_card_point1')}</li>
                <li>· {fs(locale, 'pr_card_point2')}</li>
                <li>· {fs(locale, 'pr_card_point3')}</li>
              </ul>
              <Link href={applyHref}
                    className="block w-full py-4 rounded-xl bg-black text-white text-[16px] font-bold text-center hover:bg-[#222] transition-colors">
                {fs(locale, 'pr_start')}
              </Link>
              <p className="text-[11px] text-[#C4C8CE] text-center -mt-2">{fs(locale, 'pr_takes_minute')}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
