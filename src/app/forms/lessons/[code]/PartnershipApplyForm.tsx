'use client';

// 구성원 신청 화면 조각들.
// - EventInfo / StatusCard: 인트로(/lessons/{code})와 폼(/lessons/{code}/apply) 양쪽에서 쓴다.
// - PartnershipApplyForm: 폼 라우트 전용. 설문·개인정보 입력과 제출.
// PC(lg~)는 좌측 소개 + 우측 스티키 카드, 모바일은 한 열.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicPartnership } from '@/app/forms/partnership.api';
import { applyPartnershipAction } from './apply.action';
import { Locale } from '@/shared/StringResource';
import { fs, fsWon } from '@/app/forms/form.i18n';
import { formatPhone, inputCls } from '@/app/forms/form.ui';

// ── 이벤트 소개 (인트로 좌측/상단) ─────────────────────────────

export const EventInfo = ({p, locale}: { p: PublicPartnership; locale: Locale }) => (
  <div className="flex flex-col gap-8">
    <header className="flex flex-col gap-2.5">
      <span className="inline-flex self-start px-2.5 py-1 rounded-md bg-black text-white text-[11px] font-bold tracking-wide">
        {fs(locale, 'pf_recruiting')}
      </span>
      <h1 className="text-[26px] lg:text-[32px] font-bold text-black leading-tight">{p.title}</h1>
      {p.description && <p className="text-[15px] text-[#6B7280] leading-relaxed">{p.description}</p>}
    </header>

    <section className="flex flex-col gap-3">
      <h2 className="text-[16px] font-bold text-black">{fs(locale, 'pf_lessons')}</h2>
      {p.lessons.length === 0 ? (
        <p className="text-[14px] text-[#6B7280] rounded-xl bg-[#F7F8FA] px-4 py-3.5">
          {fs(locale, 'pf_lessons_tbd')}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {p.lessons.map((l) => (
            <div key={l.lessonId} className="flex items-center gap-3.5 rounded-2xl border border-[#F1F3F6] p-3.5">
              <div className="w-[64px] h-[64px] rounded-xl overflow-hidden bg-[#F1F3F6] shrink-0">
                {l.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.thumbnailUrl} alt={l.title} className="w-full h-full object-cover"/>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[15px] font-bold text-black truncate">{l.title}</span>
                <span className="text-[13px] text-[#9CA3AF] truncate">
                  {[l.artistName, l.startDate].filter(Boolean).join(' · ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    <section className="flex flex-col gap-3">
      <h2 className="text-[16px] font-bold text-black">{fs(locale, 'pf_how_it_works')}</h2>
      <ul className="flex flex-col gap-2 text-[14px] text-[#4E5968] rounded-2xl bg-[#F7F8FA] p-4">
        <li>1️⃣ {p.applyDeadline ? fs(locale, 'pf_step1_deadline', {date: p.applyDeadline}) : fs(locale, 'pf_step1_until_full')}</li>
        <li>2️⃣ {fs(locale, 'pf_step2')}</li>
        <li>3️⃣ {fs(locale, 'pf_step3')}{p.paymentDeadline ? fs(locale, 'pf_payment_due', {date: p.paymentDeadline}) : ''}</li>
      </ul>
      <p className="text-[12px] text-[#9CA3AF]">{fs(locale, 'pf_no_payment_now')}</p>
    </section>
  </div>
);

// ── 신청 현황 카드 (인트로 우측/하단) ───────────────────────────

export const StatusCard = ({p, locale}: { p: PublicPartnership; locale: Locale }) => {
  const ratio = p.maxHeadcount ? Math.min(100, Math.round((p.applicantCount / p.maxHeadcount) * 100)) : null;
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[#F1F3F6] p-5 bg-white">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] text-[#6B7280]">{fs(locale, 'pf_applied_so_far')}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-bold text-black leading-none">{p.applicantCount}</span>
          <span className="text-[16px] text-[#6B7280]">{fs(locale, 'pf_people')}{p.maxHeadcount != null && ` / ${p.maxHeadcount}${fs(locale, 'pf_people')}`}</span>
        </div>
        {ratio != null && (
          <div className="mt-1 h-2 rounded-full bg-[#F1F3F6] overflow-hidden">
            <div className="h-full rounded-full bg-black transition-all" style={{width: `${ratio}%`}}/>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-[#6B7280]">{fs(locale, 'pf_current_per_person')}</span>
        <span className="text-[24px] font-bold text-black leading-none">{fsWon(locale, p.unitPrice)}</span>
      </div>

      {p.nextTier && (
        <div className="rounded-xl bg-[#EFF4FF] px-4 py-3 text-[14px] text-black">
          {fs(locale, 'pf_next_tier', {n: p.nextTier.remaining, price: fsWon(locale, p.nextTier.pricePerPerson)})}
        </div>
      )}

      {/* 인원 구간별 가격 — 경계는 "N명부터" */}
      {p.tiers.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#6B7280]">{fs(locale, 'pf_tier_table')}</span>
          {p.tiers.map((tier) => {
            const active = tier.pricePerPerson === p.unitPrice;
            return (
              <div key={tier.minCount}
                   className={`flex justify-between rounded-lg px-3 py-2 text-[14px] ${
                     active ? 'bg-black text-white font-bold' : 'text-[#4E5968]'
                   }`}>
                <span>{fs(locale, 'pf_tier_from', {n: tier.minCount})}</span>
                <span>{fsWon(locale, tier.pricePerPerson)}{active && ` · ${fs(locale, 'pf_now')}`}</span>
              </div>
            );
          })}
        </div>
      )}

      <span className="text-[12px] text-[#9CA3AF]">
        {p.applyDeadline ? fs(locale, 'pf_deadline_until', {date: p.applyDeadline}) : fs(locale, 'pf_until_full')}
      </span>
    </div>
  );
};

// ── 신청 입력 (설문 + 개인정보 + 동의) ──────────────────────────

type ApplyState = {
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  memo: string; setMemo: (v: string) => void;
  answers: Record<string, string | string[]>;
  setAnswer: (id: string, v: string | string[]) => void;
  toggleMulti: (id: string, option: string) => void;
  agreed: boolean; setAgreed: (v: boolean) => void;
  missingQuestionId: string | null;
};

const ApplyFields = ({p, s, locale}: { p: PublicPartnership; s: ApplyState; locale: Locale }) => (
  <div className="flex flex-col gap-7">
    {/* 설문 먼저 — 이벤트를 준비하는 데 필요한 답 */}
    {(p.questions ?? []).map((q) => (
      <section key={q.id} className="flex flex-col gap-2.5">
        <h3 className="text-[15px] font-bold text-black">
          {q.label}
          {q.required && <span className="text-[#E5484D]"> *</span>}
        </h3>
        {q.type === 'text' && (
          <input className={inputCls} placeholder={fs(locale, 'pf_answer_ph')}
                 value={(s.answers[q.id] as string | undefined) ?? ''}
                 onChange={(e) => s.setAnswer(q.id, e.target.value)}/>
        )}
        {q.type !== 'text' && (
          <div className="flex flex-wrap gap-2">
            {(q.options ?? []).map((option) => {
              const selected = q.type === 'select'
                ? s.answers[q.id] === option
                : ((s.answers[q.id] as string[] | undefined) ?? []).includes(option);
              return (
                <button key={option} type="button"
                        onClick={() => q.type === 'select' ? s.setAnswer(q.id, option) : s.toggleMulti(q.id, option)}
                        className={`px-4 py-2 rounded-full border text-[14px] transition-colors ${
                          selected ? 'bg-black text-white border-black' : 'bg-white text-black border-[#E5E7EB]'
                        }`}>
                  {option}
                </button>
              );
            })}
          </div>
        )}
        {s.missingQuestionId === q.id && <p className="text-[12px] text-[#E5484D]">{fs(locale, 'pf_answer_required')}</p>}
      </section>
    ))}

    {/* 개인정보 — 문항 설정과 무관하게 항상 받는다 */}
    <section className="flex flex-col gap-2.5">
      <h3 className="text-[15px] font-bold text-black">{fs(locale, 'pf_applicant_info')}<span className="text-[#E5484D]"> *</span></h3>
      <input className={inputCls} placeholder={fs(locale, 'pf_name_ph')} value={s.name} onChange={(e) => s.setName(e.target.value)}/>
      <input className={inputCls} placeholder={fs(locale, 'pf_phone_ph')} value={s.phone} inputMode="numeric"
             onChange={(e) => s.setPhone(formatPhone(e.target.value))}/>
      <input className={inputCls} placeholder={fs(locale, 'pf_memo_ph')} value={s.memo}
             onChange={(e) => s.setMemo(e.target.value)}/>
    </section>

    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <input type="checkbox" checked={s.agreed} onChange={(e) => s.setAgreed(e.target.checked)}
             className="mt-0.5 w-[18px] h-[18px] accent-black"/>
      <span className="text-[13px] text-[#6B7280] leading-relaxed">
        <b className="text-black">{fs(locale, 'pf_privacy_title')}</b><br/>
        {fs(locale, 'pf_privacy_body')}
      </span>
    </label>
  </div>
);

// ── 폼 라우트 (/lessons/{code}/apply) ───────────────────────────

export const PartnershipApplyForm = ({partnership: p, locale, basePath}: {
  partnership: PublicPartnership;
  locale: Locale;
  /** 브라우저에 보이는 인트로 경로 — 뒤로가기·완료 이동의 기준 */
  basePath: string;
}) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // 제출 실패 배너 — 정원 참 등. 입력값은 지우지 않고 안내만 얹는다.
  const [banner, setBanner] = useState<string | null>(null);
  const [missingQuestionId, setMissingQuestionId] = useState<string | null>(null);

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setMissingQuestionId((prev) => (prev === id ? null : prev));
  };
  const toggleMulti = (id: string, option: string) => {
    const current = (answers[id] as string[] | undefined) ?? [];
    setAnswer(id, current.includes(option) ? current.filter((o) => o !== option) : [...current, option]);
  };

  const requiredMissing = useMemo(() => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 10 || !agreed) return true;
    return (p.questions ?? []).some((q) => {
      if (!q.required) return false;
      const a = answers[q.id];
      return a == null || (typeof a === 'string' && a.trim() === '') || (Array.isArray(a) && a.length === 0);
    });
  }, [name, phone, agreed, answers, p.questions]);

  const submit = async () => {
    if (submitting || requiredMissing) return;
    setSubmitting(true);
    setBanner(null);
    const res = await applyPartnershipAction({
      code: p.code, name: name.trim(), phone, memo: memo.trim() || undefined, answers,
    });
    if (res.ok) {
      const q = new URLSearchParams({ n: String(res.data.applicantCount), price: String(res.data.unitPrice) });
      if (res.data.nextTier) {
        q.set('nextPrice', String(res.data.nextTier.pricePerPerson));
        q.set('remain', String(res.data.nextTier.remaining));
      }
      router.replace(`${basePath}/done?${q.toString()}`);
      return;
    }
    // 폼을 열어둔 사이 정원이 찰 수 있다 — 입력값은 유지한 채 사유만 띄운다
    setBanner(res.error.message);
    if (res.error.questionId) setMissingQuestionId(res.error.questionId);
    setSubmitting(false);
  };

  const applyState: ApplyState = {
    name, setName, phone, setPhone, memo, setMemo,
    answers, setAnswer, toggleMulti, agreed, setAgreed, missingQuestionId,
  };

  const submitButton = (
    <button type="button" onClick={submit} disabled={requiredMissing || submitting}
            className={`w-full py-4 rounded-xl text-[16px] font-bold transition-colors ${
              requiredMissing || submitting ? 'bg-[#F1F3F6] text-[#C4C8CE]' : 'bg-black text-white active:bg-[#333] hover:bg-[#222]'
            }`}>
      {submitting ? fs(locale, 'pf_applying') : fs(locale, 'pf_apply')}
    </button>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── 모바일 ── */}
      <div className="lg:hidden">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-[#F1F3F6] z-10">
          <div className="mx-auto w-full max-w-md px-3 py-3 flex items-center gap-2">
            <Link href={basePath} aria-label="뒤로" className="p-2 -m-1 text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <span className="text-[16px] font-bold text-black truncate">{p.title}</span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md px-5 pt-6 pb-36">
          <ApplyFields p={p} s={applyState} locale={locale}/>
        </div>
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-[#F1F3F6]">
          <div className="mx-auto w-full max-w-md px-5 py-4 flex flex-col gap-2">
            {banner && <p className="text-[13px] text-[#E5484D] text-center">{banner}</p>}
            {submitButton}
          </div>
        </div>
      </div>

      {/* ── PC ── */}
      <div className="hidden lg:block">
        <div className="mx-auto w-full max-w-5xl px-8 pt-14 pb-24 grid grid-cols-[minmax(0,1fr)_400px] gap-x-12 items-start">
          <EventInfo p={p} locale={locale}/>
          <aside className="sticky top-10">
            <div className="rounded-2xl border border-[#F1F3F6] p-6 flex flex-col gap-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <Link href={basePath} className="self-start text-[13px] text-[#6B7280] hover:text-black transition-colors">
                {fs(locale, 'pf_back_to_status')}
              </Link>
              <ApplyFields p={p} s={applyState} locale={locale}/>
              {banner && <p className="text-[13px] text-[#E5484D] text-center">{banner}</p>}
              {submitButton}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
