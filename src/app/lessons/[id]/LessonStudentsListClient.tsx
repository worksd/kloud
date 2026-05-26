'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { TicketResponse } from '@/app/endpoint/ticket.endpoint';
import { Locale, StringResourceKey } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { createDialog, DialogInfo } from '@/utils/dialog.factory';
import { cancelTicketAction } from '@/app/lessons/[id]/action/cancel.ticket.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

const formatPhone = (phone: string) => {
  if (phone.length === 11) return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  if (phone.length === 10) return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  return phone;
};

const formatUserName = (
  nickName?: string, name?: string, phone?: string, email?: string,
) => {
  if (nickName && name) return `${nickName}(${name})`;
  if (name) return name;
  if (nickName) return nickName;
  if (phone) return formatPhone(phone);
  if (email) return email;
  return '사용자';
};

const ticketStatusKey = (status?: string): StringResourceKey | null => {
  if (status === 'Used') return 'ticket_status_used';
  if (status === 'Pending') return 'ticket_status_pending';
  if (status === 'Ready') return 'ticket_status_ready';
  if (status === 'Paid') return 'ticket_status_paid';
  if (status === 'Cancelled') return 'ticket_status_cancelled';
  if (status === 'CancelPending') return 'ticket_status_cancel_pending';
  if (status === 'Expired') return 'ticket_status_expired';
  if (status === 'Active') return 'ticket_status_active';
  return null;
};

const statusStyle = (status?: string) => {
  if (status === 'Used') return 'bg-[#F3F4F6] text-[#6B7280]';
  if (status === 'Pending') return 'bg-[#FFF4E5] text-[#A05A00]';
  if (status === 'Cancelled' || status === 'CancelPending') return 'bg-[#FEECEC] text-[#E55B5B]';
  if (status === 'Expired') return 'bg-[#F3F4F6] text-[#6B7280]';
  return 'bg-[#E8F5E9] text-[#2E7D32]';
};

// row 탭 → 바텀시트로 진입할 수 있는 상태. Paid 외에도 Used/Ready/Active 등 활성 티켓은 취소 가능.
const isActionable = (status?: string) =>
  status !== 'Cancelled' && status !== 'CancelPending' && status !== 'Expired';

export function LessonStudentsListClient({
  tickets: initial,
  lessonId: _lessonId,
  locale,
  adminType,
}: {
  tickets: TicketResponse[];
  lessonId: number;
  locale: Locale;
  /** 'partner'만 수강권 취소 가능. 'artist'는 row 탭 비활성. */
  adminType: 'artist' | 'partner';
}) {
  void _lessonId; // 시그니처 호환용 (기능에는 미사용)

  const canCancel = adminType === 'partner';

  const [tickets, setTickets] = useState<TicketResponse[]>(initial);
  const [processing, setProcessing] = useState<Set<number>>(new Set());
  const [sheetTicket, setSheetTicket] = useState<TicketResponse | null>(null);
  const [sheetClosing, setSheetClosing] = useState(false);

  const markProcessing = (ticketId: number, on: boolean) => {
    setProcessing((s) => {
      const next = new Set(s);
      if (on) next.add(ticketId);
      else next.delete(ticketId);
      return next;
    });
  };

  // CancelTicket dialog confirm 수신. 기존 핸들러 체인 보존.
  useEffect(() => {
    const prev = window.onDialogConfirm;
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id === 'CancelTicket' && data.customData) {
        const ticketId = Number(data.customData);
        if (!Number.isFinite(ticketId)) return;
        markProcessing(ticketId, true);
        try {
          const res = await cancelTicketAction(ticketId);
          if (isGuinnessErrorCase(res)) {
            window.KloudEvent?.showToast?.(res.message ?? '수강권 취소에 실패했어요');
            return;
          }
          // 취소 성공 시 로컬에서 상태 'Cancelled'로 즉시 전환 → 목록 필터링되어 사라짐.
          setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: 'Cancelled' } : t)));
          // 성공 안내 다이얼로그 (BE 응답의 message 우선, 없으면 기본 메시지)
          const okMessage = (res as { message?: string }).message
            ?? getLocaleString({ locale, key: 'lesson_admin_cancel_ticket_success_message' });
          const successDialog = await createDialog({ id: 'Simple', message: okMessage });
          if (successDialog && window.KloudEvent) {
            window.KloudEvent.showDialog(JSON.stringify(successDialog));
          }
        } finally {
          markProcessing(ticketId, false);
        }
        return;
      }
      await prev?.(data);
    };
    return () => {
      window.onDialogConfirm = prev;
    };
  }, []);

  // sheet 열려있는 동안 body 스크롤 잠금
  useEffect(() => {
    if (!sheetTicket) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sheetTicket]);

  const closeSheet = () => {
    if (sheetClosing) return;
    setSheetClosing(true);
    setTimeout(() => {
      setSheetTicket(null);
      setSheetClosing(false);
    }, 200);
  };

  const onClickRow = (ticket: TicketResponse) => {
    if (!isActionable(ticket.status)) return;
    if (processing.has(ticket.id)) return;
    setSheetTicket(ticket);
  };

  const onSheetCancel = async () => {
    const t = sheetTicket;
    if (!t) return;
    closeSheet();
    // 시트 닫힘 애니메이션 후 confirm dialog
    setTimeout(async () => {
      const userName = formatUserName(t.user?.nickName, t.user?.name, t.user?.phone, t.user?.email);
      const message = getLocaleString({ locale, key: 'lesson_admin_cancel_ticket_confirm_message' })
        .replace('{name}', userName);
      const dialog = await createDialog({
        id: 'CancelTicket',
        message,
        customData: String(t.id),
      });
      if (dialog && window.KloudEvent) {
        window.KloudEvent.showDialog(JSON.stringify(dialog));
      }
    }, 220);
  };

  const visible = tickets.filter(
    (t) => t.status !== 'Cancelled' && t.status !== 'CancelPending',
  );

  if (visible.length === 0) {
    return (
      <div className={'mt-4 py-6 text-center text-[13px] text-[#919191]'}>
        {getLocaleString({ locale, key: 'lesson_admin_no_students' })}
      </div>
    );
  }

  const cancelLabel = getLocaleString({ locale, key: 'lesson_admin_cancel_ticket_button' });

  return (
    <>
      <ul className={'mt-3 flex flex-col divide-y divide-[#F1F3F6]'}>
        {visible.map((ticket) => {
          const key = ticketStatusKey(ticket.status);
          const statusLabel = key ? getLocaleString({ locale, key }) : (ticket.status ?? '');
          const isProcessing = processing.has(ticket.id);
          const tappable = canCancel && isActionable(ticket.status) && !isProcessing;

          return (
            <li
              key={ticket.id}
              onClick={tappable ? () => onClickRow(ticket) : undefined}
              className={[
                'flex items-center gap-3 py-3 -mx-2 px-2 rounded-[10px]',
                tappable ? 'cursor-pointer active:bg-[#F7F8F9] transition-colors' : '',
                isProcessing ? 'opacity-60' : '',
              ].filter(Boolean).join(' ')}
            >
              <Image
                src={ticket.user?.profileImageUrl || '/assets/default_profile.png'}
                alt={''}
                width={36}
                height={36}
                className={'rounded-full object-cover w-9 h-9 flex-shrink-0'}
              />
              <div className={'flex-1 min-w-0'}>
                <div className={'text-[14px] font-semibold text-black truncate'}>
                  {formatUserName(ticket.user?.nickName, ticket.user?.name, ticket.user?.phone, ticket.user?.email)}
                </div>
                <div className={'mt-0.5 flex items-center gap-1.5 min-w-0 flex-wrap'}>
                  {statusLabel && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyle(ticket.status)}`}>
                      {statusLabel}
                    </span>
                  )}
                  {[ticket.rank, ticket.ticketTypeLabel, ticket.paymentRecord?.method]
                    .filter((v): v is string => Boolean(v))
                    .map((label, i, arr) => (
                      <React.Fragment key={`${label}-${i}`}>
                        {(i === 0 ? statusLabel : arr[i - 1]) && (
                          <span className={'text-[12px] text-[#919191]'}>·</span>
                        )}
                        <span className={'text-[12px] text-[#919191] truncate'}>{label}</span>
                      </React.Fragment>
                    ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 학생 row 탭 시 노출되는 액션 바텀시트 — 현재는 '취소하기' 한 메뉴 */}
      {sheetTicket && (
        <div
          className={`fixed inset-0 z-[60] flex items-end justify-center ${
            sheetClosing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeSheet}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[640px] bg-white rounded-t-[20px] pb-6 pt-2 animate-[slideUp_200ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={'mx-auto my-2 w-10 h-1 rounded-full bg-[#E5E7EB]'}/>
            <div className={'flex items-center gap-3 px-6 pb-3 pt-2'}>
              <Image
                src={sheetTicket.user?.profileImageUrl || '/assets/default_profile.png'}
                alt={''}
                width={44}
                height={44}
                className={'rounded-full object-cover w-11 h-11 flex-shrink-0'}
              />
              <div className={'flex flex-col min-w-0'}>
                <span className={'text-[14px] font-semibold text-black truncate'}>
                  {formatUserName(sheetTicket.user?.nickName, sheetTicket.user?.name, sheetTicket.user?.phone, sheetTicket.user?.email)}
                </span>
                {sheetTicket.user?.phone && (
                  <span className={'text-[12px] text-[#919191] truncate'}>{formatPhone(sheetTicket.user.phone)}</span>
                )}
                {(sheetTicket.rank || sheetTicket.ticketTypeLabel || sheetTicket.paymentRecord?.method) && (
                  <span className={'mt-0.5 text-[12px] text-[#919191] truncate'}>
                    {[sheetTicket.rank, sheetTicket.ticketTypeLabel, sheetTicket.paymentRecord?.method]
                      .filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            </div>
            <button
              type={'button'}
              onClick={onSheetCancel}
              className={'w-full flex items-center gap-3 px-6 py-4 active:bg-[#F7F8F9] transition-colors'}
            >
              <Trash2 size={20} className={'text-[#E55B5B]'}/>
              <span className={'text-[15px] font-semibold text-[#E55B5B]'}>{cancelLabel}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
