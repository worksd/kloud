'use client';
// 내 정규반 상세 — 수업 일정 변경. 오른쪽 위 ⋮ → 바로 '수업 일정 변경' 시트 하나(남은 횟수 + 변경할 수업 고르기 + 변경 이력).
// 모바일은 ⋮ 를 RegularClassTopBar(뒤로가기와 같은 줄)에, PC 는 헤더 카드 안. 시트는 전부 공용 BottomSheet.
// 변경하기: 다가오는 수업 중 하나를 고르면 새 일정을 바로 미리 보여주고, 확인하면 옮긴다.
// 새 일정 규칙 — 내 마지막 수업(이미 바꾼 새 일정 포함) 다음에 오는 가장 가까운 반 요일, 시간은 원래 수업 그대로.
// 이용 기간(endDate)을 넘어가도 허용하고 안내만 붙인다.
// 남은 횟수·변경 이력·바뀐 수업은 헤더와 목록이 함께 봐야 해서 Provider 하나가 들고, 시트도 여기서 하나만 그린다.
// 지금은 reschedule.mock.ts 로 동작.

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheet, BottomSheetHandle } from "@/app/components/BottomSheet";
import { HeaderBlurButton } from "@/app/components/buttons";
import { CircleImage } from "@/app/components/CircleImage";
import { Check, MoreVertical } from "lucide-react";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { PassRuleTicket } from "@/app/endpoint/pass.endpoint";
import { chipBase, formatLessonWhen, LessonRow, parts } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";
import { RescheduleRecord, rescheduleTicketMock } from "@/app/profile/myRegularClass/[id]/reschedule.mock";

// BE 에러 코드 → 사용자 문구. 모르는 코드는 서버 메시지, 그것도 없으면 일반 안내
const ERROR_MESSAGES: Record<string, StringResourceKey> = {
  LESSON_POSTPONE_NOT_ALLOWED: 'regular_class_reschedule_error_not_allowed',
  LESSON_POSTPONE_TOO_LATE: 'regular_class_reschedule_error_too_late',
  LESSON_POSTPONE_LIMIT_EXCEEDED: 'regular_class_reschedule_error_limit_exceeded',
  LESSON_POSTPONE_NO_SLOT: 'regular_class_reschedule_error_no_slot',
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

type Sheet =
  | { kind: 'select' }
  | { kind: 'result'; ok: boolean; message: string };

type Ctx = {
  locale: Locale;
  remaining: number;
  records: RescheduleRecord[];
  open: (sheet: Sheet) => void;
};

const RescheduleContext = createContext<Ctx | null>(null);

export const RegularClassRescheduleProvider = ({ locale, tickets, days, endDate, limit, used, history, children }: {
  locale: Locale;
  tickets: PassRuleTicket[];
  /** 반 요일(0=일 ~ 6=토). 비어 있으면 고른 수업의 요일로 매주 잡는다 */
  days: number[];
  /** 정규반 이용 종료일 — 넘어가면 안내만 */
  endDate?: string;
  limit: number;
  used: number;
  history: RescheduleRecord[];
  children: React.ReactNode;
}) => {
  const [remaining, setRemaining] = useState(Math.max(0, limit - used));
  const [records, setRecords] = useState(history);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const t = (key: StringResourceKey) => getLocaleString({ locale, key });

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
    <RescheduleContext.Provider value={{ locale, remaining, records, open: go }}>
      {children}
      {/* key 로 시트마다 새로 마운트 — 매번 slideUp 이 다시 탄다 */}
      {sheet?.kind === 'select' && (
        <SelectSheet
          key="select"
          sheetRef={sheetRef}
          onClosed={onClosed}
          t={t}
          locale={locale}
          tickets={tickets}
          days={days}
          endDate={endDate}
          remaining={remaining}
          records={records}
          onCancel={() => go(null)}
          onDone={(res) => {
            if (res.ok) {
              setRemaining(res.remaining);
              setRecords((prev) => [...prev, res.record]);
              go({ kind: 'result', ok: true, message: t('regular_class_reschedule_success').replace('{count}', String(res.remaining)) });
            } else {
              go({ kind: 'result', ok: false, message: res.message });
            }
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

/** ⋮ 메뉴 버튼 (공용 HeaderBlurButton, 배경 원 없이 — isBlur 면 블러 원을 안 그린다). 모바일은 RegularClassTopBar, PC 는 헤더 카드 안. */
export const RescheduleMenuButton = ({ light = false }: { /** 이미지 위 — 흰 아이콘 */ light?: boolean }) => {
  const ctx = useContext(RescheduleContext);
  if (!ctx) return null;
  return (
    <HeaderBlurButton isBlur originProps={{
      type: 'button',
      'aria-label': getLocaleString({ locale: ctx.locale, key: 'regular_class_reschedule_action' }),
      onClick: () => ctx.open({ kind: 'select' }),
    }}>
      <MoreVertical size={22} className={`transition-colors ${light ? 'text-white drop-shadow' : 'text-[#191F28]'}`}/>
    </HeaderBlurButton>
  );
};

/** 목록 행의 상태 칩 — 일정을 바꾼 수업이면 '변경됨'으로 덮는다
 *  TODO(2026-10-26): API 연동 — 서버 수강권 상태(변경됨)로 그리게 되면 이 로컬 덮어쓰기 제거 */
export const RescheduleAwareChip = ({ ticketId, children }: { ticketId: number; children: React.ReactNode }) => {
  const ctx = useContext(RescheduleContext);
  if (!ctx?.records.some((r) => r.ticketId === ticketId)) return <>{children}</>;
  return <span className={`${chipBase} bg-[#F2F4F6] text-[#8B95A1]`}>{getLocaleString({ locale: ctx.locale, key: 'regular_class_reschedule_changed' })}</span>;
};

/** 일정 변경으로 새로 잡힌 수업 행 — 아직 수강권 id 가 없어(목) 탭 이동은 없다
 *  TODO(2026-10-26): API 연동 — 새 수강권이 서버 목록(passRule.tickets)에 실려 오면 이 클라이언트 행 제거 */
export const RescheduledLessonRows = () => {
  const ctx = useContext(RescheduleContext);
  if (!ctx || ctx.records.length === 0) return null;
  const now = Date.now();
  const rows = ctx.records
    .filter((r) => (parts(r.toStartDate)?.at ?? 0) > now)
    .sort((a, b) => (parts(a.toStartDate)?.at ?? 0) - (parts(b.toStartDate)?.at ?? 0));
  return (
    <>
      {rows.map((r) => (
        <LessonRow
          key={r.id}
          title={r.title}
          startDate={r.toStartDate}
          endDate={r.toEndDate}
          roomName={r.roomName}
          locale={ctx.locale}
          isPast={false}
          chip={<span className={`${chipBase} bg-[#EEF3FF] text-[#3B5BDB]`}>{getLocaleString({ locale: ctx.locale, key: 'regular_class_reschedule_new' })}</span>}
        />
      ))}
    </>
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

type SelectResult =
  | { ok: true; record: RescheduleRecord; remaining: number }
  | { ok: false; message: string };

const SelectSheet = ({ sheetRef, onClosed, t, locale, tickets, days, endDate, remaining, records, onCancel, onDone }: {
  sheetRef: React.Ref<BottomSheetHandle>;
  /** BottomSheet 닫힘 애니메이션 끝 */
  onClosed: () => void;
  t: (key: StringResourceKey) => string;
  locale: Locale;
  tickets: PassRuleTicket[];
  days: number[];
  endDate?: string;
  remaining: number;
  records: RescheduleRecord[];
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

  const now = Date.now();
  const changedIds = new Set(records.map((r) => r.ticketId));
  // 고를 수 있는 수업 — 시작 전 + 아직 안 쓴(Paid) + 이미 바꾼 수업 아님
  const candidates = tickets
    .filter((tk) => tk.status === 'Paid' && !changedIds.has(tk.id) && (parts(tk.lesson?.startDate)?.at ?? 0) > now)
    .sort((a, b) => (parts(a.lesson?.startDate)?.at ?? 0) - (parts(b.lesson?.startDate)?.at ?? 0));

  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  // 새 일정 — 내 마지막 수업(취소 제외, 바꾼 새 일정 포함) 다음의 가장 가까운 반 요일, 시간은 고른 수업 그대로
  // TODO(2026-10-26): API 연동 — 서버가 미리보기(배정될 회차)를 내려주면 그 값으로 교체 (지금은 화면에서 계산)
  const preview = useMemo(() => {
    if (!selected) return null;
    const from = parts(selected.lesson?.startDate);
    if (!from) return null;
    const starts = [
      ...tickets.filter((tk) => tk.status !== 'Cancelled').map((tk) => tk.lesson?.startDate),
      ...records.map((r) => r.toStartDate),
    ].map((s) => parts(s)).filter((p): p is NonNullable<typeof p> => !!p);
    const last = starts.reduce((a, b) => (b.at > a.at ? b : a), from);
    const allowed = days.length > 0 ? days : [from.weekday];
    const date = nextClassDay(last, allowed);
    if (!date) return null;
    const endTime = parts(selected.lesson?.endDate)?.time;
    const toStartDate = `${date} ${from.time ?? '00:00'}`;
    const toEndDate = endTime ? `${date} ${endTime}` : undefined;
    const passEnd = parts(endDate);
    const to = parts(toStartDate)!;
    // 종료일 당일까지는 기간 안 — 날짜만 비교
    const afterEnd = !!passEnd && Date.UTC(to.year, to.month - 1, to.day) > Date.UTC(passEnd.year, passEnd.month - 1, passEnd.day);
    return { toStartDate, toEndDate, afterEnd };
  }, [selected, tickets, records, days, endDate]);

  const submit = async () => {
    if (!selected || !preview || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      // TODO(2026-10-26): API 연동 — 수업 일정 변경 API 로 교체. 성공 후엔 router.refresh() 로 서버 목록을 다시 받는다
      const res = await rescheduleTicketMock({
        remaining,
        ticketId: selected.id,
        title: selected.lesson?.title ?? '',
        roomName: selected.lesson?.room?.name,
        fromStartDate: selected.lesson?.startDate ?? '',
        fromEndDate: selected.lesson?.endDate,
        toStartDate: preview.toStartDate,
        toEndDate: preview.toEndDate,
      });
      if (isGuinnessErrorCase(res)) {
        const key = ERROR_MESSAGES[res.code];
        setResult({ ok: false, message: key ? t(key) : (res.message || t('regular_class_reschedule_error_unknown')) });
        return;
      }
      setResult({ ok: true, record: res.record, remaining: res.remainingCount });
    } catch {
      setResult({ ok: false, message: t('regular_class_reschedule_error_unknown') });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const canChange = remaining > 0;

  return (
    <BottomSheet ref={sheetRef} onClose={onClosed} locked={loading} title={t('regular_class_reschedule_action')} maxHeightVh={88}>
      <div className="px-6 overflow-y-auto">
        {/* 남은 횟수 — 맨 위에 크게. 다 썼으면 안내만 하고 고르기는 막는다 */}
        <div className="rounded-2xl bg-[#F7F8FA] px-4 py-3.5 flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-semibold text-[#4E5968] tracking-[-0.2px]">{t('regular_class_reschedule_remaining_label')}</span>
          <span className={`text-[20px] font-bold font-paperlogy ${canChange ? 'text-[#191F28]' : 'text-[#FF6B6B]'}`}>
            {remaining}<span className="text-[13px] ml-0.5">{t('regular_class_reschedule_count_unit')}</span>
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
                  {/* 수업 썸네일 — 공용 CircleImage. 없으면 같은 크기 회색 원 (헤더 학원 로고와 같은 처리) */}
                  {c.lesson?.thumbnailUrl
                    ? <CircleImage size={44} imageUrl={c.lesson.thumbnailUrl}/>
                    : <span className="w-11 h-11 rounded-full bg-[#F1F3F6] shrink-0"/>}
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">{c.lesson?.title}</span>
                    <span className="text-[12.5px] text-[#4E5968] tracking-[-0.2px]">{formatLessonWhen(locale, c.lesson?.startDate, c.lesson?.endDate)}</span>
                  </span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${on ? 'bg-[#191F28]' : 'border-2 border-[#D1D6DB]'}`}>
                    {on && <Check size={13} strokeWidth={3} className="text-white"/>}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 새 수업 일정 미리보기 — 고르면 바로 보인다 */}
        {selected && preview && (
          <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-semibold text-[#8B95A1]">{t('regular_class_reschedule_from')}</span>
              <span className="text-[14px] text-[#8B95A1] line-through tracking-[-0.2px]">{formatLessonWhen(locale, selected.lesson?.startDate, selected.lesson?.endDate)}</span>
            </div>
            <div className="h-px bg-[#E5E8EB]"/>
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-semibold text-[#3B5BDB]">{t('regular_class_reschedule_to')}</span>
              <span className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">{formatLessonWhen(locale, preview.toStartDate, preview.toEndDate)}</span>
              {selected.lesson?.room?.name && <span className="text-[12.5px] text-[#4E5968]">{selected.lesson.room.name}</span>}
            </div>
            {preview.afterEnd && (
              <p className="text-[12.5px] font-semibold text-[#F59E0B] tracking-[-0.2px]">{t('regular_class_reschedule_after_end')}</p>
            )}
          </div>
        )}

        {canChange && (
          <p className="mt-3 text-[12.5px] text-[#8B95A1] tracking-[-0.2px]">{t('regular_class_reschedule_irreversible')}</p>
        )}

        {/* 변경 이력 — 같은 시트 아래쪽에 */}
        <div className="mt-6 pt-5 border-t border-[#F2F4F6]">
          <h3 className="text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">{t('regular_class_reschedule_history')}</h3>
          <HistoryList t={t} locale={locale} records={records}/>
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
            <PrimaryButton onClick={submit} disabled={!preview} loading={loading} className="flex-[2]">
              {t('regular_class_reschedule_action')}
            </PrimaryButton>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

const HistoryList = ({ t, locale, records }: { t: (key: StringResourceKey) => string; locale: Locale; records: RescheduleRecord[] }) => {
  // 최근 변경부터
  const list = [...records].sort((a, b) => (parts(b.changedAt)?.at ?? 0) - (parts(a.changedAt)?.at ?? 0));
  return (
    <div>
      {list.length === 0 ? (
        <p className="py-6 text-center text-[13.5px] text-[#8B95A1]">{t('regular_class_reschedule_history_empty')}</p>
      ) : (
        <div className="flex flex-col divide-y divide-[#F2F4F6]">
          {list.map((r) => {
            const c = parts(r.changedAt);
            return (
              <div key={r.id} className="py-3.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">{r.title}</span>
                  {c && (
                    <span className="shrink-0 text-[12px] text-[#B0B8C1]">
                      {t('regular_class_reschedule_changed_at').replace('{date}', `${c.month}.${c.day}`)}
                    </span>
                  )}
                </div>
                <span className="text-[13px] text-[#8B95A1] line-through tracking-[-0.2px]">{formatLessonWhen(locale, r.fromStartDate, r.fromEndDate)}</span>
                <span className="text-[14px] font-semibold text-[#191F28] tracking-[-0.2px]">→ {formatLessonWhen(locale, r.toStartDate, r.toEndDate)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
