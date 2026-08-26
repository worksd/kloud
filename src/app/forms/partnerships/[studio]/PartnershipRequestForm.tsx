'use client';

// 파트너십 신청서 — /partnerships/{studio}/apply.
// 단체 정보 · 원하는 수업 · 담당자 · 동의. 결제도, 구성원 명단도 받지 않는다 —
// 그건 스튜디오가 승인해 제휴를 만든 뒤 구성원 신청 링크(/lessons/{code})가 맡는다.
// PC(lg~)는 좌측 소개 + 우측 스티키 폼 카드, 모바일은 한 열 + 하단 고정 버튼.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Locale } from '@/shared/StringResource';
import { fs } from '@/app/forms/form.i18n';
import { chipCls, formatPhone, inputCls } from '@/app/forms/form.ui';
import { PartnershipOrganizationType } from '@/app/forms/partnership.api';
import { requestPartnershipAction } from './request.action';
import { FormStudio } from './studio.load';
import { PartnershipRequestIntro, StudioHeader } from './PartnershipRequestIntro';

const ORG_TYPES: { value: PartnershipOrganizationType; key: 'pr_org_type_company' | 'pr_org_type_school' | 'pr_org_type_club' | 'pr_org_type_other' }[] = [
  { value: 'Company', key: 'pr_org_type_company' },
  { value: 'School', key: 'pr_org_type_school' },
  { value: 'Club', key: 'pr_org_type_club' },
  { value: 'Other', key: 'pr_org_type_other' },
];

const Section = ({title, required, children}: { title: string; required?: boolean; children: React.ReactNode }) => (
  <section className="flex flex-col gap-2.5">
    <h3 className="text-[15px] font-bold text-black">
      {title}
      {required && <span className="text-[#E5484D]"> *</span>}
    </h3>
    {children}
  </section>
);

export const PartnershipRequestForm = ({studio, locale, basePath}: {
  studio: FormStudio;
  locale: Locale;
  /** 브라우저에 보이는 인트로 경로 — 뒤로가기·완료 이동의 기준 */
  basePath: string;
}) => {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<PartnershipOrganizationType | null>(null);
  const [headcount, setHeadcount] = useState('');
  const [period, setPeriod] = useState('');
  const [content, setContent] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [memo, setMemo] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // 제출 실패 배너 — 중복 신청 등. 입력값은 지우지 않고 안내만 얹는다.
  const [banner, setBanner] = useState<string | null>(null);

  const headcountNum = Number(headcount.replace(/\D/g, ''));

  const requiredMissing = useMemo(() => (
    !orgName.trim() || !orgType || !(headcountNum > 0)
    || !contactName.trim() || phone.replace(/\D/g, '').length < 10 || !agreed
  ), [orgName, orgType, headcountNum, contactName, phone, agreed]);

  const submit = async () => {
    if (submitting || requiredMissing || !orgType) return;
    setSubmitting(true);
    setBanner(null);
    const res = await requestPartnershipAction({
      studioId: studio.id,
      studioName: studio.name,
      organizationName: orgName.trim(),
      organizationType: orgType,
      expectedHeadcount: headcountNum,
      desiredPeriod: period.trim() || undefined,
      content: content.trim() || undefined,
      contactName: contactName.trim(),
      phone,
      email: email.trim() || undefined,
      memo: memo.trim() || undefined,
    });
    if (res.ok) {
      router.replace(`${basePath}/done`);
      return;
    }
    setBanner(res.error.message);
    setSubmitting(false);
  };

  const fields = (
    <div className="flex flex-col gap-7">
      <Section title={fs(locale, 'pr_org_section')} required>
        <input className={inputCls} placeholder={fs(locale, 'pr_org_name_ph')} value={orgName}
               onChange={(e) => setOrgName(e.target.value)}/>
        <div className="flex flex-wrap gap-2">
          {ORG_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => setOrgType(t.value)} className={chipCls(orgType === t.value)}>
              {fs(locale, t.key)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={fs(locale, 'pr_headcount')} required>
        <div className="relative">
          <input className={`${inputCls} pr-12`} placeholder={fs(locale, 'pr_headcount_ph')} value={headcount}
                 inputMode="numeric" onChange={(e) => setHeadcount(e.target.value.replace(/\D/g, '').slice(0, 5))}/>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF]">
            {fs(locale, 'pr_headcount_unit')}
          </span>
        </div>
        <p className="text-[12px] text-[#9CA3AF]">{fs(locale, 'pr_headcount_hint')}</p>
      </Section>

      <Section title={fs(locale, 'pr_wish_section')}>
        <input className={inputCls} placeholder={fs(locale, 'pr_wish_period_ph')} value={period}
               onChange={(e) => setPeriod(e.target.value)}/>
        <textarea className={`${inputCls} min-h-[96px] resize-none`} placeholder={fs(locale, 'pr_wish_content_ph')}
                  value={content} onChange={(e) => setContent(e.target.value)}/>
      </Section>

      <Section title={fs(locale, 'pr_contact_section')} required>
        <input className={inputCls} placeholder={fs(locale, 'pr_contact_name_ph')} value={contactName}
               onChange={(e) => setContactName(e.target.value)}/>
        <input className={inputCls} placeholder={fs(locale, 'pf_phone_ph')} value={phone} inputMode="numeric"
               onChange={(e) => setPhone(formatPhone(e.target.value))}/>
        <input className={inputCls} placeholder={fs(locale, 'pr_email_ph')} value={email} inputMode="email" type="email"
               onChange={(e) => setEmail(e.target.value)}/>
        <input className={inputCls} placeholder={fs(locale, 'pr_memo_ph')} value={memo}
               onChange={(e) => setMemo(e.target.value)}/>
      </Section>

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
               className="mt-0.5 w-[18px] h-[18px] accent-black"/>
        <span className="text-[13px] text-[#6B7280] leading-relaxed">
          <b className="text-black">{fs(locale, 'pf_privacy_title')}</b><br/>
          {fs(locale, 'pr_privacy_body')}
        </span>
      </label>
    </div>
  );

  const submitButton = (
    <button type="button" onClick={submit} disabled={requiredMissing || submitting}
            className={`w-full py-4 rounded-xl text-[16px] font-bold transition-colors ${
              requiredMissing || submitting ? 'bg-[#F1F3F6] text-[#C4C8CE]' : 'bg-black text-white active:bg-[#333] hover:bg-[#222]'
            }`}>
      {submitting ? fs(locale, 'pr_submitting') : fs(locale, 'pr_submit')}
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
            <span className="text-[16px] font-bold text-black truncate">{fs(locale, 'pr_form_title', {studio: studio.name})}</span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md px-5 pt-6 pb-36 flex flex-col gap-7">
          <StudioHeader studio={studio} locale={locale} compact/>
          {fields}
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
        <div className="mx-auto w-full max-w-5xl px-8 pt-14 pb-24 grid grid-cols-[minmax(0,1fr)_440px] gap-x-12 items-start">
          <PartnershipRequestIntro studio={studio} locale={locale}/>
          <aside className="sticky top-10">
            <div className="rounded-2xl border border-[#F1F3F6] p-6 flex flex-col gap-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <Link href={basePath} className="self-start text-[13px] text-[#6B7280] hover:text-black transition-colors">
                {fs(locale, 'pr_back')}
              </Link>
              {fields}
              {banner && <p className="text-[13px] text-[#E5484D] text-center">{banner}</p>}
              {submitButton}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
