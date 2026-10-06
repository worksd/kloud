'use client';

import React, { useState } from 'react';
import { CreditCard, Plus, Star } from 'lucide-react';
import { Card, inputCls, SettingShell } from '@/app/admin/setting/SettingKit';
import { showToast } from '@/app/components/toast.host';
import { StudioSubscription, StudioSubscriptionResponse } from '@/app/endpoint/studio.endpoint';
import { CreateBillingRequest } from '@/app/endpoint/billing.endpoint';
import {
  addBillingCardAction, BillingCard, getBillingCardsAction, getStudioSubscriptionAction, setRepresentativeBillingAction,
} from '@/app/admin/setting/payment/payment.setting.action';

// 관리자 설정 > 요금제·결제수단 (설정>결제 연동 가이드 2026-10-04)
//  - 현재 요금제: GET /studios/me/subscription. status 는 Active·Ended 둘만 다룬다. 변경 예약은 scheduledPlan 존재가 아니라 비교식으로 판정.
//  - 결제수단: GET /billing 목록 + POST /billing 등록. 성공 응답엔 카드 정보가 없어 목록을 재조회한다.
//    대표 카드는 subscription.representativeBillingKey 와 대조. 첫 카드면 PATCH /studios 로 대표 지정(서버가 자동 지정하지 않는다).

const CYCLE_LABEL: Record<string, string> = { MONTHLY: '월간', ANNUAL: '연간' };
const PLAN_FALLBACK: Record<string, string> = {
  Lite: '라이트', Basic: '베이직', EarlyBirdBasic: '얼리버드 베이직', Premium: '프리미엄', Enterprise: '엔터프라이즈', PracticeRoom: '연습실 전용',
};

const planName = (type?: string | null, display?: string | null) => display || (type ? PLAN_FALLBACK[type] ?? type : '-');
/** yyyy-MM-dd → yyyy.MM.dd */
const dot = (d?: string | null) => (d ? d.replace(/-/g, '.') : '-');
/** PortOne 마스킹 번호('53890382****548*') → '5389 0382 **** 548*'. 하이픈·공백이 섞여 와도 숫자와 *만 남겨 4자리씩 끊는다 */
const groupCard = (n?: string) => {
  const core = (n ?? '').replace(/[^0-9*]/g, '');
  return core ? core.replace(/(.{4})(?=.)/g, '$1 ') : '카드번호 없음';
};
/** 'yyyy-MM-dd HH:mm' → 'yyyy.MM.dd' */
const dateOnly = (s?: string) => (s ? s.slice(0, 10).replace(/-/g, '.') : '');

/** 플랜 변경 예약 여부 — Active 면 scheduledPlan 이 늘 있으므로 값 비교로 본다 */
const hasPlanChange = (sub: StudioSubscription) => {
  const sp = sub.scheduledPlan;
  if (!sp) return false;
  return sp.type !== sub.type || sp.billingCycle !== sub.billingCycle || sp.date !== sub.nextPaymentDate;
};

/** 상태 배지 — 연한 배경 + 색 점 + 글자. 상태 색: 이용 중(초록) / 체험 중(파랑) / 해지 예정(빨강) / 대표(검정) */
type BadgeTone = 'green' | 'blue' | 'red' | 'dark' | 'gray';
function Badge({ children, tone = 'gray', dot = false }: { children: React.ReactNode; tone?: BadgeTone; dot?: boolean }) {
  const cls: Record<BadgeTone, { wrap: string; dot: string }> = {
    green: { wrap: 'bg-[#E9F8F0] text-[#1B8A4C]', dot: 'bg-[#2EBD6B]' },
    blue: { wrap: 'bg-[#EAF2FF] text-[#1E5BD6]', dot: 'bg-[#3B82F6]' },
    red: { wrap: 'bg-[#FDECEC] text-[#D64545]', dot: 'bg-[#E55B5B]' },
    dark: { wrap: 'bg-[#1E2124] text-white', dot: 'bg-white' },
    gray: { wrap: 'bg-[#F2F4F6] text-[#6B7684]', dot: 'bg-[#9AA3AD]' },
  };
  return (
    <span className={`inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-full text-[12px] font-bold leading-none ${cls[tone].wrap}`}>
      {dot && <span className={`w-[6px] h-[6px] rounded-full ${cls[tone].dot}`}/>}
      {children}
    </span>
  );
}

/** 키·값 목록 — 연한 배경 박스 안에 줄마다 같은 패딩. 구분선은 박스 안에서만 얇게 */
function InfoList({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className={'rounded-[14px] bg-[#F7F8FA] px-4 divide-y divide-[#EBEDF0]'}>
      {rows.map((r) => (
        <div key={r.label} className={'flex items-center justify-between gap-4 py-3'}>
          <dt className={'shrink-0 text-[13px] text-[#8B95A1]'}>{r.label}</dt>
          <dd className={'text-[13.5px] font-semibold text-[#191F28] text-right tabular-nums'}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Notice({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'red' | 'blue' }) {
  const cls = {
    gray: 'bg-[#F7F8FA] text-[#4E5968]',
    red: 'bg-[#FDECEC] text-[#C53030]',
    blue: 'bg-[#EAF2FF] text-[#1E5BD6]',
  }[tone];
  return <p className={`rounded-[12px] px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-line ${cls}`}>{children}</p>;
}

// ── 현재 요금제 ──────────────────────────────────────────────────────────────────
function PlanSection({ data }: { data: StudioSubscriptionResponse | null }) {
  if (!data) {
    return (
      <Card title={'현재 요금제'}>
        <Notice>요금제 정보를 불러오지 못했어요.{'\n'}원장 계정으로 로그인했는지 확인해주세요.</Notice>
      </Card>
    );
  }
  const sub = data.subscription;
  if (!sub) {
    return (
      <Card title={'현재 요금제'}>
        <Notice>이용 중인 요금제가 없어요.{'\n'}가입 전이거나, 해지 또는 미납으로 이용이 종료된 상태예요.</Notice>
      </Card>
    );
  }

  const ended = sub.status === 'Ended';
  const change = hasPlanChange(sub);
  const sp = sub.scheduledPlan;

  return (
    <Card title={'현재 요금제'}>
      <div className={'flex items-center justify-between gap-3'}>
        <div className={'min-w-0'}>
          <p className={'text-[20px] font-bold text-[#191F28] truncate'}>{planName(sub.type, sub.planDisplayName)}</p>
          <p className={'mt-0.5 text-[13px] text-[#8B95A1]'}>
            {sub.isTrial ? '무료 체험' : sub.billingCycle ? `${CYCLE_LABEL[sub.billingCycle] ?? sub.billingCycle} 결제` : '-'}
          </p>
        </div>
        <div className={'shrink-0 flex flex-col items-end gap-1.5'}>
          {ended
            ? <Badge tone={'red'} dot>해지 예정</Badge>
            : sub.isTrial
              ? <Badge tone={'blue'} dot>체험 중</Badge>
              : <Badge tone={'green'} dot>이용 중</Badge>}
        </div>
      </div>

      <InfoList rows={[
        { label: '이용 기간', value: `${dot(sub.startDate)} ~ ${dot(sub.endDate)}` },
        ...(!ended ? [{ label: '다음 결제일', value: dot(sub.nextPaymentDate) }] : []),
      ]}/>

      {sub.isTrial && sp && (
        <Notice tone={'blue'}>
          체험이 {dot(sub.endDate)}에 끝나요.{'\n'}
          {sp.date ? `${dot(sp.date)}부터 ` : '이후 '}{planName(sp.type, sp.planDisplayName)}{sp.billingCycle ? ` ${CYCLE_LABEL[sp.billingCycle] ?? sp.billingCycle}` : ''} 요금제로 결제돼요.
        </Notice>
      )}
      {!sub.isTrial && change && sp && (
        <Notice tone={'blue'}>
          {sp.date ? `${dot(sp.date)}부터 ` : ''}{planName(sp.type, sp.planDisplayName)}{sp.billingCycle ? ` ${CYCLE_LABEL[sp.billingCycle] ?? sp.billingCycle}` : ''} 요금제로 바뀌어요.
        </Notice>
      )}
      {ended && (
        <Notice tone={'red'}>해지가 예약됐어요. {dot(sub.endDate)}까지 이용할 수 있어요.</Notice>
      )}
    </Card>
  );
}

// ── 카드 등록 폼 ──────────────────────────────────────────────────────────────────
function AddCardForm({ onDone, onCancel }: { onDone: (billingKey: string) => Promise<void>; onCancel: () => void }) {
  const [cardNumber, setCardNumber] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [birth, setBirth] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawCard = cardNumber.replace(/\D/g, '');
  const canSubmit = rawCard.length >= 15 && month.length === 2 && year.length === 2 && (birth.length === 6 || birth.length === 10) && password.length === 2 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    const m = Number(month);
    if (m < 1 || m > 12) { setError('유효기간 월을 확인해주세요'); return; }
    setSubmitting(true);
    setError(null);
    const req: CreateBillingRequest = {
      cardNumber: rawCard,
      expiryMonth: month,
      expiryYear: year,
      birthOrBusinessRegistrationNumber: birth,
      passwordTwoDigits: password,
    };
    const res = await addBillingCardAction(req);
    if (!res.ok) { setError(res.message); setSubmitting(false); return; }
    await onDone(res.billingKey);
    setSubmitting(false);
  };

  const small = `${inputCls} text-center`;

  return (
    <div className={'rounded-[14px] border border-[#EEF0F2] bg-[#FAFBFC] p-3.5 flex flex-col gap-3'}>
      <label className={'block'}>
        <span className={'block text-[12.5px] font-semibold text-[#4E5968]'}>카드번호</span>
        <input
          type={'text'} inputMode={'numeric'} autoComplete={'cc-number'} maxLength={19}
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 '))}
          placeholder={'1234 5678 9012 3456'} disabled={submitting} className={`${inputCls} mt-1.5 tracking-[1px]`}
        />
      </label>
      <div className={'grid grid-cols-2 gap-2.5'}>
        <div>
          <span className={'block text-[12.5px] font-semibold text-[#4E5968]'}>유효기간</span>
          <div className={'mt-1.5 flex items-center rounded-[12px] border border-[#E5E7EB] bg-white focus-within:border-[#1E2124]'}>
            <input
              type={'text'} inputMode={'numeric'} autoComplete={'cc-exp-month'} maxLength={2}
              value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder={'MM'} disabled={submitting} aria-label={'유효기간 월'}
              className={'w-0 flex-1 min-w-0 bg-transparent py-3 pl-3.5 text-[15px] text-black placeholder-[#B1B8BE] outline-none text-center disabled:opacity-60'}
            />
            <span className={'shrink-0 text-[15px] text-[#B1B8BE]'}>/</span>
            <input
              type={'text'} inputMode={'numeric'} autoComplete={'cc-exp-year'} maxLength={2}
              value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder={'YY'} disabled={submitting} aria-label={'유효기간 연도'}
              className={'w-0 flex-1 min-w-0 bg-transparent py-3 pr-3.5 text-[15px] text-black placeholder-[#B1B8BE] outline-none text-center disabled:opacity-60'}
            />
          </div>
        </div>
        <label className={'block'}>
          <span className={'block text-[12.5px] font-semibold text-[#4E5968]'}>비밀번호 앞 2자리</span>
          <input
            type={'password'} inputMode={'numeric'} maxLength={2}
            value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder={'••'} disabled={submitting} className={`${small} mt-1.5`}
          />
        </label>
      </div>
      <label className={'block'}>
        <span className={'block text-[12.5px] font-semibold text-[#4E5968]'}>생년월일 6자리 또는 사업자등록번호 10자리</span>
        <input
          type={'text'} inputMode={'numeric'} maxLength={10}
          value={birth} onChange={(e) => setBirth(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder={'YYMMDD'} disabled={submitting} className={`${inputCls} mt-1.5`}
        />
      </label>
      {error && <p className={'text-[13px] text-[#E55B5B] font-medium whitespace-pre-line'}>{error}</p>}
      <div className={'flex gap-2'}>
        <button type={'button'} onClick={onCancel} disabled={submitting} className={'flex-1 h-[46px] rounded-[12px] bg-white border border-[#E5E7EB] text-[14px] font-semibold text-[#4E5968] active:scale-[0.98] transition-transform disabled:opacity-50'}>취소</button>
        <button type={'button'} onClick={submit} disabled={!canSubmit} className={'flex-[1.4] h-[46px] rounded-[12px] bg-[#1E2124] text-[14px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-40'}>
          {submitting ? '등록 중…' : '등록하기'}
        </button>
      </div>
    </div>
  );
}

// ── 결제수단 ──────────────────────────────────────────────────────────────────────
export function PaymentSettingsForm({ initialSubscription, initialCards, studioName }: {
  initialSubscription: StudioSubscriptionResponse | null;
  initialCards: BillingCard[] | null;
  studioName?: string;
}) {
  const [subscription, setSubscription] = useState(initialSubscription);
  const [cards, setCards] = useState(initialCards);
  const [adding, setAdding] = useState(false);
  const [settingRep, setSettingRep] = useState<string | null>(null);
  const [repError, setRepError] = useState<string | null>(null);

  const repKey = subscription?.representativeBillingKey ?? null;
  // 대표 카드가 다른 계정(원장)이 등록한 것이면 GET /billing(토큰 유저 기준)엔 안 보인다
  const repMissingFromList = !!repKey && !!cards && !cards.some((c) => c.billingKey === repKey);

  const refreshCards = async () => setCards(await getBillingCardsAction());
  const refreshSubscription = async () => {
    const next = await getStudioSubscriptionAction();
    if (next) setSubscription(next);
  };

  const setRepresentative = async (billingKey: string, silent = false) => {
    setSettingRep(billingKey);
    setRepError(null);
    const res = await setRepresentativeBillingAction(billingKey);
    if (!res.ok) {
      if (!silent) setRepError(res.message);
      setSettingRep(null);
      return false;
    }
    await refreshSubscription();
    setSettingRep(null);
    if (!silent) showToast('대표 결제수단을 변경했어요');
    return true;
  };

  // 등록 성공 → 목록 재조회(성공 응답엔 카드 정보가 없다) → 대표 카드가 없으면 방금 카드를 대표로
  const onAdded = async (billingKey: string) => {
    await refreshCards();
    let madeRep = false;
    if (!repKey) madeRep = await setRepresentative(billingKey, true);
    setAdding(false);
    showToast(madeRep ? '결제수단을 등록하고 대표로 지정했어요' : '결제수단을 등록했어요');
  };

  return (
    <SettingShell title={'요금제·결제수단'} subtitle={studioName}>
      <PlanSection data={subscription}/>

      <Card title={'결제수단'} desc={'매월 1일 요금제 결제에 쓰이는 카드예요. 대표 카드로 결제돼요.'}>
        {subscription && !repKey && (
          <Notice tone={'red'}>대표 결제수단이 없어요. 이대로면 다음 결제가 실패해요.{'\n'}카드를 등록하거나 아래 목록에서 대표로 지정해주세요.</Notice>
        )}
        {repMissingFromList && (
          <Notice>대표 카드가 다른 계정으로 등록돼 있어 이 목록에는 보이지 않아요. 변경하려면 등록한 계정으로 로그인해주세요.</Notice>
        )}

        {cards === null ? (
          <Notice>결제수단 목록을 불러오지 못했어요.</Notice>
        ) : cards.length === 0 && !adding ? (
          <p className={'py-3 text-center text-[13.5px] text-[#8B95A1]'}>등록된 결제수단이 없어요</p>
        ) : (
          <ul className={'flex flex-col divide-y divide-[#F1F3F6] -mx-1'}>
            {cards.map((c) => {
              const isRep = c.billingKey === repKey;
              return (
                <li key={c.billingKey} className={'flex items-center gap-3 px-1 py-3'}>
                  <span className={'w-[40px] h-[40px] rounded-[12px] bg-[#F4F5F7] flex items-center justify-center shrink-0'}>
                    <CreditCard size={20} strokeWidth={1.6} color={'#1F1F1F'}/>
                  </span>
                  <div className={'flex-1 min-w-0'}>
                    <div className={'flex items-center gap-1.5'}>
                      <p className={'text-[14.5px] font-semibold text-[#191F28] truncate'}>{c.cardName || '카드'}</p>
                      {isRep && <Badge tone={'dark'}>대표</Badge>}
                    </div>
                    <p className={'mt-0.5 text-[12.5px] text-[#8B95A1] tabular-nums'}>
                      {groupCard(c.cardNumber)}{c.createdAt ? ` · ${dateOnly(c.createdAt)} 등록` : ''}
                    </p>
                  </div>
                  {!isRep && (
                    <button
                      type={'button'}
                      onClick={() => setRepresentative(c.billingKey)}
                      disabled={settingRep !== null}
                      className={'shrink-0 h-[32px] px-3 rounded-full border border-[#E5E7EB] bg-white text-[12.5px] font-semibold text-[#4E5968] flex items-center gap-1 active:bg-[#F4F5F7] disabled:opacity-50'}
                    >
                      <Star size={13} strokeWidth={2}/>
                      {settingRep === c.billingKey ? '지정 중…' : '대표로 지정'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {repError && <p className={'text-[13px] text-[#E55B5B] font-medium'}>{repError}</p>}

        {adding ? (
          <AddCardForm onDone={onAdded} onCancel={() => setAdding(false)}/>
        ) : (
          <button
            type={'button'}
            onClick={() => setAdding(true)}
            className={'w-full h-[48px] rounded-[12px] border border-dashed border-[#D1D6DB] bg-white text-[14px] font-semibold text-[#4E5968] flex items-center justify-center gap-1.5 active:bg-[#F4F5F7] transition-colors'}
          >
            <Plus size={16} strokeWidth={2.2}/>
            결제수단 추가
          </button>
        )}
      </Card>
    </SettingShell>
  );
}
