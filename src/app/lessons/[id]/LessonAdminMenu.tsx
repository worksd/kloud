'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CalendarX, MoreVertical, QrCode, UserPlus, Wallet } from 'lucide-react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { ArtistSettlementStatementResponse } from '@/app/endpoint/lesson.endpoint';
import { getLessonSettleUpAction } from '@/app/lessons/[id]/action/get.lesson.settleup.action';
import { cancelLessonAction } from '@/app/lessons/[id]/action/cancel.lesson.action';
import { getLessonTicketsAction } from '@/app/qrs/get.lesson.tickets.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

type Props = {
  lessonId: number;
  locale: Locale;
  /** artist면 '수강생 등록' 메뉴 노출 (초대 화면의 강사 경로 API가 studioId를 요구한다) */
  adminType?: 'artist' | 'partner';
  studioId?: number;
};

export function LessonAdminMenu({ lessonId, locale, adminType, studioId }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleUp, setSettleUp] = useState<ArtistSettlementStatementResponse | null>(null);
  const [settleLoading, setSettleLoading] = useState(false);

  const closeSheet = () => setSheetOpen(false);

  // 수업 취소 시트 — 사유 입력 + 되돌릴 수 없음 확인. 성공 시 리로드.
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  // state는 리렌더 전 연타를 못 막는다 — 실제 중복 POST 방지는 ref로.
  const cancellingRef = useRef(false);

  const onClickCancelLesson = async () => {
    closeSheet();
    setCancelReason('');
    setCancelError(null);
    setActiveCount(null);
    setCancelOpen(true);
    // 몇 명이 취소·환불되는지 미리 보여준다 (가이드: 실행 전 인원 고지)
    const tickets = await getLessonTicketsAction(lessonId);
    setActiveCount(tickets.filter((t) => t.status !== 'Cancelled' && t.status !== 'CancelPending').length);
  };

  const submitCancelLesson = async () => {
    if (cancellingRef.current) return; // 카드 환불이 수 초 걸릴 수 있어 중복 클릭 방지 (연타 포함)
    const reason = cancelReason.trim();
    if (!reason) {
      setCancelError(getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_reason_required' }));
      return;
    }
    cancellingRef.current = true;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelLessonAction(lessonId, reason);
      if (isGuinnessErrorCase(res)) {
        setCancelError(
          res.code === 'LESSON_ALREADY_ENDED'
            ? getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_ended_error' })
            : (res.message || getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_button' })),
        );
        return;
      }
      window.KloudEvent?.showToast?.(getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_success_message' }));
      // 상태(Cancelled)·수강권 목록 반영 — 서버 컴포넌트 페이지라 리로드가 가장 확실
      window.location.reload();
    } catch {
      setCancelError(getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_button' }));
    } finally {
      cancellingRef.current = false;
      setCancelling(false);
    }
  };

  const onClickQR = () => {
    closeSheet();
    kloudNav.push(KloudScreen.QRScanWithLesson(lessonId));
  };

  // 강사(artist)만 — 개인수업 수강생 등록 화면으로
  const canInvite = adminType === 'artist' && studioId != null;
  const onClickInvite = () => {
    closeSheet();
    if (studioId != null) kloudNav.push(KloudScreen.PrivateLessonInvite(lessonId, studioId));
  };

  // 강사 정산 보기 클릭 시 그때 fetch — 매 진입 시 fresh 응답.
  const onClickSettle = async () => {
    closeSheet();
    if (settleLoading) return;
    setSettleLoading(true);
    try {
      const res = await getLessonSettleUpAction({ lessonId });
      if (!res) {
        window.KloudEvent?.showToast?.('정산 정보를 불러오지 못했어요');
        return;
      }
      setSettleUp(res);
      setSettleOpen(true);
    } finally {
      setSettleLoading(false);
    }
  };

  // 시트/모달 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    const lock = sheetOpen || settleOpen || cancelOpen;
    if (!lock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen, settleOpen, cancelOpen]);

  const qrLabel = getLocaleString({ locale, key: 'lesson_admin_qr_attendance' });
  const settleLabel = getLocaleString({ locale, key: 'lesson_settle_up_title' });

  return (
    <>
      <button
        type={'button'}
        onClick={() => setSheetOpen(true)}
        aria-label={'menu'}
        className={'w-9 h-9 -mr-1 flex items-center justify-center rounded-full active:bg-[#F2F4F6] transition-colors'}
      >
        <MoreVertical size={20} className={'text-[#5C5C5C]'}/>
      </button>

      {/* 바텀시트 */}
      {sheetOpen && (
        <div
          className={'fixed inset-0 z-[60] flex items-end justify-center'}
          onClick={closeSheet}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[640px] bg-white rounded-t-[20px] pb-6 pt-2 animate-[slideUp_200ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={'mx-auto my-2 w-10 h-1 rounded-full bg-[#E5E7EB]'}/>
            {canInvite && (
              <button
                type={'button'}
                onClick={onClickInvite}
                className={'w-full flex items-center gap-3 px-6 py-4 active:bg-[#F7F8F9] transition-colors'}
              >
                <UserPlus size={20} className={'text-[#1E2124]'}/>
                <span className={'text-[15px] font-semibold text-black'}>
                  {getLocaleString({ locale, key: 'lesson_admin_invite_button' })}
                </span>
              </button>
            )}
            <button
              type={'button'}
              onClick={onClickQR}
              className={'w-full flex items-center gap-3 px-6 py-4 active:bg-[#F7F8F9] transition-colors'}
            >
              <QrCode size={20} className={'text-[#1E2124]'}/>
              <span className={'text-[15px] font-semibold text-black'}>{qrLabel}</span>
            </button>
            <button
              type={'button'}
              onClick={onClickSettle}
              disabled={settleLoading}
              className={'w-full flex items-center gap-3 px-6 py-4 active:bg-[#F7F8F9] transition-colors disabled:opacity-60'}
            >
              <Wallet size={20} className={'text-[#1E2124]'}/>
              <span className={'text-[15px] font-semibold text-black'}>
                {settleLoading ? `${settleLabel}…` : settleLabel}
              </span>
            </button>
            {/* 수업 취소 — adminType(관리자)일 때만 이 메뉴 자체가 렌더되므로 별도 가드 불필요 */}
            <button
              type={'button'}
              onClick={onClickCancelLesson}
              disabled={cancelling}
              className={'w-full flex items-center gap-3 px-6 py-4 active:bg-[#F7F8F9] transition-colors disabled:opacity-60'}
            >
              <CalendarX size={20} className={'text-[#E55B5B]'}/>
              <span className={'text-[15px] font-semibold text-[#E55B5B]'}>
                {getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_button' })}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 수업 취소 시트 — 사유 입력 + 되돌릴 수 없음 경고 */}
      {cancelOpen && (
        <div
          className={'fixed inset-0 z-[70] flex items-end justify-center'}
          onClick={() => { if (!cancelling) setCancelOpen(false); }}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[640px] bg-white rounded-t-[20px] px-6 pt-3 animate-[slideUp_200ms_ease-out]'}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={'mx-auto mb-3 w-10 h-1 rounded-full bg-[#E5E7EB]'}/>
            <p className={'text-[18px] font-bold text-black'}>
              {getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_button' })}
            </p>

            {/* 되돌릴 수 없음 + 인원 고지 */}
            <p className={'mt-2 text-[13px] leading-relaxed text-[#E55B5B] font-medium'}>
              {getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_warning' })
                .replace('{count}', activeCount === null ? '…' : String(activeCount))}
            </p>
            {/* 키오스크 카드결제 환불 대기 안내 */}
            <p className={'mt-1 text-[12px] leading-relaxed text-[#8B95A1]'}>
              {getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_kiosk_notice' })}
            </p>

            {/* 사유 — 수강생 알림톡에 그대로 노출 */}
            <p className={'mt-4 text-[13px] font-semibold text-black'}>
              {getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_reason_label' })}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => { setCancelReason(e.target.value); setCancelError(null); }}
              placeholder={getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_reason_placeholder' })}
              rows={2}
              disabled={cancelling}
              className={'mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] px-3.5 py-2.5 text-[14px] text-black placeholder-[#B1B8BE] outline-none focus:border-[#1E2124] resize-none disabled:opacity-60'}
            />
            <p className={'mt-1 text-[12px] text-[#8B95A1]'}>
              {getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_reason_notice' })}
            </p>

            {cancelError && (
              <p className={'mt-2 text-[13px] text-[#E55B5B] font-medium'}>{cancelError}</p>
            )}

            <div className={'mt-4 flex gap-2.5'}>
              <button
                type={'button'}
                onClick={() => setCancelOpen(false)}
                disabled={cancelling}
                className={'flex-[2] h-[48px] rounded-[12px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {getLocaleString({ locale, key: 'cancel' })}
              </button>
              <button
                type={'button'}
                onClick={submitCancelLesson}
                disabled={cancelling}
                className={'flex-[3] h-[48px] rounded-[12px] bg-[#E55B5B] text-[15px] font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {cancelling
                  ? `${getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_button' })}…`
                  : getLocaleString({ locale, key: 'lesson_admin_cancel_lesson_button' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정산 다이얼로그 */}
      {settleOpen && settleUp && (
        <SettleUpDialog
          data={settleUp}
          locale={locale}
          onClose={() => setSettleOpen(false)}
        />
      )}
    </>
  );
}

function SettleUpDialog({
  data,
  locale,
  onClose,
}: {
  data: ArtistSettlementStatementResponse;
  locale: Locale;
  onClose: () => void;
}) {
  const artistsHeading = getLocaleString({ locale, key: 'lesson_settle_up_artists' });
  const settleLabel = getLocaleString({ locale, key: 'lesson_settle_up_settle_amount' });
  const totalLabel = getLocaleString({ locale, key: 'lesson_settle_up_total_amount' });
  const settledLabel = getLocaleString({ locale, key: 'lesson_settle_up_status_settled' });
  const pendingLabel = getLocaleString({ locale, key: 'lesson_settle_up_status_pending' });
  const adjustReasonLabel = getLocaleString({ locale, key: 'lesson_settle_up_adjust_reason' });

  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 py-8 ${
        closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
      onClick={close}
    >
      <div className={'absolute inset-0 bg-black/60'}/>
      <div
        className={'relative w-full max-w-[480px] max-h-full bg-white rounded-[20px] flex flex-col overflow-hidden'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={'flex items-center justify-between px-5 py-4 border-b border-[#F1F3F6]'}>
          <div className={'flex flex-col min-w-0'}>
            <span className={'text-[12px] text-[#919191]'}>{data.date}</span>
            <span className={'mt-0.5 text-[16px] font-bold text-black truncate'}>{data.title}</span>
          </div>
          <button
            type={'button'}
            onClick={close}
            aria-label={'close'}
            className={'shrink-0 w-9 h-9 ml-2 rounded-full flex items-center justify-center active:bg-[#F2F4F6] transition-colors'}
          >
            <svg width={'18'} height={'18'} viewBox={'0 0 24 24'} fill={'none'}>
              <path d={'M6 6L18 18M6 18L18 6'} stroke={'#1E2124'} strokeWidth={'2'} strokeLinecap={'round'}/>
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className={'flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5'}>
          {/* 강사별 정산 */}
          {data.artists && data.artists.length > 0 && (
            <section className={'flex flex-col'}>
              <h3 className={'text-[14px] font-bold text-black'}>{artistsHeading}</h3>
              <div className={'mt-2 flex flex-col gap-2'}>
                {data.artists.map((a) => {
                  const settled = a.status === 'Settled';
                  return (
                  <div
                    key={a.id}
                    className={'flex flex-col rounded-[12px] bg-[#FAFAFA] border border-[#F1F3F6] p-3'}
                  >
                    <div className={'flex items-center gap-3'}>
                      <Image
                        src={a.profileImageUrl || '/assets/default_profile.png'}
                        alt={''}
                        width={40}
                        height={40}
                        className={'rounded-full object-cover w-10 h-10 flex-shrink-0'}
                      />
                      <div className={'flex-1 min-w-0'}>
                        <div className={'flex items-center gap-1.5'}>
                          <span className={'text-[13px] font-semibold text-black truncate'}>{a.nickName}</span>
                          {/* 강사별 정산 상태 배지 (record-aware) */}
                          <span
                            className={[
                              'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                              settled ? 'bg-[#E7F6F1] text-[#16A085]' : 'bg-[#FFF3E0] text-[#E08600]',
                            ].join(' ')}
                          >
                            {settled ? settledLabel : pendingLabel}
                          </span>
                        </div>
                        <div className={'mt-0.5 text-[10px] text-[#919191] truncate'}>{a.description}</div>
                      </div>
                      <div className={'flex flex-col items-end shrink-0'}>
                        <span className={'text-[10px] text-[#919191]'}>{settleLabel}</span>
                        <span className={'text-[14px] font-bold text-black leading-tight'}>{a.settleAmount.toLocaleString()}원</span>
                        <span className={'mt-0.5 text-[10px] text-[#919191]'}>
                          {totalLabel} {a.totalAmount.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                    {/* 정산완료 시 조정 사유 */}
                    {settled && a.adjustReason && (
                      <div className={'mt-2 rounded-[8px] bg-white border border-[#F1F3F6] px-2.5 py-1.5'}>
                        <span className={'text-[10px] font-semibold text-[#919191]'}>{adjustReasonLabel}</span>
                        <span className={'ml-1 text-[10px] text-[#5C5C5C]'}>{a.adjustReason}</span>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 강사 지급 내역 */}
          {data.settleUp && data.settleUp.items && data.settleUp.items.length > 0 && (
            <SectionBlock title={data.settleUp.title} items={data.settleUp.items}/>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  items,
}: {
  title: string;
  items: { key: string; value: string; type?: string }[];
}) {
  return (
    <section className={'flex flex-col'}>
      <h3 className={'text-[14px] font-bold text-black'}>{title}</h3>
      <dl className={'mt-2 flex flex-col'}>
        {items.map((item, idx) => {
          const isTotal = item.type === 'Total';
          return (
            <div
              key={`${item.key}-${idx}`}
              className={[
                'flex items-center justify-between py-2',
                idx > 0 && !isTotal ? 'border-t border-[#F7F8F9]' : '',
                isTotal ? 'mt-2 border-t border-[#E5E7EB] pt-3' : '',
              ].filter(Boolean).join(' ')}
            >
              <dt className={isTotal ? 'text-[13px] font-bold text-black' : 'text-[12px] text-[#5C5C5C]'}>
                {item.key}
              </dt>
              <dd className={isTotal ? 'text-[14px] font-bold text-black' : 'text-[12px] text-black'}>
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
