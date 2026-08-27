// 구성원 신청 인트로 — form.rawgraphy.com/lessons/{code} (proxy가 /forms/lessons/{code}로 rewrite).
// 어떤 이벤트인지(제목·설명·수업) + 지금 신청현황(인원·단가·구간)을 먼저 쭉 보여주고,
// "신청하기"를 누르면 /apply 라우트로 넘어가 설문·개인정보를 받는다.
// 같은 링크가 시간에 따라 폼/안내 5종으로 갈라진다 — 판정은 partnership.gate 에서 서버 값으로만 한다.

import React from 'react';
import Link from 'next/link';
import { fs, fsWon } from '@/app/forms/form.i18n';
import { formBasePath } from '@/app/forms/form.path';
import { getLocale } from '@/utils/translate';
import { loadPartnership } from './partnership.gate';
import { EventInfo, StatusCard } from './PartnershipApplyForm';

export const dynamic = 'force-dynamic';

export default async function PartnershipIntroPage({params}: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const locale = await getLocale();
  const loaded = await loadPartnership(code, locale);
  if ('blocked' in loaded) return loaded.blocked;

  const p = loaded.p;
  const applyHref = `${await formBasePath(`/lessons/${encodeURIComponent(code)}`)}/apply`;

  return (
    <div className="min-h-screen bg-white">

      {/* ── 모바일 ── */}
      <div className="lg:hidden">
        <div className="mx-auto w-full max-w-md px-5 pt-8 pb-32 flex flex-col gap-8">
          <EventInfo p={p} locale={locale}/>
          <section className="flex flex-col gap-3">
            <h2 className="text-[16px] font-bold text-black">{fs(locale, 'pf_status')}</h2>
            <StatusCard p={p} locale={locale}/>
          </section>
        </div>
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-[#F1F3F6]">
          <div className="mx-auto w-full max-w-md px-5 py-4 flex flex-col gap-1.5">
            <Link href={applyHref}
                  className="block w-full py-4 rounded-xl bg-black text-white text-[16px] font-bold text-center active:bg-[#333]">
              {fs(locale, 'pf_apply')}
            </Link>
            <p className="text-[11px] text-[#C4C8CE] text-center">{fs(locale, 'pf_no_payment_price', {price: fsWon(locale, p.unitPrice)})}</p>
          </div>
        </div>
      </div>

      {/* ── PC ── */}
      <div className="hidden lg:block">
        <div className="mx-auto w-full max-w-5xl px-8 pt-14 pb-24 grid grid-cols-[minmax(0,1fr)_400px] gap-x-12 items-start">
          <EventInfo p={p} locale={locale}/>
          <aside className="sticky top-10 flex flex-col gap-4">
            <StatusCard p={p} locale={locale}/>
            <Link href={applyHref}
                  className="block w-full py-4 rounded-xl bg-black text-white text-[16px] font-bold text-center hover:bg-[#222] transition-colors">
              {fs(locale, 'pf_apply')}
            </Link>
            <p className="text-[11px] text-[#C4C8CE] text-center -mt-2">{fs(locale, 'pf_no_payment_now')}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
