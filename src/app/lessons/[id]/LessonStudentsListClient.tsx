'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { TicketResponse } from '@/app/endpoint/ticket.endpoint';
import { Locale, StringResourceKey } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { createDialog, DialogInfo } from '@/utils/dialog.factory';
import { useAction } from '@/app/qrs/use.action';
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

export function LessonStudentsListClient({
  tickets: initial,
  lessonId,
  locale,
}: {
  tickets: TicketResponse[];
  lessonId: number;
  locale: Locale;
}) {
  const [tickets, setTickets] = useState<TicketResponse[]>(initial);
  const [processing, setProcessing] = useState<Set<number>>(new Set());

  // ConfirmAttendance dialog confirm 수신용. 기존 핸들러 체인 보존.
  useEffect(() => {
    const prev = window.onDialogConfirm;
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id === 'ConfirmAttendance' && data.customData) {
        const ticketId = Number(data.customData);
        if (!Number.isFinite(ticketId)) return;
        setProcessing((s) => {
          const next = new Set(s);
          next.add(ticketId);
          return next;
        });
        try {
          const res = await useAction({ ticketId, lessonId });
          if (isGuinnessErrorCase(res)) {
            window.KloudEvent?.showToast?.(res.message ?? '출석 처리에 실패했어요');
            return;
          }
          setTickets((prevTickets) =>
            prevTickets.map((t) => (t.id === ticketId ? { ...t, status: 'Used' } : t)),
          );
        } finally {
          setProcessing((s) => {
            const next = new Set(s);
            next.delete(ticketId);
            return next;
          });
        }
        return;
      }
      await prev?.(data);
    };
    return () => {
      window.onDialogConfirm = prev;
    };
  }, [lessonId]);

  const onClickAttendance = async (ticket: TicketResponse) => {
    const userName = formatUserName(
      ticket.user?.nickName, ticket.user?.name, ticket.user?.phone, ticket.user?.email,
    );
    const message = getLocaleString({ locale, key: 'lesson_admin_attendance_confirm_message' })
      .replace('{name}', userName);
    const dialog = await createDialog({
      id: 'ConfirmAttendance',
      message,
      customData: String(ticket.id),
    });
    if (dialog && window.KloudEvent) {
      window.KloudEvent.showDialog(JSON.stringify(dialog));
    }
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

  return (
    <ul className={'mt-3 flex flex-col divide-y divide-[#F1F3F6]'}>
      {visible.map((ticket) => {
        const key = ticketStatusKey(ticket.status);
        const statusLabel = key ? getLocaleString({ locale, key }) : (ticket.status ?? '');
        const isPaid = ticket.status === 'Paid';
        const isProcessing = processing.has(ticket.id);
        const tappable = isPaid && !isProcessing;

        return (
          <li
            key={ticket.id}
            onClick={tappable ? () => onClickAttendance(ticket) : undefined}
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
              <div className={'mt-0.5 flex items-center gap-1.5 min-w-0'}>
                {statusLabel && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyle(ticket.status)}`}>
                    {statusLabel}
                  </span>
                )}
                {statusLabel && (ticket.rank || ticket.ticketTypeLabel) && (
                  <span className={'text-[12px] text-[#919191]'}>·</span>
                )}
                {ticket.rank && (
                  <span className={'text-[12px] text-[#919191] truncate'}>{ticket.rank}</span>
                )}
                {ticket.rank && ticket.ticketTypeLabel && (
                  <span className={'text-[12px] text-[#919191]'}>·</span>
                )}
                {ticket.ticketTypeLabel && (
                  <span className={'text-[12px] text-[#919191] truncate'}>{ticket.ticketTypeLabel}</span>
                )}
              </div>
            </div>
            {tappable && (
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={'shrink-0 text-[#919191]'}
              >
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </li>
        );
      })}
    </ul>
  );
}
