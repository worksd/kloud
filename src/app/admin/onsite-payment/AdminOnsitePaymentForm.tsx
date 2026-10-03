'use client';

import { showToast, TOAST_LINGER_MS } from '@/app/components/toast.host';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CalendarDays, Search, UserPlus } from 'lucide-react';
import { StudentListItemResponse } from '@/app/endpoint/student.endpoint';
import { GetPassPlanResponse } from '@/app/endpoint/pass.endpoint';
import { LessonPricePolicyResponse } from '@/app/endpoint/payment.endpoint';
import { CreateManualPaymentRecordRequest, ManualPaymentItem } from '@/app/endpoint/payment.record.endpoint';
import { getKioskLessonPoliciesAction, searchStudentsAction } from '@/app/kiosk/kiosk.actions';
import { createOnsitePaymentAction, getOnsiteLessonsAction, getStudioPassPlansAction } from '@/app/admin/admin.onsite.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { kloudNav } from '@/app/lib/kloudNav';
import { formatFeatureDescription, formatRuleDescription } from '@/utils/pass.description';
import { AdminDetailHeader } from '@/app/admin/AdminDetailHeader';
import type { AdminSheetLesson } from '@/app/admin/AdminShortcuts';

/**
 * 관리자 현장결제 페이지 — 수강생 찾기(없으면 새로 등록) → 수강권(날짜별 수업) | 패스권 → 금액 확인 → POST /paymentRecords/manual.
 * 화면 문구에 '상품'은 쓰지 않는다 — 수업이면 수강권, 패스면 패스권.
 * 수업 탭은 오늘이 기본이고 날짜를 바꾸면 그 날 수업을 서버 액션으로 다시 불러온다(날짜별 캐시).
 * 헤더 뒤로가기는 첫 단계에서만 화면을 닫고, 그 뒤로는 이전 단계로 간다.
 *
 * 가이드(docs 현장결제 연동)의 규칙:
 * - 가격 정책 수업은 item 'lesson-group' + 정책 id (수업 id 그대로 보내면 회차 1장 결제).
 * - 수단은 항상 admin(현장결제, Completed). 금액이 0이면 서버가 free로 바꿔 저장한다.
 * - 대상: targetUserId(회원) 또는 phone+name(비회원 → 서버가 계정 생성).
 * - 패스권 startDate는 'yyyy.MM.dd'. 비우면 서버 기본(정규반은 남은 패스 만료 다음 날, 아니면 오늘).
 */

type Step = 'student' | 'newStudent' | 'item' | 'policy' | 'amount';
type Target =
  | { kind: 'member'; student: StudentListItemResponse }
  | { kind: 'guest'; name: string; phone: string };
type Picked =
  | { kind: 'lesson'; lesson: AdminSheetLesson; policy?: LessonPricePolicyResponse }
  | { kind: 'pass-plan'; plan: GetPassPlanResponse };

const STEP_TITLE: Record<Step, string> = {
  student: '수강생 찾기', newStudent: '새 수강생 등록', item: '무엇을 결제하나요?', policy: '수강 방식', amount: '금액 확인',
};

/** 가이드 5번·3번의 오류 코드 → 화면 문구. 없는 코드는 서버 message 그대로 */
const ERROR_MESSAGES: Record<string, string> = {
  LESSON_LIMIT_EXCEED: '정원이 다 찼어요',
  INVALID_LESSON_STATUS: '지금은 판매하지 않는 수업이에요',
  HAS_NO_PASS: '이 수업을 들을 수 있는 패스가 없는 수강생이에요',
  PASS_PLAN_NOT_READY: '판매 중단된 패스권이에요',
  PASS_END_DATE_BEFORE_START_DATE: '종료일이 시작일보다 앞서요',
  LESSON_GROUP_CANCELLED: '판매 중단된 정기수업이에요',
  LESSON_GROUP_PRICE_PLAN_REQUIRED: '가격 정책에 회차 수가 없어요',
  LESSON_GROUP_TICKET_ALREADY_EXISTS: '같은 기간에 이미 계약이 있어요',
  LESSON_GROUP_DELAYED_TICKET_EXISTS: '미납 회차가 있어요. 먼저 정리해주세요',
  LESSON_GROUP_LESSON_NOT_AVAILABLE: '그 날짜에 열리는 회차가 없어요',
  INVALID_PHONE_FORMAT: '전화번호를 확인해주세요',
  ACCESS_DENIED: '이 학원의 수강권·패스권만 결제할 수 있어요',
  PHONE_ALREADY_EXISTS: '이미 등록된 전화번호예요. 검색해서 골라주세요',
};

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const pad = (n: number) => String(n).padStart(2, '0');
const val = (s?: string) => (s && s !== '-' ? s : undefined);
const digitsOf = (s?: string) => (s ?? '').replace(/\D/g, '');
const phoneOf = (phone?: string) => {
  const d = digitsOf(val(phone));
  if (!d) return undefined;
  return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d;
};
/** <input type="date"> 값 정규화 — 삼성 WebView는 '2026.06.23'처럼 내려준다. AdminPaymentsSheet와 같은 처리 */
const normalizeDateInput = (el: HTMLInputElement): string => {
  const v = el.valueAsDate;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
  const m = el.value.match(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/);
  return m ? `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}` : '';
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
/** 'yyyy-MM-dd' → '오늘' 또는 'M월 D일 (요일)' */
const dateLabelOf = (key: string, today: string): string => {
  if (key === today) return '오늘';
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return key;
  return `${m}월 ${d}일 (${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`;
};

const targetName = (t: Target) => (t.kind === 'member' ? (val(t.student.name) ?? val(t.student.nickName) ?? '-') : t.name);
const targetPhone = (t: Target) => phoneOf(t.kind === 'member' ? t.student.phone : t.phone);
/** 수강권 가격 — 항상 자리를 채운다. 0원은 '무료', 값이 없으면 '-' */
const lessonPriceLabel = (price?: number) => (typeof price !== 'number' ? '-' : price === 0 ? '무료' : `${fmt(price)}원`);
/** 패스권 첫 혜택 한 줄 — 첫 rule → 첫 feature → 서버 benefits 순 (RecommendedPassPlanItem과 같은 규칙). 관리자 화면은 한국어 고정 */
const passBenefitLabel = (p: GetPassPlanResponse): string | undefined => {
  const rule = p.rules?.[0];
  if (rule?.target && rule?.benefit) {
    return formatRuleDescription({ target: rule.target, benefit: rule.benefit, duration: rule.duration, excludes: rule.excludes }, 'ko', p.name);
  }
  const feature = p.features?.[0];
  if (feature) return formatFeatureDescription(feature.key, 'ko', feature.value) || undefined;
  return p.benefits?.[0]?.title;
};

const pickedTitle = (p: Picked) =>
  p.kind === 'lesson' ? `${p.lesson.title}${p.policy?.name ? ` · ${p.policy.name}` : ''}` : p.plan.name;
const pickedPrice = (p: Picked) =>
  p.kind === 'lesson' ? (p.policy?.price ?? p.lesson.price ?? 0) : (p.plan.price ?? 0);

// 스타일 — 관리자 설정 화면과 같은 톤(흰 카드 on #F7F8FA)
const cardCls = 'mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2]';
const rowCls = 'w-full flex items-center gap-3 px-3 py-3 active:bg-[#F7F8F9] transition-colors text-left';
const priceCls = 'shrink-0 text-[14px] font-bold text-black';
const fieldCls = 'mt-1.5 flex items-center rounded-[12px] border border-[#E5E7EB] bg-white px-3.5 focus-within:border-[#1E2124]';
const inputCls = 'flex-1 min-w-0 py-3 text-[15px] font-semibold text-black outline-none bg-transparent placeholder-[#B1B8BE] disabled:opacity-60';
const labelCls = 'text-[13px] font-semibold text-black';
const emptyCls = 'px-4 py-12 text-center text-[13px] text-[#8B95A1]';
const pillCls = (on: boolean) =>
  `h-[34px] px-4 rounded-full text-[13px] font-semibold transition-colors ${on ? 'bg-[#1F1F1F] text-white' : 'bg-white text-[#4E5968] border border-[#EEF0F2]'}`;

/** 하단 고정 CTA — 홈 인디케이터 위 */
const BottomCta = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
  <div className={'fixed bottom-0 inset-x-0 z-20 px-4 pt-3 bg-[#F7F8FA]/95 backdrop-blur-sm'} style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
    <button
      type={'button'}
      onClick={onClick}
      disabled={disabled}
      className={'w-full h-[52px] rounded-[14px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
    >
      {label}
    </button>
  </div>
);

export function AdminOnsitePaymentForm({ studioId, lessons, today }: {
  studioId: number;
  /** 오늘 수업 — 서버에서 미리 포맷해 내려온 목록 */
  lessons: AdminSheetLesson[];
  /** KST 오늘 'yyyy-MM-dd' — 수업 탭 기본 날짜 */
  today: string;
}) {
  const [step, setStep] = useState<Step>('student');

  // 1) 대상 — 검색으로 고른 회원, 또는 새로 등록하는 비회원
  const [keyword, setKeyword] = useState('');
  const [students, setStudents] = useState<StudentListItemResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newError, setNewError] = useState<string | null>(null);
  const seq = useRef(0);

  // 2) 수강권 | 패스권
  const [tab, setTab] = useState<'lesson' | 'pass'>('lesson');
  const [date, setDate] = useState(today);
  // 날짜별 수업 캐시 — 오늘은 서버에서 내려온 목록으로 시작
  const [lessonsByDate, setLessonsByDate] = useState<Record<string, AdminSheetLesson[]>>({ [today]: lessons });
  const [loadingLessons, setLoadingLessons] = useState(false);
  const lessonSeq = useRef(0);
  const [plans, setPlans] = useState<GetPassPlanResponse[] | null>(null);
  const [policies, setPolicies] = useState<LessonPricePolicyResponse[]>([]);
  const [pendingLesson, setPendingLesson] = useState<AdminSheetLesson | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [picked, setPicked] = useState<Picked | null>(null);

  // 3) 금액
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(''); // yyyy-MM-dd, 패스권만
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const payingRef = useRef(false);
  // 확인 다이얼로그 — '현장결제 하기'는 요약만 띄우고, 다이얼로그의 확인이 실제로 API를 보낸다
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmClosing, setConfirmClosing] = useState(false);

  // 수강생 검색 — 300ms 디바운스, 숫자만이면 전화번호 뒷자리 일치
  useEffect(() => {
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
  }, [keyword]);

  // 패스권 탭 첫 진입 시 한 번만 조회
  useEffect(() => {
    if (tab !== 'pass' || plans !== null) return;
    getStudioPassPlansAction(studioId).then(setPlans).catch(() => setPlans([]));
  }, [tab, plans, studioId]);

  // 고른 날짜의 수업 — 캐시에 없으면 조회. 빠르게 날짜를 바꾸면 마지막 요청만 반영
  useEffect(() => {
    if (!date || lessonsByDate[date]) { setLoadingLessons(false); return; }
    const id = ++lessonSeq.current;
    setLoadingLessons(true);
    getOnsiteLessonsAction(studioId, date)
      .then((list) => { if (lessonSeq.current === id) setLessonsByDate((m) => ({ ...m, [date]: list })); })
      .finally(() => { if (lessonSeq.current === id) setLoadingLessons(false); });
  }, [date, lessonsByDate, studioId]);

  // 새 수강생 등록 — 검색어가 숫자면 전화번호, 아니면 이름으로 미리 채운다
  const openNewStudent = () => {
    const q = keyword.trim();
    const isPhone = /^\d+$/.test(q.replace(/[\s-]/g, ''));
    setNewName(isPhone ? '' : q);
    setNewPhone(isPhone ? digitsOf(q) : '');
    setNewError(null);
    setStep('newStudent');
  };
  const confirmNewStudent = () => {
    const name = newName.trim();
    const phone = digitsOf(newPhone);
    if (!name) { setNewError('이름을 입력해주세요'); return; }
    if (phone.length !== 11 || !phone.startsWith('01')) { setNewError('휴대폰 번호 11자리를 입력해주세요'); return; }
    setTarget({ kind: 'guest', name, phone });
    setStep('item');
  };

  const goAmount = (p: Picked) => {
    setPicked(p);
    setAmount(String(pickedPrice(p)));
    setStartDate('');
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

  /** 입력 금액 → 정수. 잘못됐으면 null */
  const parsedAmount = (): number | null => {
    const n = Math.round(Number(amount.replace(/[^\d]/g, '')));
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  // '현장결제 하기' — 검증만 하고 요약 다이얼로그를 연다
  const openConfirm = () => {
    if (payingRef.current || !target || !picked) return;
    if (parsedAmount() === null) { setError('금액을 확인해주세요'); return; }
    setError(null);
    setConfirmClosing(false);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    if (payingRef.current || confirmClosing) return;
    setConfirmClosing(true);
    setTimeout(() => { setConfirmOpen(false); setConfirmClosing(false); }, 200);
  };

  // 다이얼로그 확인 — 여기서만 POST /paymentRecords/manual
  const submit = async () => {
    if (payingRef.current || !target || !picked) return;
    const n = parsedAmount();
    if (n === null) { setError('금액을 확인해주세요'); setConfirmOpen(false); return; }

    payingRef.current = true;
    setPaying(true);
    setError(null);
    try {
      const item: ManualPaymentItem = picked.kind === 'pass-plan' ? 'pass-plan' : picked.policy ? 'lesson-group' : 'lesson';
      const itemId = picked.kind === 'pass-plan' ? picked.plan.id : (picked.policy?.id ?? picked.lesson.id);
      const body: CreateManualPaymentRecordRequest = {
        methodType: 'admin',
        item,
        itemId,
        amount: n,
        ...(target.kind === 'member'
          ? { targetUserId: target.student.userId }
          : { phone: target.phone, countryCode: '82', name: target.name }),
        ...(picked.kind === 'pass-plan' && startDate ? { startDate: startDate.replace(/-/g, '.') } : {}),
      };
      const res = await createOnsitePaymentAction(body);
      if (isGuinnessErrorCase(res) || !('paymentId' in res)) {
        const r = res as { code?: string; message?: string };
        setError((r.code && ERROR_MESSAGES[r.code]) || r.message || '결제에 실패했어요');
        setConfirmOpen(false);
        return;
      }
      showToast('현장결제를 기록했어요');
      // 토스트가 보일 시간을 둔 뒤 홈으로 — paying 플래그는 화면이 닫히는 동안 중복 탭을 막기 위해 그대로 둔다
      setTimeout(() => kloudNav.back(), TOAST_LINGER_MS);
      return;
    } catch {
      setError('요청에 실패했어요');
      setConfirmOpen(false);
    }
    payingRef.current = false;
    setPaying(false);
  };

  const back = () => {
    if (paying) return;
    if (step === 'newStudent' || step === 'item') setStep('student');
    else if (step === 'policy') setStep('item');
    else if (step === 'amount') setStep(picked?.kind === 'lesson' && picked.policy ? 'policy' : 'item');
  };

  return (
    <div className={'w-full min-h-screen overflow-x-clip bg-[#F7F8FA] pb-36'}>
      <AdminDetailHeader title={STEP_TITLE[step]} subtitle={'현장결제'} onBack={step === 'student' ? undefined : back}/>

      {/* 고른 대상 — 수강권·패스권 단계부터 상단에 고정 */}
      {target && step !== 'student' && step !== 'newStudent' && (
        <p className={'mx-4 mt-3 rounded-[12px] bg-white border border-[#EEF0F2] px-3.5 py-2.5 text-[13px] text-[#4E5968] truncate'}>
          <span className={'font-bold text-black'}>{targetName(target)}</span>
          {targetPhone(target) && <span> · {targetPhone(target)}</span>}
          {target.kind === 'guest' && <span className={'ml-1.5 text-[11.5px] font-semibold text-[#3182F6]'}>새 수강생</span>}
        </p>
      )}

      {/* 1) 수강생 찾기 */}
      {step === 'student' && (
        <>
          <div className={'mx-4 mt-3 flex items-center gap-2 rounded-[12px] bg-white border border-[#E5E7EB] px-3.5 py-3 focus-within:border-[#1E2124]'}>
            <Search size={18} strokeWidth={1.8} className={'shrink-0 text-[#8B95A1]'}/>
            <input
              type={'search'}
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={'이름 또는 전화번호 뒤 4자리'}
              className={'flex-1 min-w-0 bg-transparent text-[15px] text-black placeholder-[#B1B8BE] outline-none'}
            />
          </div>
          <ul className={`${cardCls} overflow-hidden flex flex-col divide-y divide-[#F2F4F6]`}>
            {!keyword.trim() ? (
              <p className={emptyCls}>이름이나 전화번호로 찾아보세요</p>
            ) : searching && students.length === 0 ? (
              <p className={emptyCls}>찾는 중…</p>
            ) : students.length === 0 ? (
              <p className={'px-4 pt-10 pb-4 text-center text-[13px] text-[#8B95A1]'}>등록된 수강생 중에는 없어요</p>
            ) : students.map((st) => {
              const name = val(st.name) ?? val(st.nickName) ?? '-';
              return (
                <li key={st.id}>
                  <button type={'button'} onClick={() => { setTarget({ kind: 'member', student: st }); setStep('item'); }} className={rowCls}>
                    <span className={'relative w-[40px] h-[40px] rounded-[12px] bg-[#F7F8FA] overflow-hidden flex items-center justify-center shrink-0 text-[14px] font-bold text-[#4E5968]'}>
                      {st.profileImageUrl ? <Image src={st.profileImageUrl} alt={''} fill sizes={'40px'} className={'object-cover'}/> : name.slice(0, 1)}
                    </span>
                    <span className={'flex-1 min-w-0'}>
                      <span className={'block text-[15px] font-bold text-black truncate'}>{name}</span>
                      <span className={'block text-[12px] text-[#8B95A1] truncate'}>{phoneOf(st.phone) ?? '연락처 없음'}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {/* 새 수강생 — 검색 여부와 상관없이 항상 노출. 전화번호로 계정을 만들며 결제 (가이드 1번 phone/name) */}
            <li>
              <button type={'button'} onClick={openNewStudent} className={rowCls}>
                <span className={'w-[40px] h-[40px] rounded-[12px] bg-[#EEF4FF] flex items-center justify-center shrink-0'}>
                  <UserPlus size={19} strokeWidth={1.8} className={'text-[#3182F6]'}/>
                </span>
                <span className={'flex-1 min-w-0'}>
                  <span className={'block text-[15px] font-bold text-[#3182F6]'}>새 수강생으로 등록하고 결제</span>
                  <span className={'block text-[12px] text-[#8B95A1]'}>이름과 전화번호로 계정을 만들어요</span>
                </span>
              </button>
            </li>
          </ul>
        </>
      )}

      {/* 1-1) 새 수강생 — phone + name. 서버가 그 번호의 계정을 만들고 결제한다 */}
      {step === 'newStudent' && (
        <>
          <div className={`${cardCls} px-4 py-4`}>
            <p className={labelCls}>이름</p>
            <div className={fieldCls}>
              <input type={'text'} autoFocus value={newName} onChange={(e) => { setNewName(e.target.value); setNewError(null); }} placeholder={'홍길동'} className={inputCls}/>
            </div>
            <p className={`${labelCls} mt-4`}>휴대폰 번호</p>
            <div className={fieldCls}>
              <input
                type={'tel'}
                inputMode={'numeric'}
                value={phoneOf(newPhone) ?? ''}
                onChange={(e) => { setNewPhone(digitsOf(e.target.value).slice(0, 11)); setNewError(null); }}
                placeholder={'010-0000-0000'}
                className={inputCls}
              />
            </div>
            <p className={'mt-2.5 text-[12px] text-[#8B95A1] leading-snug'}>이미 이 번호로 가입된 분이면 검색해서 골라주세요. 결제 즉시 이 번호로 계정이 만들어져요.</p>
            {newError && <p className={'mt-2 text-[13px] text-[#E55B5B] font-medium'}>{newError}</p>}
          </div>
          <BottomCta label={'다음'} onClick={confirmNewStudent}/>
        </>
      )}

      {/* 2) 수강권(날짜별 수업) | 패스권 */}
      {step === 'item' && (
        <>
          <div className={'mx-4 mt-3 flex gap-1.5'}>
            {([['lesson', '수강권'], ['pass', '패스권']] as const).map(([k, label]) => (
              <button key={k} type={'button'} onClick={() => setTab(k)} aria-pressed={tab === k} className={pillCls(tab === k)}>
                {label}
              </button>
            ))}
          </div>
          {/* 수업 날짜 — 기본 오늘. 탭하면 네이티브 date picker */}
          {tab === 'lesson' && (
            <label className={'relative mx-4 mt-2.5 flex items-center gap-2.5 rounded-[12px] bg-white border border-[#E5E7EB] px-3.5 py-3 focus-within:border-[#1E2124] cursor-pointer'}>
              <CalendarDays size={18} strokeWidth={1.8} className={'shrink-0 text-[#8B95A1]'}/>
              <span className={'flex-1 min-w-0 text-[15px] font-semibold text-black'}>{dateLabelOf(date, today)}</span>
              {date !== today && (
                <button type={'button'} onClick={(e) => { e.preventDefault(); setDate(today); }} className={'relative z-10 text-[12.5px] font-semibold text-[#3182F6]'}>오늘로</button>
              )}
              <input
                type={'date'}
                value={date}
                onChange={(e) => { const v = normalizeDateInput(e.target); if (v) setDate(v); }}
                // 행 전체를 덮는 투명 입력 — 어디를 눌러도 네이티브 date picker가 뜬다 (0 크기 히든 input은 iOS에서 안 열린다)
                className={'absolute inset-0 w-full h-full opacity-0'}
                aria-label={'수업 날짜'}
              />
            </label>
          )}
          <ul className={`${cardCls} overflow-hidden flex flex-col divide-y divide-[#F2F4F6] transition-opacity ${loadingItem || loadingLessons ? 'opacity-50 pointer-events-none' : ''}`}>
            {tab === 'lesson' ? (
              (lessonsByDate[date] ?? []).length === 0 ? (
                <p className={emptyCls}>{loadingLessons ? '불러오는 중…' : `${dateLabelOf(date, today)} 수업이 없어요`}</p>
              ) : (lessonsByDate[date] ?? []).map((l) => (
                <li key={l.id}>
                  <button type={'button'} onClick={() => onLesson(l)} className={rowCls}>
                    <span className={'relative w-[52px] h-[64px] rounded-[10px] overflow-hidden bg-[#F1F3F6] shrink-0 flex items-center justify-center text-[20px]'}>
                      {l.thumbnailUrl ? <Image src={l.thumbnailUrl} alt={''} fill sizes={'52px'} className={'object-cover'}/> : '🕺'}
                    </span>
                    <span className={'flex-1 min-w-0'}>
                      {l.timeLabel && <span className={'block text-[11.5px] font-bold text-[#4E5968]'}>{l.timeLabel}</span>}
                      <span className={'block text-[15px] font-bold text-black truncate'}>{l.title}</span>
                      {l.subLabel && <span className={'block text-[12px] text-[#8B95A1] truncate'}>{l.subLabel}</span>}
                    </span>
                    <span className={priceCls}>{lessonPriceLabel(l.price)}</span>
                  </button>
                </li>
              ))
            ) : plans === null ? (
              <p className={emptyCls}>불러오는 중…</p>
            ) : plans.length === 0 ? (
              <p className={emptyCls}>판매 중인 패스권이 없어요</p>
            ) : plans.map((p) => (
              <li key={p.id}>
                <button type={'button'} onClick={() => goAmount({ kind: 'pass-plan', plan: p })} className={rowCls}>
                  <span className={'flex-1 min-w-0'}>
                    <span className={'block text-[15px] font-bold text-black truncate'}>{p.name}</span>
                    {/* 첫 줄 혜택, 둘째 줄 유효기간 */}
                    {passBenefitLabel(p) && <span className={'block text-[12.5px] text-[#4E5968] truncate'}>{passBenefitLabel(p)}</span>}
                    {p.expireDateStamp && <span className={'block text-[12px] text-[#8B95A1] truncate'}>{p.expireDateStamp}</span>}
                  </span>
                  <span className={priceCls}>{lessonPriceLabel(p.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 2-1) 가격 정책 수업의 방식 */}
      {step === 'policy' && pendingLesson && (
        <ul className={`${cardCls} overflow-hidden flex flex-col divide-y divide-[#F2F4F6]`}>
          {policies.map((p) => (
            <li key={p.id}>
              <button
                type={'button'}
                disabled={p.usable === false}
                onClick={() => goAmount({ kind: 'lesson', lesson: pendingLesson, policy: p })}
                className={`${rowCls} disabled:opacity-40`}
              >
                <span className={'flex-1 min-w-0'}>
                  <span className={'block text-[15px] font-bold text-black truncate'}>{p.name ?? `${p.lessonCount}회`}</span>
                  {p.description && <span className={'block text-[12px] text-[#8B95A1] truncate'}>{p.description}</span>}
                </span>
                <span className={priceCls}>{fmt(p.price)}원</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 3) 금액 확인 */}
      {step === 'amount' && picked && target && (
        <>
          <div className={`${cardCls} px-4 py-4`}>
            <p className={'text-[13px] font-semibold text-[#8B95A1]'}>{picked.kind === 'pass-plan' ? '패스권' : '수강권'}</p>
            <p className={'mt-0.5 text-[16px] font-bold text-black'}>{pickedTitle(picked)}</p>

            {/* 패스권 시작일 — 비우면 서버 기본값 */}
            {picked.kind === 'pass-plan' && (
              <>
                <p className={`${labelCls} mt-5`}>시작일 <span className={'font-medium text-[#8B95A1]'}>· 비우면 자동</span></p>
                <div className={fieldCls}>
                  <input
                    type={'date'}
                    value={startDate}
                    onChange={(e) => { setStartDate(normalizeDateInput(e.target)); setError(null); }}
                    disabled={paying}
                    className={`${inputCls} appearance-none`}
                  />
                  {startDate && (
                    <button type={'button'} onClick={() => setStartDate('')} className={'text-[12.5px] font-semibold text-[#8B95A1]'}>지우기</button>
                  )}
                </div>
                <p className={'mt-1.5 text-[12px] text-[#8B95A1]'}>정규반은 남은 패스 만료 다음 날, 그 외는 오늘부터 시작돼요.</p>
              </>
            )}

            <p className={`${labelCls} mt-5`}>결제 금액</p>
            <div className={fieldCls}>
              <input
                type={'text'}
                inputMode={'numeric'}
                value={amount ? fmt(Number(amount)) : ''}
                onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, '')); setError(null); }}
                disabled={paying}
                className={`${inputCls} text-[17px] font-bold`}
              />
              <span className={'text-[15px] font-bold text-[#4E5968]'}>원</span>
            </div>
            {pickedPrice(picked) > 0 && Number(amount) !== pickedPrice(picked) && (
              <p className={'mt-1.5 text-[12px] text-[#8B95A1]'}>정가 {fmt(pickedPrice(picked))}원</p>
            )}
            {amount !== '' && Number(amount) === 0 && (
              <p className={'mt-1.5 text-[12px] text-[#8B95A1]'}>0원은 무료 결제로 기록돼요</p>
            )}

            {error && <p className={'mt-3 text-[13px] text-[#E55B5B] font-medium'}>{error}</p>}
          </div>
          <BottomCta label={paying ? '결제 중…' : '현장결제 하기'} onClick={openConfirm} disabled={paying}/>
        </>
      )}

      {/* 결제 확인 — 누구에게 무엇을 얼마에. 확인을 눌러야 API가 나간다 */}
      {confirmOpen && picked && target && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center px-6 ${
            confirmClosing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeConfirm}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[360px] bg-white rounded-[24px] px-6 pt-6 pb-5 animate-[scaleIn_260ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={'text-[17px] font-bold text-black'}>이대로 현장결제 할까요?</p>
            <dl className={'mt-4 flex flex-col divide-y divide-[#F2F4F6]'}>
              <div className={'flex items-start justify-between gap-3 py-2.5'}>
                <dt className={'text-[13.5px] text-[#8B95A1] shrink-0'}>수강생</dt>
                <dd className={'text-[13.5px] font-medium text-[#191F28] text-right min-w-0'}>
                  <span className={'font-bold'}>{targetName(target)}</span>
                  {targetPhone(target) && <span className={'text-[#4E5968]'}> · {targetPhone(target)}</span>}
                  {target.kind === 'guest' && <span className={'block text-[11.5px] font-semibold text-[#3182F6]'}>새 수강생으로 등록</span>}
                </dd>
              </div>
              <div className={'flex items-start justify-between gap-3 py-2.5'}>
                <dt className={'text-[13.5px] text-[#8B95A1] shrink-0'}>{picked.kind === 'pass-plan' ? '패스권' : '수강권'}</dt>
                <dd className={'text-[13.5px] font-medium text-[#191F28] text-right min-w-0 break-keep'}>{pickedTitle(picked)}</dd>
              </div>
              {picked.kind === 'pass-plan' && (
                <div className={'flex items-start justify-between gap-3 py-2.5'}>
                  <dt className={'text-[13.5px] text-[#8B95A1] shrink-0'}>시작일</dt>
                  <dd className={'text-[13.5px] font-medium text-[#191F28] text-right'}>{startDate ? startDate.replace(/-/g, '.') : '자동'}</dd>
                </div>
              )}
              <div className={'flex items-start justify-between gap-3 py-2.5'}>
                <dt className={'text-[13.5px] text-[#8B95A1] shrink-0'}>결제 금액</dt>
                <dd className={'text-[17px] font-bold text-black text-right'}>
                  {(parsedAmount() ?? 0) === 0 ? '무료' : `${fmt(parsedAmount() ?? 0)}원`}
                </dd>
              </div>
            </dl>
            <div className={'mt-4 flex gap-2'}>
              <button
                type={'button'}
                onClick={closeConfirm}
                disabled={paying}
                className={'flex-1 h-[48px] rounded-[12px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                취소
              </button>
              <button
                type={'button'}
                onClick={submit}
                disabled={paying}
                className={'flex-[1.4] h-[48px] rounded-[12px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {paying ? '결제 중…' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
