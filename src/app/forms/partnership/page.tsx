// 파트너십 홍보 랜딩 — form.rawgraphy.com/partnership (proxy가 /forms/partnership 으로 rewrite).
// 기업·학교·동호회 담당자가 링크를 받기 전에 보는 피치 페이지.
// CTA → 스튜디오 선택(#studios) → /partnerships/{studio} 문의 플로우로 이어진다.

import React from 'react';
import Link from 'next/link';
import { fs } from '@/app/forms/form.i18n';
import { formBasePath } from '@/app/forms/form.path';
import { getLocale } from '@/utils/translate';
import { getStudioList } from '@/app/home/action/get.studio.list.action';
import { loadFormStudio } from '@/app/forms/partnerships/[studio]/studio.load';

const VALUE_KEYS = [
  { icon: '🏆', t: 'pp_value1_t', d: 'pp_value1_d' },
  { icon: '📉', t: 'pp_value2_t', d: 'pp_value2_d' },
  { icon: '🔗', t: 'pp_value3_t', d: 'pp_value3_d' },
] as const;

const FLOW_KEYS = [
  { t: 'pp_flow1_t', d: 'pp_flow1_d' },
  { t: 'pp_flow2_t', d: 'pp_flow2_d' },
  { t: 'pp_flow3_t', d: 'pp_flow3_d' },
] as const;

const FOR_KEYS = [
  { icon: '🪩', t: 'pp_for_studio_t', d: 'pp_for_studio_d' },
  { icon: '🚗', t: 'pp_for_visit_t', d: 'pp_for_visit_d' },
  { icon: '🎯', t: 'pp_for_custom_t', d: 'pp_for_custom_d' },
] as const;

export default async function PartnershipLandingPage({searchParams}: {
  searchParams: Promise<{ studio?: string }>
}) {
  const locale = await getLocale();
  const { studio: studioKey } = await searchParams;
  const partnershipsBase = await formBasePath('/partnerships');

  // 배포 모델 두 가지:
  // 1) 스튜디오가 자기 링크(?studio={slug})를 뿌림 → CTA가 그 스튜디오 문의로 직행
  // 2) 쿼리 없음 → 스튜디오 목록에서 고르게 한다. 단 GET /studios 는 인증 필수라
  //    비로그인 방문자에게는 목록이 비어 섹션이 숨는다 (공개 목록 API 가 생기면 풀림).
  const targetStudio = studioKey ? await loadFormStudio(studioKey) : null;
  const { studios } = targetStudio ? { studios: undefined } : await getStudioList({});
  const requestHref = targetStudio
    ? `${partnershipsBase}/${encodeURIComponent(targetStudio.slug ?? String(targetStudio.id))}`
    : '#studios';

  return (
    <div className="min-h-screen bg-white">

      {/* ── 히어로: 블랙 밴드 — 피치는 여기서 끝나야 한다 ── */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 pt-20 lg:pt-28 pb-16 lg:pb-24 flex flex-col items-start gap-6">
          {/* 브랜드 로고 아이브로 — 대상(기업·학교·동호회)은 아래 섹션이 말한다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo_white.svg" alt="Rawgraphy" className="h-6 lg:h-7 w-auto"/>
          <h1 className="font-paperlogy text-[34px] lg:text-[56px] leading-[1.15] whitespace-pre-line [text-wrap:balance]">
            {fs(locale, 'pp_hero_title')}
          </h1>
          <p className="text-[15px] lg:text-[17px] text-white/70 max-w-xl leading-relaxed">
            {fs(locale, 'pp_hero_sub')}
          </p>
          <Link href={requestHref}
                className="mt-2 px-7 py-4 rounded-xl bg-white text-black text-[16px] font-bold hover:bg-[#E9ECEF] transition-colors">
            {fs(locale, 'pp_cta')}
          </Link>
        </div>
      </section>

      {/* ── 혜택 3가지 ── */}
      <section className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-16 lg:py-20 flex flex-col gap-8">
        <h2 className="font-paperlogy text-[24px] lg:text-[32px] text-black">{fs(locale, 'pp_value_title')}</h2>
        <div className="grid lg:grid-cols-3 gap-4">
          {VALUE_KEYS.map((v) => (
            <div key={v.t} className="rounded-2xl bg-[#F7F8FA] p-6 flex flex-col gap-3">
              <span className="text-[28px]">{v.icon}</span>
              <h3 className="text-[17px] font-bold text-black">{fs(locale, v.t)}</h3>
              <p className="text-[14px] text-[#6B7280] leading-relaxed">{fs(locale, v.d)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 진행 방식: 실제 순서가 있는 흐름이라 번호를 단다 ── */}
      <section className="bg-[#F7F8FA]">
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-16 lg:py-20 flex flex-col gap-8">
          <h2 className="font-paperlogy text-[24px] lg:text-[32px] text-black">{fs(locale, 'pp_flow_title')}</h2>
          <ol className="grid lg:grid-cols-3 gap-4">
            {FLOW_KEYS.map((step, i) => (
              <li key={step.t} className="rounded-2xl bg-white p-6 flex flex-col gap-2.5">
                <span className="w-8 h-8 rounded-full bg-black text-white text-[14px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="text-[16px] font-bold text-black">{fs(locale, step.t)}</h3>
                <p className="text-[14px] text-[#6B7280] leading-relaxed">{fs(locale, step.d)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 대상 ── */}
      <section className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-16 lg:py-20 flex flex-col gap-8">
        <h2 className="font-paperlogy text-[24px] lg:text-[32px] text-black">{fs(locale, 'pp_for_title')}</h2>
        <div className="flex flex-col gap-3">
          {FOR_KEYS.map((f) => (
            <div key={f.t} className="flex items-center gap-4 rounded-2xl border border-[#F1F3F6] px-5 py-4">
              <span className="text-[26px]">{f.icon}</span>
              <div className="flex flex-col gap-0.5 lg:flex-row lg:items-baseline lg:gap-3">
                <span className="text-[16px] font-bold text-black">{fs(locale, f.t)}</span>
                <span className="text-[14px] text-[#6B7280]">{fs(locale, f.d)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 대상 스튜디오 (?studio= 로 들어온 링크) ── */}
      {targetStudio && (
        <section className="bg-[#F7F8FA]">
          <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-16 lg:py-20 flex flex-col gap-5">
            <h2 className="font-paperlogy text-[24px] lg:text-[32px] text-black">{fs(locale, 'pp_studio_title')}</h2>
            <Link href={requestHref}
                  className="group flex items-center gap-4 rounded-2xl bg-white border border-transparent hover:border-black transition-colors px-5 py-5 max-w-xl">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F1F3F6] shrink-0">
                {targetStudio.profileImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={targetStudio.profileImageUrl} alt={targetStudio.name} className="w-full h-full object-cover"/>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-[17px] font-bold text-black truncate">{targetStudio.name}</span>
                {(targetStudio.address || targetStudio.roadAddress) && (
                  <span className="text-[13px] text-[#9CA3AF] truncate">{targetStudio.address ?? targetStudio.roadAddress}</span>
                )}
              </div>
              <span className="shrink-0 px-4 py-2 rounded-lg bg-black text-white text-[13px] font-bold">{fs(locale, 'pp_cta')}</span>
            </Link>
          </div>
        </section>
      )}

      {/* ── 스튜디오 선택 — 문의는 스튜디오 단위라 여기서 갈라진다 ── */}
      {!targetStudio && studios && studios.length > 0 && (
        <section id="studios" className="bg-[#F7F8FA] scroll-mt-8">
          <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-16 lg:py-20 flex flex-col gap-3">
            <h2 className="font-paperlogy text-[24px] lg:text-[32px] text-black">{fs(locale, 'pp_studio_title')}</h2>
            <p className="text-[14px] text-[#6B7280]">{fs(locale, 'pp_studio_sub')}</p>
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-3">
              {studios.map((s) => (
                <Link key={s.id} href={`${partnershipsBase}/${encodeURIComponent(s.slug ?? String(s.id))}`}
                      className="group flex items-center gap-4 rounded-2xl bg-white border border-transparent hover:border-black transition-colors px-5 py-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F1F3F6] shrink-0">
                    {s.profileImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.profileImageUrl} alt={s.name} className="w-full h-full object-cover"/>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-[16px] font-bold text-black truncate">{s.name}</span>
                    {(s.address || s.roadAddress) && (
                      <span className="text-[13px] text-[#9CA3AF] truncate">{s.address ?? s.roadAddress}</span>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#C4C8CE] group-hover:text-black transition-colors">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 마지막 CTA 밴드 ── */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-16 lg:py-20 flex flex-col items-center gap-4 text-center">
          <h2 className="font-paperlogy text-[26px] lg:text-[36px] [text-wrap:balance]">{fs(locale, 'pp_bottom_title')}</h2>
          <p className="text-[14px] lg:text-[15px] text-white/60">{fs(locale, 'pp_bottom_sub')}</p>
          <Link href={requestHref}
                className="mt-3 px-8 py-4 rounded-xl bg-white text-black text-[16px] font-bold hover:bg-[#E9ECEF] transition-colors">
            {fs(locale, 'pp_cta')}
          </Link>
        </div>
      </section>
    </div>
  );
}
