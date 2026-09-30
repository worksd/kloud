'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {Toast} from '@/app/components/Toast';
import {KioskFormProps} from '@/app/kiosk/KioskForm';
import {KioskPhoneInputForm} from '@/app/kiosk/KioskPhoneInputForm';
import {KioskNameSearchDialog} from '@/app/kiosk/KioskNameSearchDialog';
import {
  createKioskAttendanceAction,
  getKioskStudentSummaryAction,
  searchStudentsAction,
  // 'use' 접두사 때문에 rules-of-hooks가 훅으로 오인 → 서버 액션임을 드러내는 이름으로 alias
  useKioskPassAction as applyKioskPassAction,
} from '@/app/kiosk/kiosk.actions';
import {getLessonsByDate} from '@/app/kiosk/get.lessons.by.date.action';
import {isGuinnessErrorCase} from '@/app/guinnessErrorCase';
import {GetLessonResponse, LessonStatus} from '@/app/endpoint/lesson.endpoint';
import {StudentListItemResponse} from '@/app/endpoint/student.endpoint';
import {
  KioskAttendanceResponse,
  KioskStudentSummaryResponse,
  KioskSummaryPass,
  KioskSummaryTicket,
  KioskSummaryUnpaid,
} from '@/app/endpoint/kiosk.endpoint';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';

// 회원 셀프 키오스크(mode==='member') — igin member 모드 요약 화면 포팅.
// 대기(idle) → 번호/이름으로 본인 찾기 → 요약(오늘 수업·미납·패스권)에서 출석/패스권 신청.
// KioskForm과 props 시그니처를 맞춰 KioskBootstrap이 mode에 따라 갈아 끼운다.
type MemberKioskFormProps = Omit<KioskFormProps, 'variant'>;

type Step = 'idle' | 'phone' | 'selectUser' | 'loading' | 'summary' | 'error';

type TKey = Parameters<typeof getLocaleString>[0]['key'];

// 검색 결과 후보. student.id는 student 단위 ID라 출결/패스 API에 넣으면 엉뚱한 사람이 된다 → userId만 들고 다닌다.
type Candidate = {
  userId: number;
  displayName: string;
  realName: string;
  phone: string;
  email: string;
  profileImageUrl: string;
};

// '-' 같은 자리표시 값은 BE가 빈 값 대신 내려주는 경우가 있어 문자/숫자가 하나도 없으면 빈 값으로 본다
const clean = (v?: string | null): string => {
  const s = (v ?? '').trim();
  return /[A-Za-z0-9가-힣]/.test(s) ? s : '';
};

const toCandidates = (list: StudentListItemResponse[]): Candidate[] =>
  list.flatMap((s) => {
    if (!s.userId) return [];
    const realName = clean(s.name);
    return [{
      userId: s.userId,
      displayName: clean(s.nickName) || realName,
      realName,
      phone: clean(s.phone),
      email: clean(s.email),
      profileImageUrl: clean(s.profileImageUrl),
    }];
  });

const digitsOf = (p: string) => p.replace(/\D/g, '');

// 010-0000-0000 형태. mask면 가운데 그룹을 *로 가린다(동명이인 선택 화면에서 타인 번호 노출 최소화)
const formatPhone = (raw: string, mask = false): string => {
  const d = digitsOf(raw);
  if (d.length < 9) return raw;
  const head = d.startsWith('02') ? 2 : 3;
  const a = d.slice(0, head);
  const b = d.slice(head, d.length - 4);
  const c = d.slice(-4);
  return `${a}-${mask ? '*'.repeat(b.length) : b}-${c}`;
};

const formatApiDate = (d: Date): string =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

// 'HH:mm' → "오전 9:30" / en만 "9:30 PM". 18시 이후는 '저녁'으로 따로 부른다(igin 규칙)
const timeLabel = (hhmm: string | null | undefined, locale: Locale, t: (k: TKey) => string): string => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const label = h < 12 ? t('kiosk_time_morning') : h < 18 ? t('kiosk_time_afternoon') : t('kiosk_time_evening');
  const clock = `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
  return locale === 'en' ? `${clock} ${label}` : `${label} ${clock}`;
};

const lessonHHMM = (l: GetLessonResponse): string | null =>
  l.startDate?.split(' ')[1] ?? l.formattedDate?.startTime ?? null;

// 이미 끝났거나 판매 대상이 아닌 수업은 패스권 신청 후보에서 뺀다
const EXCLUDED_LESSON_STATUS = new Set<string>([
  LessonStatus.Completed, LessonStatus.Cancelled, LessonStatus.SaleClosed, LessonStatus.NotForSale, LessonStatus.Pending,
]);

const IDLE_TIMEOUT_MS = 90_000;
// 출석을 한 번 끝낸 손님은 볼일이 끝났을 가능성이 커서 다음 손님을 위해 빨리 비운다
const AFTER_ATTEND_TIMEOUT_MS = 6_000;

type PassDialog = {
  pass: KioskSummaryPass;
  stage: 'pick' | 'applying' | 'done' | 'error';
  loadingLessons: boolean;
  lessons: GetLessonResponse[];
  selected: number[]; // 선택 순서 유지 — 신청도 이 순서로 보낸다
  succeeded: GetLessonResponse[];
};

// ── 작은 아이콘들 ──
const PersonIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#B1B8BE">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5v.5H4V20Z"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M9 18V5l11-2v13" stroke="#B1B8BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3" stroke="#B1B8BE" strokeWidth="2"/>
    <circle cx="17" cy="16" r="3" stroke="#B1B8BE" strokeWidth="2"/>
  </svg>
);

const CheckIcon = ({size = 20, color = 'white', stroke = 3}: {size?: number; color?: string; stroke?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ErrorCircle = () => (
  <div className="w-[104px] h-[104px] rounded-full bg-[#FDECEC] flex items-center justify-center animate-[scaleIn_260ms_ease-out]">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v5M12 16.5v.5" stroke="#E0533F" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="9" stroke="#E0533F" strokeWidth="2"/>
    </svg>
  </div>
);

const Spinner = ({size = 22, light = true}: {size?: number; light?: boolean}) => (
  <div
    className={`rounded-full animate-spin border-[3px] ${light ? 'border-white/30 border-t-white' : 'border-[#E8EAED] border-t-[#1E2124]'}`}
    style={{width: size, height: size}}
  />
);

const SectionTitle = ({children}: {children: React.ReactNode}) => (
  <p className="text-[#1E2124] text-[22px] font-bold tracking-[-0.5px] mb-[14px]">{children}</p>
);

export const MemberKioskForm = ({studioId, kioskId, phonePadType, studioName, studioProfileImageUrl, kioskImageUrl}: MemberKioskFormProps) => {
  const locale: Locale = 'ko';
  const t = useCallback((key: TKey) => getLocaleString({locale, key}), [locale]);
  const phoneInputMode: 'phone' | 'lastFour' = phonePadType === 'Short' ? 'lastFour' : 'phone';

  const [step, setStep] = useState<Step>('idle');
  const [searching, setSearching] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [results, setResults] = useState<Candidate[]>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [summary, setSummary] = useState<KioskStudentSummaryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attendedOnce, setAttendedOnce] = useState(false);
  const [attending, setAttending] = useState<number[]>([]);
  const [passDialog, setPassDialog] = useState<PassDialog | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 손님이 바뀌면(reset) 올라가는 세대 번호 — 이전 손님의 늦게 온 응답이 새 화면을 덮지 않게 한다
  const guestSeqRef = useRef(0);
  const attendingRef = useRef<Set<number>>(new Set());
  const stepRef = useRef<Step>(step);
  const attendedOnceRef = useRef(attendedOnce);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    guestSeqRef.current += 1;
    attendingRef.current = new Set();
    setStep('idle');
    setSearching(false);
    setInputError(null);
    setNameDialogOpen(false);
    setNameError(null);
    setResults([]);
    setCandidate(null);
    setSummary(null);
    setErrorMsg(null);
    setAttendedOnce(false);
    setAttending([]);
    setPassDialog(null);
    setToast(null);
  }, []);

  // ── 자동 복귀 타이머: summary/loading에서만. 손님이 뭔가 할 때마다 다시 센다 ──
  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const restartTimer = useCallback(() => {
    clearTimer();
    const s = stepRef.current;
    if (s !== 'summary' && s !== 'loading') return;
    timerRef.current = setTimeout(() => {
      // reset이 다이얼로그 상태까지 함께 비운다
      reset();
    }, attendedOnceRef.current ? AFTER_ATTEND_TIMEOUT_MS : IDLE_TIMEOUT_MS);
  }, [clearTimer, reset]);

  useEffect(() => {
    stepRef.current = step;
    attendedOnceRef.current = attendedOnce;
    restartTimer();
  }, [step, attendedOnce, restartTimer]);

  useEffect(() => {
    if (step !== 'summary' && step !== 'loading') return;
    // 화면 어디를 만져도(다이얼로그 포함) 연장 — 캡처 단계라 stopPropagation된 요소도 잡힌다
    const onDown = () => restartTimer();
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [step, restartTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  // ── 요약 조회 ──
  // background=true면 화면을 loading으로 바꾸지 않고 조용히 갱신(출석/패스 사용 후). 실패해도 기존 요약 유지.
  const loadSummary = useCallback(async (c: Candidate, background = false) => {
    const seq = guestSeqRef.current;
    if (!background) {
      setCandidate(c);
      setSummary(null);
      setStep('loading');
    }
    try {
      const res = await getKioskStudentSummaryAction(kioskId, c.userId);
      if (seq !== guestSeqRef.current) return;
      if (isGuinnessErrorCase(res)) {
        if (background) return;
        setErrorMsg(res.code === 'STUDENT_NOT_FOUND' ? t('kiosk_other_studio_member') : (res.message || t('kiosk_server_error')));
        setStep('error');
        return;
      }
      setSummary(res);
      if (!background) setStep('summary');
      restartTimer();
    } catch {
      if (seq !== guestSeqRef.current || background) return;
      setErrorMsg(t('kiosk_server_error'));
      setStep('error');
    }
  }, [kioskId, t, restartTimer]);

  // ── 번호/이메일 검색 — 뒷 4자리 패드면 끝자리 일치(PhoneSuffix) ──
  const searchMember = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q || searching) return;
    const seq = guestSeqRef.current;
    setSearching(true);
    setInputError(null);
    try {
      const res = await searchStudentsAction(q, phoneInputMode === 'lastFour' ? 'PhoneSuffix' : undefined);
      if (seq !== guestSeqRef.current) return;
      if (isGuinnessErrorCase(res)) {
        setInputError(res.message || t('kiosk_server_error'));
        return;
      }
      const list = toCandidates(res.students ?? []);
      if (list.length === 0) setInputError(t('kiosk_no_member_found'));
      else if (list.length === 1) void loadSummary(list[0]);
      else {
        setResults(list);
        setStep('selectUser');
      }
    } catch {
      if (seq === guestSeqRef.current) setInputError(t('kiosk_server_error'));
    } finally {
      if (seq === guestSeqRef.current) setSearching(false);
    }
  }, [searching, phoneInputMode, t, loadSummary]);

  // ── 이름 검색(다이얼로그) — true를 돌려주면 다이얼로그가 스스로 닫힌다 ──
  const searchByName = useCallback(async (name: string): Promise<boolean> => {
    setNameError(null);
    try {
      const res = await searchStudentsAction(name);
      if (isGuinnessErrorCase(res)) {
        setNameError(res.message || t('kiosk_server_error'));
        return false;
      }
      const list = toCandidates(res.students ?? []);
      if (list.length === 0) {
        setNameError(t('kiosk_no_name_match'));
        return false;
      }
      if (list.length === 1) void loadSummary(list[0]);
      else {
        setResults(list);
        setStep('selectUser');
      }
      return true;
    } catch {
      setNameError(t('kiosk_server_error'));
      return false;
    }
  }, [t, loadSummary]);

  // ── 출석 ──
  const attend = useCallback(async (ticket: KioskSummaryTicket) => {
    const lessonId = ticket.lessonId ?? ticket.id;
    if (!candidate || lessonId == null || attendingRef.current.has(lessonId)) return;
    const seq = guestSeqRef.current;
    restartTimer();
    attendingRef.current.add(lessonId);
    setAttending([...attendingRef.current]);
    try {
      const res: KioskAttendanceResponse | unknown = await createKioskAttendanceAction(kioskId, candidate.userId, lessonId);
      if (seq !== guestSeqRef.current) return;
      if (isGuinnessErrorCase(res)) {
        setToast(res.message || t('kiosk_server_error'));
        return;
      }
      const r = (res as KioskAttendanceResponse).results?.[0];
      if (r?.ok) {
        // 성공 모달 없이 요약을 다시 받아 행이 '출석 완료' 배지로 바뀌는 것으로 피드백
        setAttendedOnce(true);
        void loadSummary(candidate, true);
      } else if (r?.reason === 'ALREADY_ATTENDED') {
        setToast(t('kiosk_lesson_attendance_already_done'));
      } else {
        setToast(t('kiosk_attendance_failed').replace('{0}', t('kiosk_attendance_menu')));
      }
    } catch (e) {
      if (seq !== guestSeqRef.current) return;
      setToast(isGuinnessErrorCase(e) ? e.message : t('kiosk_server_error'));
    } finally {
      if (seq === guestSeqRef.current) {
        attendingRef.current.delete(lessonId);
        setAttending([...attendingRef.current]);
      }
    }
  }, [candidate, kioskId, t, loadSummary, restartTimer]);

  // ── 패스권으로 오늘 수업 신청 ──
  const openPassDialog = useCallback(async (pass: KioskSummaryPass) => {
    const seq = guestSeqRef.current;
    restartTimer();
    setPassDialog({pass, stage: 'pick', loadingLessons: true, lessons: [], selected: [], succeeded: []});
    let lessons: GetLessonResponse[] = [];
    try {
      const res = await getLessonsByDate(studioId, formatApiDate(new Date()));
      if (isGuinnessErrorCase(res) || !('lessons' in res)) throw new Error('lessons');
      lessons = (res.lessons ?? []).filter((l) => !l.status || !EXCLUDED_LESSON_STATUS.has(l.status));
    } catch {
      if (seq === guestSeqRef.current) setToast(t('kiosk_server_error'));
    }
    if (seq !== guestSeqRef.current) return;
    setPassDialog((d) => (d && d.pass === pass ? {...d, loadingLessons: false, lessons} : d));
  }, [studioId, t, restartTimer]);

  const closePassDialog = useCallback(() => {
    setPassDialog(null);
    restartTimer();
  }, [restartTimer]);

  const togglePassLesson = (lessonId: number) => {
    setPassDialog((d) => {
      if (!d || d.stage !== 'pick') return d;
      const selected = d.selected.includes(lessonId) ? d.selected.filter((id) => id !== lessonId) : [...d.selected, lessonId];
      return {...d, selected};
    });
  };

  const applyPass = useCallback(async () => {
    const d = passDialog;
    if (!d || !candidate || d.stage !== 'pick' || d.selected.length === 0) return;
    const passId = d.pass.passId ?? d.pass.id;
    if (passId == null) {
      setToast(t('kiosk_server_error'));
      return;
    }
    const seq = guestSeqRef.current;
    setPassDialog({...d, stage: 'applying'});

    const succeeded: GetLessonResponse[] = [];
    let firstFailMessage: string | null = null;
    let failCount = 0;
    // 순차 호출 — 같은 패스권 잔여 횟수를 동시에 차감하면 BE에서 경합이 나서 병렬로 보내지 않는다
    for (const lessonId of d.selected) {
      const lesson = d.lessons.find((l) => l.id === lessonId);
      try {
        const res = await applyKioskPassAction({passId, targetUserId: candidate.userId, kioskId, lessonId});
        if (seq !== guestSeqRef.current) return;
        const r = res as {paymentId?: string | number; id?: number} | undefined;
        const hasReceipt = !!r && ((typeof r.paymentId === 'string' && r.paymentId !== '') || typeof r.paymentId === 'number' || r.id != null);
        if (!isGuinnessErrorCase(res) && hasReceipt) {
          if (lesson) succeeded.push(lesson);
        } else {
          failCount += 1;
          if (!firstFailMessage && isGuinnessErrorCase(res)) firstFailMessage = res.message || null;
        }
      } catch (e) {
        if (seq !== guestSeqRef.current) return;
        failCount += 1;
        if (!firstFailMessage && isGuinnessErrorCase(e)) firstFailMessage = e.message || null;
      }
    }

    if (seq !== guestSeqRef.current) return;
    if (succeeded.length > 0) {
      setPassDialog((cur) => (cur ? {...cur, stage: 'done', succeeded} : cur));
      void loadSummary(candidate, true);
      if (failCount > 0) setToast(firstFailMessage ?? t('kiosk_pay_failed_title'));
    } else {
      setPassDialog((cur) => (cur ? {...cur, stage: 'error'} : cur));
    }
    restartTimer();
  }, [passDialog, candidate, kioskId, t, loadSummary, restartTimer]);

  const toastNode = toast && (
    <Toast
      key={toast}
      message={<span className="text-white font-medium" style={{fontSize: 'min(2.6vw, 28px)'}}>{toast}</span>}
      onDone={() => setToast(null)}
      className="px-[min(3.7vw,40px)] py-[min(2.2vw,24px)] rounded-[16px] bg-black/85"
      wrapperClassName="fixed left-1/2 -translate-x-1/2 z-[70]"
      wrapperStyle={{bottom: 'min(14vh, 140px)'}}
    />
  );

  // ── 대기 화면 ──
  if (step === 'idle') {
    return (
      <div
        onClick={() => setStep('phone')}
        className="relative w-full h-screen overflow-hidden bg-[#1E2124] cursor-pointer select-none animate-[fadeIn_260ms_ease-out]"
      >
        {kioskImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kioskImageSrc(kioskImageUrl, 1600)} alt="" className="absolute inset-0 w-full h-full object-cover"/>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[24px] px-[48px]">
            {studioProfileImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={kioskImageSrc(studioProfileImageUrl, 320)} alt="" className="w-[140px] h-[140px] rounded-full object-cover"/>
            )}
            <p className="text-white text-[48px] font-bold tracking-[-1.2px] text-center">{studioName}</p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"/>
        <div className="absolute inset-x-0 bottom-[min(10vh,110px)] flex flex-col items-center gap-[20px] pointer-events-none">
          <div className="relative w-[96px] h-[96px] flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-white/25 animate-ping"/>
            <span className="relative w-[80px] h-[80px] rounded-full bg-white/15 flex items-center justify-center animate-pulse">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5V8.5a1.5 1.5 0 0 1 3 0v2m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.9-2.5L4.3 14a1.5 1.5 0 0 1 2.4-1.8L9 14.5"
                  stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <p className="text-white text-[30px] font-bold tracking-[-0.8px]">{t('kiosk_touch_to_start')}</p>
        </div>
      </div>
    );
  }

  // ── 번호 입력 ──
  if (step === 'phone') {
    return (
      <div className="relative w-full h-screen animate-[fadeIn_260ms_ease-out]">
        <KioskPhoneInputForm
          locale={locale}
          variant="kiosk"
          mode={phoneInputMode}
          onBack={reset}
          onHome={reset}
          onNext={(phone) => searchMember(phone)}
          onSearchByEmail={(email) => searchMember(email)}
          // 번호가 기억나지 않는 손님용 — 결제 흐름과 같은 위치(키패드 아래)의 이름 검색 버튼
          onSearchByName={() => { if (searching) return; setNameError(null); setNameDialogOpen(true); }}
          loading={searching}
          errorMessage={inputError}
          onDismissError={() => setInputError(null)}
        />
        {nameDialogOpen && (
          <KioskNameSearchDialog
            locale={locale}
            errorMessage={nameError}
            onSearch={searchByName}
            onClose={() => { setNameDialogOpen(false); setNameError(null); }}
          />
        )}
        {toastNode}
      </div>
    );
  }

  // ── 동명이인/동일번호 선택 ──
  if (step === 'selectUser') {
    return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col items-center px-[48px] pt-[min(10vh,110px)] pb-[40px] animate-[fadeIn_260ms_ease-out]">
        <p className="text-[#1E2124] text-[34px] font-bold tracking-[-1px] text-center">{t('kiosk_select_user_title')}</p>
        <p className="mt-[8px] text-[#8B95A1] text-[20px] text-center">{t('kiosk_select_user_desc')}</p>
        <div className="w-full max-w-[640px] mt-[32px] flex-1 min-h-0 overflow-y-auto flex flex-col gap-[12px]">
          {results.map((c) => {
            const sub = [c.phone ? formatPhone(c.phone, true) : '', c.email].filter(Boolean).join('  ·  ');
            return (
              <button
                key={c.userId}
                onClick={() => loadSummary(c)}
                className="w-full bg-[#F7F8F9] rounded-[20px] p-[20px] flex items-center gap-[16px] text-left active:bg-[#EEF0F2] transition-colors"
              >
                <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-[#E8EAED] shrink-0 flex items-center justify-center">
                  {c.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kioskImageSrc(c.profileImageUrl, 140)} alt="" className="w-full h-full object-cover"/>
                  ) : <PersonIcon size={30}/>}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                  <p className="truncate">
                    <span className="text-[#1E2124] text-[21px] font-bold">{c.displayName || c.realName || '-'}</span>
                    {c.realName && c.realName !== c.displayName && (
                      <span className="ml-[8px] text-[#8B95A1] text-[16px]">{c.realName}</span>
                    )}
                  </p>
                  {sub && <p className="text-[#8B95A1] text-[16px] truncate whitespace-pre">{sub}</p>}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={reset} className="mt-[20px] px-[24px] py-[12px] text-[#8B95A1] text-[20px] font-medium underline underline-offset-4 active:opacity-60">
          {t('kiosk_to_home')}
        </button>
      </div>
    );
  }

  // ── 조회 중 ──
  if (step === 'loading') {
    return (
      <div className="bg-white w-full h-screen flex items-center justify-center animate-[fadeIn_220ms_ease-out]">
        <Spinner size={60} light={false}/>
      </div>
    );
  }

  // ── 에러 ──
  if (step === 'error') {
    return (
      <div className="bg-white w-full h-screen flex flex-col items-center justify-center px-[48px] animate-[fadeIn_260ms_ease-out]">
        <ErrorCircle/>
        <p className="mt-[28px] max-w-[600px] text-[#1E2124] text-[30px] font-bold tracking-[-0.9px] text-center leading-[1.3]">
          {errorMsg ?? t('kiosk_server_error')}
        </p>
        <button
          onClick={reset}
          className="w-full max-w-[600px] h-[76px] rounded-[18px] bg-[#1E2124] text-white text-[22px] font-bold transition-transform active:scale-[0.98] mt-[36px]"
        >
          {t('kiosk_to_home')}
        </button>
      </div>
    );
  }

  // ── 요약 ──
  const user = summary?.user;
  const greetingName = clean(summary?.studentName) || clean(user?.name) || clean(user?.nickName) || candidate?.displayName || '';
  const profileUrl = clean(user?.profileImageUrl) || candidate?.profileImageUrl || '';
  const userPhone = clean(user?.phone);
  const tickets = summary?.todayTickets ?? [];
  const unpaid = summary?.unpaidPayments ?? [];
  const passes = summary?.activePasses ?? [];

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col animate-[fadeIn_260ms_ease-out]">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-[760px] mx-auto px-[40px] pt-[min(7vh,72px)] pb-[40px] flex flex-col gap-[40px]">
          {/* 헤더 */}
          <div className="flex items-center gap-[20px]">
            <div className="w-[76px] h-[76px] rounded-full overflow-hidden bg-[#E8EAED] shrink-0 flex items-center justify-center">
              {profileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kioskImageSrc(profileUrl, 200)} alt="" className="w-full h-full object-cover"/>
              ) : <PersonIcon size={44}/>}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
              <p className="text-[#1E2124] text-[30px] font-bold tracking-[-0.9px] truncate">
                {t('kiosk_summary_greeting').replace('{name}', greetingName)}
              </p>
              <p className="text-[#8B95A1] text-[17px] leading-[1.4]">{t('kiosk_summary_greeting_desc')}</p>
              {userPhone && (
                <span className="self-start mt-[4px] rounded-full bg-[#F2F4F6] px-[12px] py-[5px] text-[#4E5968] text-[15px] font-medium">
                  {formatPhone(userPhone)}
                </span>
              )}
            </div>
          </div>

          {/* 오늘 신청한 수업 */}
          <section>
            <SectionTitle>{t('kiosk_summary_today_lessons')}</SectionTitle>
            {tickets.length === 0 ? (
              <div className="rounded-[20px] bg-[#F7F8F9] px-[24px] py-[28px] text-center text-[#8B95A1] text-[18px]">
                {t('kiosk_summary_no_today')}
              </div>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {tickets.map((tk, i) => (
                  <TicketRow
                    key={`${tk.ticketId ?? tk.lessonId ?? tk.id ?? 'tk'}-${i}`}
                    ticket={tk}
                    locale={locale}
                    t={t}
                    busy={attending.includes(tk.lessonId ?? tk.id ?? -1)}
                    onAttend={() => attend(tk)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 미납 결제 — 표시 전용. 결제는 데스크에서 */}
          {unpaid.length > 0 && (
            <section>
              <SectionTitle>{t('kiosk_summary_unpaid')}</SectionTitle>
              <div className="flex flex-col gap-[10px]">
                {unpaid.map((u: KioskSummaryUnpaid) => (
                  <div key={u.paymentId} className="rounded-[20px] bg-[#FFF8EB] border border-[#FCE3B0] px-[22px] py-[18px] flex items-center gap-[16px]">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1E2124] text-[18px] font-bold truncate">{u.productName || '-'}</p>
                      {u.issuedAt && <p className="mt-[4px] text-[#8B95A1] text-[14px]">{u.issuedAt}</p>}
                    </div>
                    <p className="shrink-0 text-[#D98A00] text-[20px] font-bold">{`${u.amount.toLocaleString('ko-KR')}원`}</p>
                  </div>
                ))}
              </div>
              <p className="mt-[10px] px-[4px] text-[#8B95A1] text-[15px]">{t('kiosk_summary_pay_at_desk')}</p>
            </section>
          )}

          {/* 패스권 */}
          <section>
            <SectionTitle>{t('kiosk_summary_passes')}</SectionTitle>
            {passes.length === 0 ? (
              <div className="rounded-[20px] bg-[#F7F8F9] px-[24px] py-[28px] text-center text-[#8B95A1] text-[18px]">
                {t('kiosk_no_pass')}
              </div>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {passes.map((p, i) => {
                  const period = [p.startDate, p.endDate].some(Boolean) ? `${p.startDate ?? ''} ~ ${p.endDate ?? ''}` : '';
                  return (
                    <div key={`${p.passId ?? p.id ?? 'p'}-${i}`} className="rounded-[20px] bg-[#F7F8F9] px-[22px] py-[18px] flex items-center gap-[16px]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[8px] min-w-0">
                          <p className="text-[#1E2124] text-[18px] font-bold truncate">{clean(p.name) || t('kiosk_pass')}</p>
                          {clean(p.tag) && (
                            <span className="shrink-0 rounded-[6px] bg-[#E8EAED] px-[8px] py-[2px] text-[#4E5968] text-[13px] font-bold">{p.tag}</span>
                          )}
                        </div>
                        {period && <p className="mt-[4px] text-[#8B95A1] text-[15px]">{period}</p>}
                      </div>
                      <button
                        onClick={() => openPassDialog(p)}
                        className="shrink-0 h-[48px] px-[22px] rounded-full bg-[#1E2124] text-white text-[17px] font-bold active:scale-[0.97] transition-transform"
                      >
                        {t('kiosk_pass_use_cta')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 하단 고정 확인 */}
      <div className="shrink-0 px-[40px] pt-[12px] pb-[min(4vh,40px)] border-t border-[#F2F4F6] bg-white">
        <button
          onClick={reset}
          className="w-full max-w-[760px] mx-auto block h-[76px] rounded-[18px] bg-[#1E2124] text-white text-[22px] font-bold transition-transform active:scale-[0.98]"
        >
          {t('confirm')}
        </button>
      </div>

      {passDialog && (
        <PassUseDialog
          dialog={passDialog}
          locale={locale}
          t={t}
          onToggle={togglePassLesson}
          onSubmit={applyPass}
          onClose={closePassDialog}
        />
      )}
      {toastNode}
    </div>
  );
};

// ── 오늘 수업 행 ──
const TicketRow = ({ticket, locale, t, busy, onAttend}: {
  ticket: KioskSummaryTicket;
  locale: Locale;
  t: (k: TKey) => string;
  busy: boolean;
  onAttend: () => void;
}) => {
  const thumb = ticket.thumbnailUrl ?? ticket.posterUrl ?? ticket.imageUrl;
  const who = [clean(ticket.artistName), clean(ticket.roomName)].filter(Boolean).join(' · ');
  const sub = [timeLabel(ticket.startTime, locale, t), who].filter(Boolean).join(' · ');
  return (
    <div className="rounded-[20px] bg-[#F7F8F9] px-[18px] py-[14px] flex items-center gap-[16px]">
      <div className="w-[56px] h-[72px] rounded-[12px] overflow-hidden bg-[#E8EAED] shrink-0 flex items-center justify-center">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kioskImageSrc(thumb, 160)} alt="" className="w-full h-full object-cover"/>
        ) : <MusicIcon/>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#1E2124] text-[18px] font-bold truncate">{ticket.title || '-'}</p>
        {sub && <p className="mt-[4px] text-[#8B95A1] text-[15px] truncate">{sub}</p>}
      </div>
      {ticket.isAttended ? (
        <div className="shrink-0 flex flex-col items-end gap-[4px]">
          <span className="rounded-full bg-[#E3F7F1] px-[14px] py-[6px] text-[#12A57A] text-[15px] font-bold">
            {t('kiosk_member_attended_badge')}
          </span>
          {ticket.attendedAt && <span className="text-[#8B95A1] text-[13px]">{timeLabel(ticket.attendedAt, locale, t)}</span>}
        </div>
      ) : (
        <button
          onClick={onAttend}
          disabled={busy}
          className="shrink-0 h-[48px] min-w-[112px] px-[22px] rounded-full bg-[#1E2124] text-white text-[17px] font-bold flex items-center justify-center active:scale-[0.97] transition-transform disabled:opacity-70"
        >
          {busy ? <Spinner size={22}/> : t('kiosk_attend_this_lesson')}
        </button>
      )}
    </div>
  );
};

// ── 패스권 사용 다이얼로그 ──
const PassUseDialog = ({dialog, locale, t, onToggle, onSubmit, onClose}: {
  dialog: PassDialog;
  locale: Locale;
  t: (k: TKey) => string;
  onToggle: (lessonId: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}) => {
  const {stage, lessons, selected, loadingLessons} = dialog;
  const passName = clean(dialog.pass.name) || t('kiosk_pass');
  const lessonTime = (l: GetLessonResponse) => timeLabel(lessonHHMM(l), locale, t);
  const selectedLessons = selected.flatMap((id) => lessons.filter((l) => l.id === id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" onClick={() => { if (stage !== 'applying') onClose(); }}/>
      <div className="relative w-[92%] max-w-[680px] max-h-[88vh] bg-white rounded-[32px] flex flex-col px-[36px] py-[36px] animate-[scaleIn_220ms_ease-out]">
        {stage === 'pick' && (
          <>
            <p className="text-[#1E2124] text-[28px] font-bold tracking-[-0.8px] text-center">{t('kiosk_pass_pick_lesson')}</p>
            <p className="mt-[6px] text-[#8B95A1] text-[17px] text-center truncate">{passName}</p>

            <div className="mt-[24px] flex-1 min-h-[120px] overflow-y-auto flex flex-col gap-[10px]">
              {loadingLessons ? (
                <div className="py-[40px] flex justify-center"><Spinner size={40} light={false}/></div>
              ) : lessons.length === 0 ? (
                <div className="rounded-[20px] bg-[#F7F8F9] px-[24px] py-[28px] text-center text-[#8B95A1] text-[18px]">
                  {t('kiosk_pass_no_applicable')}
                </div>
              ) : lessons.map((l) => {
                const on = selected.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => onToggle(l.id)}
                    className={`w-full rounded-[18px] border px-[18px] py-[14px] flex items-center gap-[14px] text-left transition-colors ${
                      on ? 'border-[#1E2124] bg-[#F7F8F9]' : 'border-[#E6E8EA] bg-white active:bg-[#F7F8F9]'
                    }`}
                  >
                    <span className={`w-[28px] h-[28px] rounded-full shrink-0 flex items-center justify-center ${on ? 'bg-[#1E2124]' : 'border-2 border-[#D1D6DB]'}`}>
                      {on && <CheckIcon size={16}/>}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[#1E2124] text-[18px] font-bold truncate">{l.title || '-'}</span>
                      {lessonTime(l) && <span className="block mt-[2px] text-[#8B95A1] text-[15px]">{lessonTime(l)}</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedLessons.length > 0 && (
              <div className="mt-[18px]">
                <p className="text-[#4E5968] text-[15px] font-medium">
                  {t('kiosk_selected_lessons_count').replace('{count}', String(selectedLessons.length))}
                </p>
                <div className="mt-[8px] flex flex-wrap gap-[8px]">
                  {selectedLessons.map((l) => (
                    <span key={l.id} className="max-w-full rounded-full bg-[#1E2124] pl-[14px] pr-[6px] py-[6px] flex items-center gap-[6px] text-white text-[14px] font-medium">
                      <span className="truncate">{l.title || '-'}</span>
                      <button onClick={() => onToggle(l.id)} aria-label="remove" className="w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-[24px] flex gap-[12px]">
              <button
                onClick={onClose}
                className="flex-[2] h-[72px] rounded-[18px] bg-[#F2F4F6] text-[#1E2124] text-[20px] font-bold active:scale-[0.98] transition-transform"
              >
                {t('kiosk_cancel')}
              </button>
              <button
                onClick={onSubmit}
                disabled={selected.length === 0}
                className={`flex-[3] h-[72px] rounded-[18px] text-white text-[20px] font-bold active:scale-[0.98] transition-all ${selected.length > 0 ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'}`}
              >
                {selected.length > 0 ? `${t('kiosk_submit')} (${selected.length})` : t('kiosk_submit')}
              </button>
            </div>
          </>
        )}

        {stage === 'applying' && (
          <div className="py-[48px] flex flex-col items-center">
            <Spinner size={60} light={false}/>
            <p className="mt-[28px] text-[#1E2124] text-[26px] font-bold">{t('kiosk_processing')}</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="flex flex-col items-center min-h-0">
            <div className="w-[96px] h-[96px] rounded-full bg-[#1E2124] flex items-center justify-center animate-[scaleIn_320ms_cubic-bezier(0.34,1.56,0.64,1)]">
              <CheckIcon size={44}/>
            </div>
            <p className="mt-[24px] text-[#1E2124] text-[30px] font-bold tracking-[-0.9px]">{t('kiosk_request_done')}</p>
            <p className="mt-[6px] text-[#8B95A1] text-[18px]">{t('kiosk_pass_applied_desc')}</p>
            <div className="w-full mt-[24px] overflow-y-auto flex flex-col gap-[8px]">
              {dialog.succeeded.map((l) => (
                <div key={l.id} className="rounded-[16px] bg-[#F7F8F9] px-[18px] py-[14px] flex items-center gap-[12px]">
                  <CheckIcon size={20} color="#12A57A"/>
                  <span className="flex-1 min-w-0 text-[#1E2124] text-[18px] font-bold truncate">{l.title || '-'}</span>
                  {lessonTime(l) && <span className="shrink-0 text-[#8B95A1] text-[15px]">{lessonTime(l)}</span>}
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-full mt-[28px] h-[72px] rounded-[18px] bg-[#1E2124] text-white text-[20px] font-bold active:scale-[0.98] transition-transform">
              {t('confirm')}
            </button>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex flex-col items-center py-[12px]">
            <ErrorCircle/>
            <p className="mt-[24px] text-[#1E2124] text-[28px] font-bold tracking-[-0.8px] text-center">{t('kiosk_pay_failed_title')}</p>
            <button onClick={onClose} className="w-full mt-[32px] h-[72px] rounded-[18px] bg-[#1E2124] text-white text-[20px] font-bold active:scale-[0.98] transition-transform">
              {t('confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
