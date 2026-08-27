'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {KioskFormProps} from '@/app/kiosk/KioskForm';
import {KioskPhoneInputForm} from '@/app/kiosk/KioskPhoneInputForm';
import {KioskTopBar} from '@/app/kiosk/KioskTopBar';
import {markKioskTicketUsedAction, searchStudentsAction} from '@/app/kiosk/kiosk.actions';
import {getLessonsByDate} from '@/app/kiosk/get.lessons.by.date.action';
import {getLessonTicketsAction} from '@/app/qrs/get.lesson.tickets.action';
import {isGuinnessErrorCase} from '@/app/guinnessErrorCase';
import {GetLessonResponse, LessonStatus} from '@/app/endpoint/lesson.endpoint';
import {TicketResponse} from '@/app/endpoint/ticket.endpoint';
import {StudentListItemResponse} from '@/app/endpoint/student.endpoint';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';
import {KioskLessonAttendanceIcon} from '@/app/kiosk/kiosk.home.icons';
import {formatLessonDate, formatLessonTimeRange, lessonStartMinutes} from '@/app/kiosk/kiosk.lesson';

// 회원 셀프 키오스크(mode==='member') 엔트리.
// 홈 화면 없이 곧장 전화번호부터 받는다 → 번호로 수강생을 찾고 → 오늘 그 수강생이 예약한 수업 중
// 지금 시각에 가장 가까운 수업을 출석 대상으로 제안한다 → 확인하면 toUsed로 출석 처리.
//
// KioskForm(무인)·AdminKioskForm(상담실)과 props 시그니처를 맞춰 KioskBootstrap이 mode에 따라 갈아 끼울 수 있게 한다.
type MemberKioskFormProps = Omit<KioskFormProps, 'variant'>;

type Step =
  | 'phone'        // 번호 입력 (= 홈)
  | 'select-user'  // 동일 번호 수강생 여러 명 → 본인 선택
  | 'loading'      // 오늘 수업 + 티켓 조회 중
  | 'propose'      // 이 수업 출석하시겠어요?
  | 'submitting'   // 출석 처리 중
  | 'complete'     // 완료
  | 'error';

// StudentListItemResponse.id는 student ID라 티켓의 user.id(=userId)와 비교하면 안 된다 — 이 경계에서 userId만 남긴다.
type Member = {
  userId: number;
  name?: string;
  nickName?: string;
  phone?: string;
  profileImageUrl?: string;
};

const toMember = (s: StudentListItemResponse): Member => ({
  userId: s.userId,
  name: s.name,
  nickName: s.nickName,
  phone: s.phone,
  profileImageUrl: s.profileImageUrl,
});

// 출석 후보 — 오늘 수업 하나 + 그 수업에 대한 이 회원의 티켓
type Candidate = {
  lesson: GetLessonResponse;
  ticket: TicketResponse;
};

const formatApiDate = (d: Date): string =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

const memberDisplayName = (m: Member | null): string => (m?.name || m?.nickName || '').trim();

// 완료 후 이 시간이 지나면 자동으로 번호 입력 화면으로 복귀 (다음 회원 대기)
const COMPLETE_AUTO_RESET_MS = 6000;

// 제안 카드 — 썸네일 + 제목 + 일시 + 강사/룸. 수업 출석 폼의 LessonSummary와 같은 톤.
const LessonSummary = ({lesson, locale, extra}: {lesson: GetLessonResponse; locale: Locale; extra?: string | null}) => {
  const when = [formatLessonDate(lesson, locale), formatLessonTimeRange(lesson, locale)].filter(Boolean).join(' · ');
  const who = [lesson.artists?.[0]?.nickName, lesson.room?.name, extra].filter(Boolean).join(' · ');
  return (
    <div className="flex items-center gap-[20px] min-w-0">
      <div className="w-[104px] h-[104px] rounded-[20px] overflow-hidden bg-[#E8EAED] shrink-0">
        {lesson.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kioskImageSrc(lesson.thumbnailUrl, 256)} alt="" className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <KioskLessonAttendanceIcon size={40} color="#B1B8BE"/>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-[6px] text-left">
        <p className="text-[#1E2124] text-[26px] font-bold leading-[1.25] line-clamp-2">{lesson.title ?? '-'}</p>
        {when && <p className="text-[#4E5968] text-[18px] font-medium truncate">{when}</p>}
        {who && <p className="text-[#8B95A1] text-[16px] truncate">{who}</p>}
      </div>
    </div>
  );
};

const MemberSummary = ({member}: {member: Member}) => {
  const initial = (memberDisplayName(member) || '?').charAt(0);
  return (
    <div className="flex items-center gap-[16px] min-w-0">
      <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-[#E8EAED] shrink-0 flex items-center justify-center">
        {member.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kioskImageSrc(member.profileImageUrl, 160)} alt="" className="w-full h-full object-cover"/>
        ) : (
          <span className="text-[#8B95A1] text-[24px] font-bold">{initial}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[#1E2124] text-[22px] font-bold truncate">
          {member.name || member.nickName || '-'}
          {member.name && member.nickName && (
            <span className="text-[#8B95A1] text-[17px] font-medium">{` (${member.nickName})`}</span>
          )}
        </p>
        {member.phone && <p className="text-[#8B95A1] text-[16px] truncate">{member.phone}</p>}
      </div>
    </div>
  );
};

export const MemberKioskForm = ({studioId, phonePadType}: MemberKioskFormProps) => {
  const locale: Locale = 'ko';
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const phoneInputMode: 'phone' | 'lastFour' = phonePadType === 'Short' ? 'lastFour' : 'phone';

  const [step, setStep] = useState<Step>('phone');
  const [searching, setSearching] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const busyRef = useRef(false);

  // 처음(번호 입력)으로 — 모든 손님 상태 초기화
  const reset = useCallback(() => {
    setStep('phone');
    setSearching(false);
    setInputError(null);
    setSearchResults([]);
    setMember(null);
    setCandidates([]);
    setSelected(null);
    setErrorMsg(null);
  }, []);

  const fail = useCallback((msg: string) => {
    setErrorMsg(msg);
    setStep('error');
  }, []);

  // 회원 확정 → 오늘 수업 전체 + 각 수업 티켓을 받아 이 회원 것만 고른다.
  // 수업별 티켓 조회가 N번 나가지만 하루 수업 수는 많아야 십수 개라 병렬로 감당 가능. (BE에 "유저의 오늘 티켓" API가 생기면 교체)
  const loadCandidates = useCallback(async (m: Member) => {
    setMember(m);
    setStep('loading');
    try {
      const today = new Date();
      const res = await getLessonsByDate(studioId, formatApiDate(today));
      const lessons = 'lessons' in res ? res.lessons.filter((l) => l.status !== LessonStatus.Cancelled) : [];
      const ticketLists = await Promise.all(lessons.map((l) => getLessonTicketsAction(l.id)));

      const found: Candidate[] = lessons.flatMap((lesson, i) => {
        const mine = ticketLists[i].filter(
          (tk) => tk.user?.id === m.userId && tk.status !== 'Cancelled' && tk.status !== 'CancelPending',
        );
        if (mine.length === 0) return [];
        // 같은 수업에 티켓이 둘이면 아직 안 쓴 걸 우선
        const ticket = mine.find((tk) => tk.status !== 'Used') ?? mine[0];
        return [{lesson, ticket}];
      });
      found.sort((a, b) => (lessonStartMinutes(a.lesson) ?? 0) - (lessonStartMinutes(b.lesson) ?? 0));

      if (found.length === 0) {
        fail(t('kiosk_member_no_lesson_today'));
        return;
      }
      const open = found.filter((c) => c.ticket.status !== 'Used');
      if (open.length === 0) {
        fail(t('kiosk_member_all_attended'));
        return;
      }
      // 제안 = 아직 출석 안 한 수업 중 지금 시각과 가장 가까운 것
      const nowMin = today.getHours() * 60 + today.getMinutes();
      const recommended = open.reduce((best, c) => {
        const d = Math.abs((lessonStartMinutes(c.lesson) ?? 0) - nowMin);
        const bd = Math.abs((lessonStartMinutes(best.lesson) ?? 0) - nowMin);
        return d < bd ? c : best;
      }, open[0]);

      setCandidates(found);
      setSelected(recommended);
      setStep('propose');
    } catch {
      fail(t('kiosk_lesson_attendance_load_failed'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioId, fail]);

  // 번호(또는 이메일)로 수강생 검색 — GET /students. 뒷 4자리 패드면 matchType 'PhoneSuffix'로 끝자리 일치만.
  const searchMember = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    setInputError(null);
    try {
      const res = await searchStudentsAction(q, phoneInputMode === 'lastFour' ? 'PhoneSuffix' : undefined);
      const members = isGuinnessErrorCase(res) ? [] : (res.students ?? []).map(toMember);
      if (members.length === 0) {
        setInputError(t('kiosk_no_member_found'));
      } else if (members.length === 1) {
        await loadCandidates(members[0]);
      } else {
        setSearchResults(members);
        setStep('select-user');
      }
    } catch {
      setInputError(t('kiosk_search_failed'));
    } finally {
      setSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching, loadCandidates]);

  const confirmAttendance = useCallback(async () => {
    if (!selected || busyRef.current) return;
    busyRef.current = true;
    setStep('submitting');
    try {
      const res = await markKioskTicketUsedAction(selected.ticket.id, selected.lesson.id);
      if (isGuinnessErrorCase(res)) {
        fail(res.message || t('kiosk_lesson_attendance_failed'));
        return;
      }
      setStep('complete');
    } catch {
      fail(t('kiosk_lesson_attendance_failed'));
    } finally {
      busyRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, fail]);

  // 완료 화면은 잠시 보여주고 자동으로 다음 회원 대기(번호 입력)로
  useEffect(() => {
    if (step !== 'complete') return;
    const timer = setTimeout(reset, COMPLETE_AUTO_RESET_MS);
    return () => clearTimeout(timer);
  }, [step, reset]);

  // ── 번호 입력 (= 홈) ──
  if (step === 'phone') {
    return (
      <KioskPhoneInputForm
        locale={locale}
        variant="kiosk"
        mode={phoneInputMode}
        onBack={reset}
        onHome={reset}
        onNext={(phone) => searchMember(phone)}
        onSearchByEmail={(email) => searchMember(email)}
        loading={searching}
        errorMessage={inputError}
        onDismissError={() => setInputError(null)}
      />
    );
  }

  const name = memberDisplayName(member);
  const others = candidates.filter((c) => c !== selected);

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col animate-[fadeIn_260ms_ease-out]">
      <KioskTopBar
        title={t('kiosk_lesson_attendance_title')}
        onBack={step !== 'submitting' ? reset : undefined}
        onHome={step !== 'submitting' ? reset : undefined}
      />

      <div key={step} className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] pb-[70px] animate-[fadeIn_220ms_ease-out]">
        {/* 동일 번호 수강생 여러 명 → 본인 선택 */}
        {step === 'select-user' && (
          <>
            <p className="text-black text-[32px] font-bold mb-[8px] w-full max-w-[520px] text-center">{t('kiosk_select_user_title')}</p>
            <p className="text-gray-400 text-[20px] mb-[28px] w-full max-w-[520px] text-center">{t('kiosk_select_user_desc')}</p>
            <div className="w-full max-w-[520px] flex flex-col gap-[12px] overflow-y-auto max-h-[52vh]">
              {searchResults.map((m) => (
                <button
                  key={m.userId}
                  onClick={() => loadCandidates(m)}
                  className="w-full bg-gray-50 rounded-[16px] p-[20px] flex items-center gap-[16px] active:bg-gray-200 transition-colors"
                >
                  <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-gray-200 shrink-0">
                    {m.profileImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={kioskImageSrc(m.profileImageUrl, 140)} alt="" className="w-full h-full object-cover"/>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-[4px]">
                    <p className="text-black text-[20px] font-bold">{m.name || m.nickName || '-'}</p>
                    {m.phone && <p className="text-gray-500 text-[16px]">{m.phone}</p>}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* 조회 중 */}
        {step === 'loading' && (
          <>
            <div className="w-[60px] h-[60px] border-4 border-gray-200 border-t-black rounded-full animate-spin mb-[32px]"/>
            <p className="text-black text-[28px] font-bold tracking-[-0.84px]">{t('kiosk_lesson_attendance_loading')}</p>
          </>
        )}

        {/* 제안 — OO님, 이 수업에 출석하시겠어요? */}
        {step === 'propose' && selected && (
          <>
            <p className="text-[#1E2124] text-[36px] font-bold tracking-[-1px] text-center">
              {name ? t('kiosk_member_propose_title').replace('{0}', name) : t('kiosk_lesson_attendance_confirm_title')}
            </p>
            <p className="mt-[8px] text-[#8B95A1] text-[19px] text-center">
              {others.length > 0 ? t('kiosk_member_propose_desc_multi') : t('kiosk_member_propose_desc')}
            </p>

            <div className="w-full max-w-[600px] mt-[36px] rounded-[28px] bg-[#F7F8F9] px-[28px] py-[26px] flex flex-col gap-[20px] animate-[scaleIn_260ms_ease-out]">
              <LessonSummary lesson={selected.lesson} locale={locale}/>
              {member && (
                <>
                  <div className="h-px bg-[#E8EAED]"/>
                  <MemberSummary member={member}/>
                </>
              )}
            </div>

            {/* 오늘 다른 수업 — 탭하면 제안 대상이 바뀐다. 이미 출석한 수업은 배지만 달고 비활성 */}
            {others.length > 0 && (
              <div className="w-full max-w-[600px] mt-[20px] flex flex-col gap-[8px]">
                <p className="text-[#8B95A1] text-[15px] font-medium px-[4px]">{t('kiosk_member_other_lessons')}</p>
                <div className="flex flex-col gap-[8px] overflow-y-auto max-h-[26vh]">
                  {others.map((c) => {
                    const done = c.ticket.status === 'Used';
                    return (
                      <button
                        key={c.ticket.id}
                        disabled={done}
                        onClick={() => setSelected(c)}
                        className={`w-full rounded-[16px] border px-[20px] py-[14px] flex items-center gap-[14px] text-left transition-colors ${
                          done ? 'border-[#F1F3F6] bg-white opacity-60' : 'border-[#E6E8EA] bg-white active:bg-[#F7F8F9]'
                        }`}
                      >
                        <span className="text-[#4E5968] text-[16px] font-bold shrink-0 w-[150px] truncate">
                          {formatLessonTimeRange(c.lesson, locale) || '-'}
                        </span>
                        <span className="flex-1 min-w-0 text-[#1E2124] text-[18px] font-bold truncate">{c.lesson.title ?? '-'}</span>
                        {done && (
                          <span className="shrink-0 rounded-full bg-[#F2F4F6] px-[10px] py-[4px] text-[#8B95A1] text-[13px] font-bold">
                            {t('kiosk_member_attended_badge')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="w-full max-w-[600px] mt-[28px] flex gap-[12px]">
              <button
                onClick={reset}
                className="flex-[2] h-[76px] rounded-[18px] bg-[#F2F4F6] text-[#1E2124] text-[21px] font-bold transition-transform active:scale-[0.98]"
              >
                {t('kiosk_member_restart')}
              </button>
              <button
                onClick={confirmAttendance}
                className="flex-[3] h-[76px] rounded-[18px] bg-[#1E2124] text-white text-[22px] font-bold transition-transform active:scale-[0.98]"
              >
                {t('kiosk_lesson_attendance_confirm_btn')}
              </button>
            </div>
          </>
        )}

        {/* 출석 처리 중 */}
        {step === 'submitting' && (
          <>
            <div className="w-[64px] h-[64px] border-4 border-[#E8E8EA] border-t-[#1E2124] rounded-full animate-spin"/>
            <p className="mt-[32px] text-[#1E2124] text-[28px] font-bold tracking-[-0.84px]">{t('kiosk_lesson_attendance_processing')}</p>
            {selected && <p className="mt-[8px] text-[#8B95A1] text-[18px] truncate max-w-[600px]">{selected.lesson.title}</p>}
          </>
        )}

        {/* 완료 */}
        {step === 'complete' && (
          <>
            <div className="w-[104px] h-[104px] rounded-full bg-[#1E2124] flex items-center justify-center animate-[scaleIn_320ms_cubic-bezier(0.34,1.56,0.64,1)]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="mt-[28px] text-[#1E2124] text-[36px] font-bold tracking-[-1px] text-center">{t('kiosk_lesson_attendance_complete')}</p>
            {name && (
              <p className="mt-[8px] text-[#8B95A1] text-[19px] text-center">
                <span className="text-[#1E2124] font-bold">{name}</span>
              </p>
            )}
            {selected && (
              <div className="w-full max-w-[600px] mt-[32px] rounded-[28px] bg-[#F7F8F9] px-[28px] py-[26px] flex flex-col gap-[20px]">
                <LessonSummary lesson={selected.lesson} locale={locale} extra={selected.ticket.ticketTypeLabel}/>
                {member && (
                  <>
                    <div className="h-px bg-[#E8EAED]"/>
                    <MemberSummary member={member}/>
                  </>
                )}
              </div>
            )}
            <button
              onClick={reset}
              className="w-full max-w-[600px] h-[76px] rounded-[18px] bg-[#1E2124] text-white text-[22px] font-bold transition-transform active:scale-[0.98] mt-[28px]"
            >
              {t('kiosk_confirm')}
            </button>
          </>
        )}

        {/* 에러 */}
        {step === 'error' && (
          <>
            <div className="w-[104px] h-[104px] rounded-full bg-[#FDECEC] flex items-center justify-center animate-[scaleIn_260ms_ease-out]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5M12 16.5v.5" stroke="#E0533F" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="#E0533F" strokeWidth="2"/>
              </svg>
            </div>
            <p className="mt-[28px] max-w-[600px] text-[#1E2124] text-[30px] font-bold tracking-[-0.9px] text-center leading-[1.3]">
              {errorMsg ?? t('kiosk_lesson_attendance_load_failed')}
            </p>
            {member && (
              <div className="w-full max-w-[600px] mt-[28px] rounded-[28px] bg-[#F7F8F9] px-[28px] py-[22px]">
                <MemberSummary member={member}/>
              </div>
            )}
            <button
              onClick={reset}
              className="w-full max-w-[600px] h-[76px] rounded-[18px] bg-[#1E2124] text-white text-[22px] font-bold transition-transform active:scale-[0.98] mt-[36px]"
            >
              {t('kiosk_member_restart')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
