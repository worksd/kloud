'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Search } from 'lucide-react';
import { StudentListItemResponse } from '@/app/endpoint/student.endpoint';
import { GetPassPlanResponse } from '@/app/endpoint/pass.endpoint';
import { LessonPricePolicyResponse } from '@/app/endpoint/payment.endpoint';
import { ManualPaymentItem } from '@/app/endpoint/payment.record.endpoint';
import { createAdminManualPaymentAction, getKioskLessonPoliciesAction, searchStudentsAction } from '@/app/kiosk/kiosk.actions';
import { getStudioPassPlansAction } from '@/app/admin/admin.onsite.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import type { AdminSheetLesson } from '@/app/admin/AdminShortcuts';

/**
 * 관리자 홈 현장결제 다이얼로그 — 수강생 검색 → 상품(오늘 수업 | 패스권) → 금액 확인 → POST /paymentRecords/manual(admin).
 * 키오스크 상담실(admin) 현장결제와 같은 규칙: 가격 정책 수업은 item 'lesson-group' + 정책 id로 보낸다
 * (수업 id 그대로 보내면 회차 1장 결제가 된다). 금액은 편집 가능하고 서버는 보낸 amount로 기록한다.
 */

type Step = 'student' | 'item' | 'policy' | 'amount';
type Picked =
  | { kind: 'lesson'; lesson: AdminSheetLesson; policy?: LessonPricePolicyResponse }
  | { kind: 'pass-plan'; plan: GetPassPlanResponse };

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const val = (s?: string) => (s && s !== '-' ? s : undefined);
const phoneOf = (phone?: string) => {
  const d = val(phone)?.replace(/\D/g, '');
  if (!d) return undefined;
  return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d;
};

const pickedTitle = (p: Picked) =>
  p.kind === 'lesson' ? `${p.lesson.title}${p.policy?.name ? ` · ${p.policy.name}` : ''}` : p.plan.name;
const pickedPrice = (p: Picked) =>
  p.kind === 'lesson' ? (p.policy?.price ?? p.lesson.price ?? 0) : (p.plan.price ?? 0);

export function AdminOnsitePaymentDialog({ open, studioId, lessons, onClose, onPaid }: {
  open: boolean;
  studioId: number;
  /** 오늘 수업 — 서버에서 미리 포맷해 내려온 목록 */
  lessons: AdminSheetLesson[];
  onClose: () => void;
  onPaid?: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [step, setStep] = useState<Step>('student');

  // 1) 수강생
  const [keyword, setKeyword] = useState('');
  const [students, setStudents] = useState<StudentListItemResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<StudentListItemResponse | null>(null);
  const seq = useRef(0);

  // 2) 상품
  const [tab, setTab] = useState<'lesson' | 'pass'>('lesson');
  const [plans, setPlans] = useState<GetPassPlanResponse[] | null>(null);
  const [policies, setPolicies] = useState<LessonPricePolicyResponse[]>([]);
  const [pendingLesson, setPendingLesson] = useState<AdminSheetLesson | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [picked, setPicked] = useState<Picked | null>(null);

  // 3) 금액
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const payingRef = useRef(false);

  // 열릴 때마다 처음부터
  useEffect(() => {
    if (!open) return;
    setClosing(false); setStep('student');
    setKeyword(''); setStudents([]); setStudent(null);
    setTab('lesson'); setPicked(null); setPolicies([]); setPendingLesson(null);
    setAmount(''); setError(null);
  }, [open]);

  // 수강생 검색 — 300ms 디바운스, 숫자만이면 전화번호 뒷자리 일치
  useEffect(() => {
    if (!open) return;
    const q = keyword.trim();
    if (!q) { setStudents([]); setSearching(false); return; }
    const id = ++seq.current;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchStudentsAction(q, /^\d+$/.test(q.replace(/[\s-]/g, '')) ? 'PhoneSuffix' : undefined);
        if (seq.current !== id) return;
        setStudents(!isGuinnessErrorCase(res) && 'students' in res ? res.students : []);
      } finally {
        if (seq.current === id) setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, open]);

  // 패스권 탭 첫 진입 시 한 번만 조회
  useEffect(() => {
    if (!open || tab !== 'pass' || plans !== null) return;
    getStudioPassPlansAction(studioId).then(setPlans).catch(() => setPlans([]));
  }, [open, tab, plans, studioId]);

  const close = () => {
    if (payingRef.current || closing) return;
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  const goAmount = (p: Picked) => {
    setPicked(p);
    setAmount(String(pickedPrice(p)));
    setError(null);
    setStep('amount');
  };

  // 수업 선택 — 가격 정책이 있으면 방식부터 고른다
  const onLesson = async (lesson: AdminSheetLesson) => {
    setLoadingItem(true);
    try {
      const list = (await getKioskLessonPoliciesAction(lesson.id)).filter((p) => p.status !== 'Cancelled');
      if (list.length === 0) { goAmount({ kind: 'lesson', lesson }); return; }
      setPendingLesson(lesson);
      setPolicies(list);
      setStep('policy');
    } finally {
      setLoadingItem(false);
    }
  };

  const submit = async () => {
    if (payingRef.current || !student || !picked) return;
    const n = Math.round(Number(amount.replace(/[^\d]/g, '')));
    if (!Number.isFinite(n) || n <= 0) { setError('금액을 확인해주세요'); return; }
    payingRef.current = true;
    setPaying(true);
    setError(null);
    try {
      const item: ManualPaymentItem = picked.kind === 'pass-plan' ? 'pass-plan' : picked.policy ? 'lesson-group' : 'lesson';
      const itemId = picked.kind === 'pass-plan' ? picked.plan.id : (picked.policy?.id ?? picked.lesson.id);
      const res = await createAdminManualPaymentAction({ item, itemId, targetUserId: student.userId, amount: n });
      if (isGuinnessErrorCase(res) || !('paymentId' in res)) {
        setError((res as { message?: string })?.message || '결제 기록에 실패했어요');
        return;
      }
      window.KloudEvent?.showToast?.('현장결제를 기록했어요');
      onPaid?.();
      payingRef.current = false;
      setClosing(true);
      setTimeout(() => { setClosing(false); onClose(); }, 200);
    } catch {
      setError('요청에 실패했어요');
    } finally {
      payingRef.current = false;
      setPaying(false);
    }
  };

  if (!open) return null;

  const back = () => {
    if (step === 'item') setStep('student');
    else if (step === 'policy') setStep('item');
    else if (step === 'amount') setStep(picked?.kind === 'lesson' && picked.policy ? 'policy' : 'item');
  };
  const title = step === 'student' ? '누구의 결제인가요?' : step === 'item' ? '무엇을 결제하나요?' : step === 'policy' ? '수강 방식' : '금액 확인';
  const rowCls = 'w-full flex items-center gap-3 px-2 py-2.5 rounded-[14px] active:bg-[#F7F8F9] transition-colors text-left';
  const priceCls = 'shrink-0 text-[14px] font-bold text-black';

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-6 ${
        closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
      onClick={close}
    >
      <div className={'absolute inset-0 bg-black/40'}/>
      <div
        className={'relative w-full max-w-[380px] max-h-[78vh] bg-white rounded-[24px] pt-5 pb-4 flex flex-col animate-[scaleIn_260ms_ease-out]'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 줄 — 첫 단계 외에는 뒤로가기 */}
        <div className={'px-4 flex items-center gap-1'}>
          {step !== 'student' && (
            <button type={'button'} onClick={back} disabled={paying} aria-label={'이전'} className={'w-8 h-8 -ml-1 rounded-full flex items-center justify-center active:bg-[#F2F4F6]'}>
              <ChevronLeft size={22} strokeWidth={1.8} className={'text-[#191F28]'}/>
            </button>
          )}
          <div className={'min-w-0'}>
            <p className={'text-[11.5px] font-semibold text-[#8B95A1]'}>현장결제</p>
            <p className={'text-[17px] font-bold text-black truncate'}>{title}</p>
          </div>
        </div>

        {/* 고른 수강생 — 2단계부터 상단에 고정 */}
        {student && step !== 'student' && (
          <p className={'mx-5 mt-3 rounded-[12px] bg-[#F7F8F9] px-3 py-2 text-[13px] text-[#4E5968] truncate'}>
            <span className={'font-bold text-black'}>{val(student.name) ?? val(student.nickName)}</span>
            {phoneOf(student.phone) && <span> · {phoneOf(student.phone)}</span>}
          </p>
        )}

        {/* 1) 수강생 검색 */}
        {step === 'student' && (
          <>
            <div className={'mx-5 mt-3 flex items-center gap-2 rounded-[12px] border border-[#E5E7EB] px-3 py-2.5 focus-within:border-[#1E2124]'}>
              <Search size={17} strokeWidth={1.8} className={'shrink-0 text-[#8B95A1]'}/>
              <input
                type={'search'}
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={'이름 또는 전화번호 뒤 4자리'}
                className={'flex-1 min-w-0 bg-transparent text-[15px] text-black placeholder-[#B1B8BE] outline-none'}
              />
            </div>
            <ul className={'mt-2 flex-1 min-h-[160px] overflow-y-auto px-3 flex flex-col'}>
              {!keyword.trim() ? (
                <p className={'px-3 py-10 text-center text-[13px] text-[#8B95A1]'}>결제할 수강생을 검색해주세요</p>
              ) : searching && students.length === 0 ? (
                <p className={'px-3 py-10 text-center text-[13px] text-[#8B95A1]'}>검색 중…</p>
              ) : students.length === 0 ? (
                <p className={'px-3 py-10 text-center text-[13px] text-[#8B95A1]'}>검색 결과가 없어요</p>
              ) : students.map((st) => {
                const name = val(st.name) ?? val(st.nickName) ?? '-';
                return (
                  <li key={st.id}>
                    <button type={'button'} onClick={() => { setStudent(st); setStep('item'); }} className={rowCls}>
                      <span className={'relative w-[38px] h-[38px] rounded-[12px] bg-[#F7F8FA] overflow-hidden flex items-center justify-center shrink-0 text-[14px] font-bold text-[#4E5968]'}>
                        {st.profileImageUrl ? <Image src={st.profileImageUrl} alt={''} fill sizes={'38px'} className={'object-cover'}/> : name.slice(0, 1)}
                      </span>
                      <span className={'flex-1 min-w-0'}>
                        <span className={'block text-[14.5px] font-bold text-black truncate'}>{name}</span>
                        <span className={'block text-[12px] text-[#8B95A1] truncate'}>{phoneOf(st.phone) ?? '연락처 없음'}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* 2) 상품 — 오늘 수업 | 패스권 */}
        {step === 'item' && (
          <>
            <div className={'mx-5 mt-3 flex gap-1.5'}>
              {([['lesson', '오늘 수업'], ['pass', '패스권']] as const).map(([k, label]) => (
                <button
                  key={k}
                  type={'button'}
                  onClick={() => setTab(k)}
                  aria-pressed={tab === k}
                  className={`h-[32px] px-3.5 rounded-full text-[13px] font-semibold transition-colors ${tab === k ? 'bg-[#1F1F1F] text-white' : 'bg-white text-[#4E5968] border border-[#EEF0F2]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className={`mt-2 flex-1 min-h-[160px] overflow-y-auto px-3 flex flex-col transition-opacity ${loadingItem ? 'opacity-50 pointer-events-none' : ''}`}>
              {tab === 'lesson' ? (
                lessons.length === 0 ? (
                  <p className={'px-3 py-10 text-center text-[13px] text-[#8B95A1]'}>오늘 수업이 없어요</p>
                ) : lessons.map((l) => (
                  <li key={l.id}>
                    <button type={'button'} onClick={() => onLesson(l)} className={rowCls}>
                      <span className={'flex-1 min-w-0'}>
                        {l.timeLabel && <span className={'block text-[11.5px] font-bold text-[#4E5968]'}>{l.timeLabel}</span>}
                        <span className={'block text-[14.5px] font-bold text-black truncate'}>{l.title}</span>
                        {l.subLabel && <span className={'block text-[12px] text-[#8B95A1] truncate'}>{l.subLabel}</span>}
                      </span>
                      {typeof l.price === 'number' && <span className={priceCls}>{fmt(l.price)}원</span>}
                    </button>
                  </li>
                ))
              ) : plans === null ? (
                <p className={'px-3 py-10 text-center text-[13px] text-[#8B95A1]'}>불러오는 중…</p>
              ) : plans.length === 0 ? (
                <p className={'px-3 py-10 text-center text-[13px] text-[#8B95A1]'}>판매 중인 패스권이 없어요</p>
              ) : plans.map((p) => (
                <li key={p.id}>
                  <button type={'button'} onClick={() => goAmount({ kind: 'pass-plan', plan: p })} className={rowCls}>
                    <span className={'flex-1 min-w-0 block text-[14.5px] font-bold text-black truncate'}>{p.name}</span>
                    {typeof p.price === 'number' && <span className={priceCls}>{fmt(p.price)}원</span>}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* 2-1) 가격 정책 수업의 방식 */}
        {step === 'policy' && pendingLesson && (
          <ul className={'mt-3 flex-1 min-h-[120px] overflow-y-auto px-3 flex flex-col'}>
            {policies.map((p) => (
              <li key={p.id}>
                <button
                  type={'button'}
                  disabled={p.usable === false}
                  onClick={() => goAmount({ kind: 'lesson', lesson: pendingLesson, policy: p })}
                  className={`${rowCls} disabled:opacity-40`}
                >
                  <span className={'flex-1 min-w-0'}>
                    <span className={'block text-[14.5px] font-bold text-black truncate'}>{p.name ?? `${p.lessonCount}회`}</span>
                    {p.description && <span className={'block text-[12px] text-[#8B95A1] truncate'}>{p.description}</span>}
                  </span>
                  <span className={priceCls}>{fmt(p.price)}원</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 3) 금액 확인 */}
        {step === 'amount' && picked && (
          <div className={'px-5 mt-3'}>
            <p className={'text-[13px] font-semibold text-[#8B95A1]'}>상품</p>
            <p className={'mt-0.5 text-[15px] font-bold text-black'}>{pickedTitle(picked)}</p>
            <p className={'mt-4 text-[13px] font-semibold text-black'}>결제 금액</p>
            <div className={'mt-1.5 flex items-center rounded-[12px] border border-[#E5E7EB] px-3.5 focus-within:border-[#1E2124]'}>
              <input
                type={'text'}
                inputMode={'numeric'}
                value={amount ? fmt(Number(amount)) : ''}
                onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, '')); setError(null); }}
                disabled={paying}
                className={'flex-1 min-w-0 py-3 text-[17px] font-bold text-black outline-none bg-transparent disabled:opacity-60'}
              />
              <span className={'text-[15px] font-bold text-[#4E5968]'}>원</span>
            </div>
            {pickedPrice(picked) > 0 && Number(amount) !== pickedPrice(picked) && (
              <p className={'mt-1.5 text-[12px] text-[#8B95A1]'}>정가 {fmt(pickedPrice(picked))}원</p>
            )}
            {error && <p className={'mt-2 text-[13px] text-[#E55B5B] font-medium'}>{error}</p>}
            <button
              type={'button'}
              onClick={submit}
              disabled={paying}
              className={'mt-5 w-full h-[50px] rounded-[14px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
            >
              {paying ? '기록 중…' : '현장결제로 기록'}
            </button>
          </div>
        )}

        {step !== 'amount' && (
          <div className={'px-5 pt-3'}>
            <button type={'button'} onClick={close} className={'w-full h-[46px] rounded-[12px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform'}>
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
