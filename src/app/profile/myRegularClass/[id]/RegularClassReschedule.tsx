'use client';
// 내 정규반 상세 — 수업 일정 변경(서버 용어: 회차 미루기). 오른쪽 위 ⋮ → 바텀시트 메뉴('수업 일정 변경하기' 한 줄) → '수업 일정 변경' 시트(남은 횟수 + 변경할 수업 고르기 + 변경 이력).
// 모바일은 ⋮ 를 RegularClassTopBar(뒤로가기와 같은 줄)에, PC 는 헤더 카드 안. 시트는 전부 공용 BottomSheet.
// 데이터는 reschedule.scope.tsx(서버)가 넘긴다. 변경하기 = POST /regular-classes/:id/postpone { ticketId }.
// 응답엔 결과가 없어 성공하면 router.refresh() — 수강권 목록·남은 횟수·변경 이력이 서버 값으로 다시 그려진다.
// 버튼 규칙(가이드 1절): pass 없음 · postponeLimit null → ⋮ 숨김, 남은 횟수 0 → 고르기 막음. postponeCount 가 한도보다 클 수 있어 0 으로 막는다.
// 새 일정 미리보기는 서버 규칙(이 패스로 가진 회차 중 가장 늦은 날의 다음 요일, pass.days 기준)을 화면에서 따라 계산한 예상값.

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet, BottomSheetHandle } from "@/app/components/BottomSheet";
import { HeaderBlurButton } from "@/app/components/buttons";
import { CircleImage } from "@/app/components/CircleImage";
import { CalendarClock, Check, ChevronRight, MoreVertical } from "lucide-react";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { PassRuleTicket } from "@/app/endpoint/pass.endpoint";
import { RegularClassPostponeResponse, TicketPostponePass, TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { formatLessonWhen, parts } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";
import { postponeRegularClassTicketAction } from "@/app/profile/myRegularClass/[id]/postpone.actions";

// 서버 message 를 그대로 써도 되는 코드(가이드 2절). 비어 있으면 아래 자체 문구로
const SERVER_MESSAGE_CODES = new Set(['LESSON_POSTPONE_NOT_ALLOWED', 'LESSON_POSTPONE_LIMIT_EXCEEDED', 'PASS_CARRY_OVER_CHAIN_TOO_LONG']);
const FALLBACK_MESSAGES: Record<string, StringResourceKey> = {
  LESSON_POSTPONE_NOT_ALLOWED: 'regular_class_reschedule_error_not_allowed',
  LESSON_POSTPONE_LIMIT_EXCEEDED: 'regular_class_reschedule_error_limit_exceeded',
  // 서버 문구가 파트너 기준('정원을 늘린 뒤…')이라 앱 문구로
  PASS_CARRY_OVER_LESSON_FULL: 'regular_class_reschedule_error_full',
  VERSION_CONFLICT: 'regular_class_reschedule_error_conflict',
};

const pad = (n: number) => String(n).padStart(2, '0');

/** 'yyyy.MM.dd' 의 다음날부터 7일 안에서 allowed 요일인 첫 날 — 'yyyy.MM.dd' */
const nextClassDay = (from: { year: number; month: number; day: number }, allowed: number[]) => {
  for (let i = 1; i <= 7; i++) {
    const d = new Date(Date.UTC(from.year, from.month - 1, from.day + i));
    if (allowed.includes(d.getUTCDay())) return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
  }
  return null;
};

/** 남은 횟수 — 한도가 null 이면 미루기 없는 반 */
const remainingOf = (quota: TicketPostponePass | null) =>
  quota && quota.postponeLimit !== null ? Math.max(0, quota.postponeLimit - quota.postponeCount) : 0;

type Sheet =
  | { kind: 'menu' }
  | { kind: 'select' }
  | { kind: 'result'; ok: boolean; message: string };

type Ctx = {
  locale: Locale;
  open: (sheet: Sheet) => void;
};

const RescheduleContext = createContext<Ctx | null>(null);

export const RegularClassRescheduleProvider = ({ locale, regularClassId, upcoming, passTickets, days, endDate, quota, history, children }: {
  locale: Locale;
  regularClassId: number;
  /** 이 패스로 나간 시작 전 수강권(GET …/tickets?type=upcoming) */
  upcoming: TicketResponse[];
  /** GET /passes/:id 의 수강권 — 종료 시각·홀 보충과 미리보기 기준일 계산용 */
  passTickets: PassRuleTicket[];
  /** 반 요일(0=일 ~ 6=토). 비어 있으면 고른 수업의 요일로 매주 잡는다 */
  days: number[];
  /** 정규반 이용 종료일 — 넘어가면 서버가 그 날까지 늘린다(안내만) */
  endDate?: string;
  /** 미루기 한도·쓴 횟수. null 이면 미루기 없는 반 → ⋮ 숨김 */
  quota: TicketPostponePass | null;
  history: RegularClassPostponeResponse[];
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const t = (key: StringResourceKey) => getLocaleString({ locale, key });
  const enabled = !!quota && quota.postponeLimit !== null;
  const remaining = remainingOf(quota);

  // 시트 전환 — 지금 시트를 닫힘 애니메이션까지 태운 뒤(onClose) 다음 시트를 띄운다
  const sheetRef = useRef<BottomSheetHandle>(null);
  const nextRef = useRef<Sheet | null>(null);
  const go = (next: Sheet | null) => {
    // 떠 있는 시트가 없으면 바로 띄운다. nextRef 는 '닫힌 뒤 띄울 것'에만 써야 한다 —
    // 여기서 남겨두면 배경 탭으로 닫을 때 onClosed 가 같은 시트를 다시 세팅해, 투명한 채로 남아 화면을 막는다.
    if (!sheetRef.current) {
      setSheet(next);
      return;
    }
    nextRef.current = next;
    sheetRef.current.close();
  };
  const onClosed = () => {
    setSheet(nextRef.current);
    nextRef.current = null;
  };

  return (
    <RescheduleContext.Provider value={enabled ? { locale, open: go } : null}>
      {children}
      {/* key 로 시트마다 새로 마운트 — 매번 slideUp 이 다시 탄다 */}
      {sheet?.kind === 'menu' && (
        <BottomSheet key="menu" ref={sheetRef} onClose={onClosed}>
          <MenuSheet t={t} remaining={remaining} onSelect={() => go({ kind: 'select' })}/>
        </BottomSheet>
      )}
      {sheet?.kind === 'select' && (
        <SelectSheet
          key="select"
          sheetRef={sheetRef}
          onClosed={onClosed}
          t={t}
          locale={locale}
          regularClassId={regularClassId}
          upcoming={upcoming}
          passTickets={passTickets}
          days={days}
          endDate={endDate}
          quota={quota}
          history={history}
          onCancel={() => go(null)}
          onDone={(res) => {
            // 성공이든 충돌이든 서버 값으로 다시 그린다(목록·남은 횟수·이력)
            if (res.refresh) router.refresh();
            go({ kind: 'result', ok: res.ok, message: res.message });
          }}
        />
      )}
      {sheet?.kind === 'result' && (
        <BottomSheet key="result" ref={sheetRef} onClose={onClosed}>
          <div className="px-6 pt-3">
            <p className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] whitespace-pre-line">{sheet.message}</p>
            <PrimaryButton onClick={() => go(null)} className="mt-7 w-full">{t('confirm')}</PrimaryButton>
          </div>
        </BottomSheet>
      )}
    </RescheduleContext.Provider>
  );
};

/** ⋮ 메뉴 버튼 (공용 HeaderBlurButton, 배경 원 없이). 미루기 없는 반이면 안 그린다. 모바일은 RegularClassTopBar, PC 는 헤더 카드 안. */
export const RescheduleMenuButton = ({ light = false }: { /** 이미지 위 — 흰 아이콘 */ light?: boolean }) => {
  const ctx = useContext(RescheduleContext);
  if (!ctx) return null;
  return (
    <HeaderBlurButton isBlur originProps={{
      type: 'button',
      'aria-label': getLocaleString({ locale: ctx.locale, key: 'regular_class_reschedule_action' }),
      onClick: () => ctx.open({ kind: 'menu' }),
    }}>
      <MoreVertical size={22} className={`transition-colors ${light ? 'text-white drop-shadow' : 'text-[#191F28]'}`}/>
    </HeaderBlurButton>
  );
};

// ───────────────────────── 시트들 ─────────────────────────

const PrimaryButton = ({ onClick, disabled, loading, className = '', children }: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={`h-[52px] rounded-[14px] bg-[#191F28] text-white text-[15px] font-bold active:opacity-80 disabled:opacity-40 flex items-center justify-center ${className}`}
  >
    {loading ? <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin"/> : children}
  </button>
);

/** ⋮ 메뉴 시트 — 지금은 '수업 일정 변경하기' 한 줄. 남은 횟수를 부제로 */
const MenuSheet = ({ t, remaining, onSelect }: {
  t: (key: StringResourceKey) => string;
  remaining: number;
  onSelect: () => void;
}) => (
  <div className="flex flex-col px-4 pt-1">
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3.5 px-2 py-3.5 rounded-xl text-left active:bg-[#F7F8FA]"
    >
      <span className="w-10 h-10 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[#4E5968] shrink-0"><CalendarClock size={20}/></span>
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[16px] font-semibold text-[#191F28] tracking-[-0.3px]">{t('regular_class_reschedule_action')}</span>
        <span className="text-[12.5px] text-[#8B95A1] tracking-[-0.2px]">
          {remaining > 0
            ? `${t('regular_class_reschedule_remaining_label')} ${remaining}${t('regular_class_reschedule_count_unit')}`
            : t('regular_class_reschedule_error_limit_exceeded')}
        </span>
      </span>
      <ChevronRight size={18} className="text-[#B0B8C1] shrink-0"/>
    </button>
  </div>
);

type SelectResult = { ok: boolean; message: string; refresh: boolean };

const SelectSheet = ({ sheetRef, onClosed, t, locale, regularClassId, upcoming, passTickets, days, endDate, quota, history, onCancel, onDone }: {
  sheetRef: React.Ref<BottomSheetHandle>;
  /** BottomSheet 닫힘 애니메이션 끝 */
  onClosed: () => void;
  t: (key: StringResourceKey) => string;
  locale: Locale;
  regularClassId: number;
  upcoming: TicketResponse[];
  passTickets: PassRuleTicket[];
  days: number[];
  endDate?: string;
  quota: TicketPostponePass | null;
  history: RegularClassPostponeResponse[];
  onCancel: () => void;
  onDone: (res: SelectResult) => void;
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // state 는 리렌더 전 연타를 못 막는다 — 중복 요청 방지는 ref 로
  const loadingRef = useRef(false);
  // 처리 중엔 시트가 locked 라 close() 가 무시된다 — 결과는 잠금이 풀린 렌더 뒤에 넘긴다
  const [result, setResult] = useState<SelectResult | null>(null);
  useEffect(() => {
    if (result && !loading) onDone(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, loading]);

  const remaining = remainingOf(quota);
  const byId = useMemo(() => new Map(passTickets.map((tk) => [tk.id, tk])), [passTickets]);

  const now = Date.now();
  // 고를 수 있는 수업 — 이 패스로 나간 시작 전 수강권(취소 제외). 서버가 최종 판정한다
  const candidates = upcoming
    .filter((tk) => tk.status !== 'Cancelled' && (parts(tk.lesson?.startDate)?.at ?? 0) > now)
    .sort((a, b) => (parts(a.lesson?.startDate)?.at ?? 0) - (parts(b.lesson?.startDate)?.at ?? 0));

  const selected = candidates.find((c) => c.id === selectedId) ?? null;
  const endOf = (tk: TicketResponse) => byId.get(tk.id)?.lesson?.endDate;
  const roomOf = (tk: TicketResponse) => tk.lesson?.room?.name ?? byId.get(tk.id)?.lesson?.room?.name;

  // 새 일정(예상) — 이 패스로 가진 살아 있는 회차 중 가장 늦은 날의 다음 반 요일, 시간은 고른 수업 그대로
  const preview = useMemo(() => {
    if (!selected) return null;
    const from = parts(selected.lesson?.startDate);
    if (!from) return null;
    const starts = [
      ...passTickets.filter((tk) => tk.status !== 'Cancelled').map((tk) => tk.lesson?.startDate),
      ...upcoming.map((tk) => tk.lesson?.startDate),
    ].map((s) => parts(s)).filter((p): p is NonNullable<typeof p> => !!p);
    const last = starts.reduce((a, b) => (b.at > a.at ? b : a), from);
    const allowed = days.length > 0 ? days : [from.weekday];
    const date = nextClassDay(last, allowed);
    if (!date) return null;
    const endTime = parts(byId.get(selected.id)?.lesson?.endDate)?.time;
    const toStartDate = `${date} ${from.time ?? '00:00'}`;
    const toEndDate = endTime ? `${date} ${endTime}` : undefined;
    const passEnd = parts(endDate);
    const to = parts(toStartDate)!;
    // 종료일 당일까지는 기간 안 — 날짜만 비교
    const afterEnd = !!passEnd && Date.UTC(to.year, to.month - 1, to.day) > Date.UTC(passEnd.year, passEnd.month - 1, passEnd.day);
    return { toStartDate, toEndDate, afterEnd };
  }, [selected, passTickets, upcoming, days, endDate, byId]);

  const submit = async () => {
    if (!selected || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await postponeRegularClassTicketAction({ id: regularClassId, ticketId: selected.id });
      if (isGuinnessErrorCase(res)) {
        const key = FALLBACK_MESSAGES[res.code];
        const message = SERVER_MESSAGE_CODES.has(res.code) && res.message
          ? res.message
          : key ? t(key) : (res.message || t('regular_class_reschedule_error_unknown'));
        // 동시 요청 충돌은 이미 처리됐을 수 있어 목록을 다시 받는다
        setResult({ ok: false, message, refresh: res.code === 'VERSION_CONFLICT' });
        return;
      }
      setResult({ ok: true, message: t('regular_class_reschedule_success').replace('{count}', String(Math.max(0, remaining - 1))), refresh: true });
    } catch {
      setResult({ ok: false, message: t('regular_class_reschedule_error_unknown'), refresh: false });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const canChange = remaining > 0;
  const limit = quota?.postponeLimit ?? 0;

  return (
    <BottomSheet ref={sheetRef} onClose={onClosed} locked={loading} title={t('regular_class_reschedule_action')} maxHeightVh={88}>
      <div className="px-6 overflow-y-auto">
        {/* 남은 횟수 — 맨 위에 크게(남은/한도). 다 썼으면 안내만 하고 고르기는 막는다 */}
        <div className="rounded-2xl bg-[#F7F8FA] px-4 py-3.5 flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-semibold text-[#4E5968] tracking-[-0.2px]">{t('regular_class_reschedule_remaining_label')}</span>
          <span className={`text-[20px] font-bold font-paperlogy ${canChange ? 'text-[#191F28]' : 'text-[#FF6B6B]'}`}>
            {remaining}<span className="text-[13px] text-[#B0B8C1] font-semibold"> / {limit}</span><span className="text-[13px] ml-0.5">{t('regular_class_reschedule_count_unit')}</span>
          </span>
        </div>

        <h3 className="mt-6 text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">{t('regular_class_reschedule_select_title')}</h3>
        <p className="mt-1 text-[13px] text-[#4E5968] tracking-[-0.2px] leading-[1.5]">{t('regular_class_reschedule_select_desc')}</p>

        {!canChange ? (
          <p className="py-8 text-center text-[14px] text-[#8B95A1]">{t('regular_class_reschedule_error_limit_exceeded')}</p>
        ) : candidates.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[#8B95A1]">{t('regular_class_reschedule_no_target')}</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {candidates.map((c) => {
              const on = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={loading}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex items-center gap-3 pl-3 pr-4 py-3 rounded-xl border text-left transition-colors ${on ? 'border-[#191F28] bg-[#F7F8FA]' : 'border-[#E5E8EB]'}`}
                >
                  {/* 수업 썸네일 — 공용 CircleImage. 없으면 같은 크기 회색 원 */}
                  {c.lesson?.thumbnailUrl
                    ? <CircleImage size={44} imageUrl={c.lesson.thumbnailUrl}/>
                    : <span className="w-11 h-11 rounded-full bg-[#F1F3F6] shrink-0"/>}
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">{c.lesson?.title}</span>
                    <span className="text-[12.5px] text-[#4E5968] tracking-[-0.2px]">{formatLessonWhen(locale, c.lesson?.startDate, endOf(c))}</span>
                  </span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${on ? 'bg-[#191F28]' : 'border-2 border-[#D1D6DB]'}`}>
                    {on && <Check size={13} strokeWidth={3} className="text-white"/>}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 새 수업 일정(예상) 미리보기 — 고르면 바로 보인다. 확정은 서버 */}
        {selected && (
          <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-semibold text-[#8B95A1]">{t('regular_class_reschedule_from')}</span>
              <span className="text-[14px] text-[#8B95A1] line-through tracking-[-0.2px]">{formatLessonWhen(locale, selected.lesson?.startDate, endOf(selected))}</span>
            </div>
            {preview && (
              <>
                <div className="h-px bg-[#E5E8EB]"/>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-semibold text-[#3B5BDB]">{t('regular_class_reschedule_to')}</span>
                  <span className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">{formatLessonWhen(locale, preview.toStartDate, preview.toEndDate)}</span>
                  {roomOf(selected) && <span className="text-[12.5px] text-[#4E5968]">{roomOf(selected)}</span>}
                </div>
                {preview.afterEnd && (
                  <p className="text-[12.5px] font-semibold text-[#F59E0B] tracking-[-0.2px]">{t('regular_class_reschedule_after_end')}</p>
                )}
              </>
            )}
          </div>
        )}

        {canChange && (
          <p className="mt-3 text-[12.5px] text-[#8B95A1] tracking-[-0.2px]">{t('regular_class_reschedule_irreversible')}</p>
        )}

        {/* 변경 이력 — 같은 시트 아래쪽에 (GET …/postpones, 최근 순) */}
        <div className="mt-6 pt-5 border-t border-[#F2F4F6]">
          <h3 className="text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">{t('regular_class_reschedule_history')}</h3>
          <HistoryList t={t} locale={locale} records={history}/>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-[52px] rounded-[14px] bg-[#F2F4F6] text-[#4E5968] text-[15px] font-bold active:opacity-80 disabled:opacity-50"
          >
            {canChange ? t('cancel') : t('confirm')}
          </button>
          {canChange && (
            <PrimaryButton onClick={submit} disabled={!selected} loading={loading} className="flex-[2]">
              {t('regular_class_reschedule_action')}
            </PrimaryButton>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

/** 옮겨간 쪽 표기 — 회차가 있으면 그 일시, 수업이 아직 없으면 날짜 + '수업 개설 대기', 배포 전 기록이면 '날짜 정보 없음' */
const toLabel = (t: (key: StringResourceKey) => string, locale: Locale, r: RegularClassPostponeResponse) => {
  if (r.toLesson) return formatLessonWhen(locale, r.toLesson.startDate);
  if (r.toDate) return `${formatLessonWhen(locale, r.toDate)} (${t('regular_class_reschedule_waiting_open')})`;
  return t('regular_class_reschedule_no_date');
};

const HistoryList = ({ t, locale, records }: { t: (key: StringResourceKey) => string; locale: Locale; records: RegularClassPostponeResponse[] }) => (
  <div>
    {records.length === 0 ? (
      <p className="py-6 text-center text-[13.5px] text-[#8B95A1]">{t('regular_class_reschedule_history_empty')}</p>
    ) : (
      <div className="flex flex-col divide-y divide-[#F2F4F6]">
        {records.map((r) => {
          const c = parts(r.postponedAt);
          const who = t(r.requestedBy === 'STUDIO' ? 'regular_class_reschedule_by_studio' : 'regular_class_reschedule_by_me');
          return (
            <div key={r.id} className="py-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">{r.fromLesson?.title ?? r.toLesson?.title}</span>
                <span className="shrink-0 text-[12px] text-[#B0B8C1]">
                  {who}{c && ` · ${t('regular_class_reschedule_changed_at').replace('{date}', `${c.month}.${c.day}`)}`}
                </span>
              </div>
              {r.fromLesson && (
                <span className="text-[13px] text-[#8B95A1] line-through tracking-[-0.2px]">{formatLessonWhen(locale, r.fromLesson.startDate)}</span>
              )}
              <span className="text-[14px] font-semibold text-[#191F28] tracking-[-0.2px]">→ {toLabel(t, locale, r)}</span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
