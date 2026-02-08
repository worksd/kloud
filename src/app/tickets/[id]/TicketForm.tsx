'use client';

import {SimpleHeader} from "@/app/components/headers/SimpleHeader";
import Image from "next/image";
import {Thumbnail} from "@/app/components/Thumbnail";
import StampCancel from "../../../../public/assets/stamp_cancel.svg";
import StampUsed from "../../../../public/assets/stamp_used.svg";
import StampNotPaid from "../../../../public/assets/stamp_not_paid.svg";
import Logo from "../../../../public/assets/logo_white.svg";
import {TicketResponse} from "@/app/endpoint/ticket.endpoint";
import {GuidelineResponse} from "@/app/endpoint/guideline.endpoint";
import {QRCodeCanvas} from 'qrcode.react';
import {Copy, RefreshCw} from 'lucide-react';
import {useState, useEffect, useRef} from "react";
import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {KloudScreen} from "@/shared/kloud.screen";
import {getLocaleString} from "@/app/components/locale";
import {Locale} from "@/shared/StringResource";
import {createDialog, DialogInfo} from "@/utils/dialog.factory";
import {deleteTicketAction} from "@/app/tickets/[id]/delete.ticket.action";
import {useRouter} from "next/navigation";
import {kloudNav} from "@/app/lib/kloudNav";
import TicketUsageSSEPage from "@/app/tickets/[id]/TicketUsageSSEPage";
import {refreshTicketAction} from "@/app/tickets/[id]/refresh.ticket.action";

// qrCodeUrl에서 expiredAt을 파싱하여 남은 시간(초) 계산 (KST 기준)
function calculateTimeLeft(qrCodeUrl?: string): number {
  if (!qrCodeUrl) return 0;
  try {
    const url = new URL(qrCodeUrl);
    const expiredAt = url.searchParams.get('expiredAt');
    if (!expiredAt) return 0;
    // expiredAt은 KST 시간이지만 Z가 붙어있으므로 9시간 보정
    const expiredTime = new Date(expiredAt).getTime();
    const kstOffset = 9 * 60 * 60 * 1000;
    const actualExpiredTime = expiredTime - kstOffset;
    const now = Date.now();
    const diffSeconds = Math.floor((actualExpiredTime - now) / 1000);
    return Math.max(0, diffSeconds);
  } catch {
    return 0;
  }
}

export function TicketForm({ticket, isJustPaid, inviteCode, locale, guidelines = [], endpoint = ''}: {
  ticket: TicketResponse,
  isJustPaid: string,
  inviteCode: string,
  locale: Locale,
  guidelines?: GuidelineResponse[],
  endpoint?: string
}) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(ticket.qrCodeUrl));
  const [qrCodeUrl, setQrCodeUrl] = useState(ticket.qrCodeUrl);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleCopyPaymentId = async () => {
    try {
      await navigator.clipboard.writeText(ticket.paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefreshQrCode = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await refreshTicketAction({ticketId: ticket.id});
      if ('id' in res && res.qrCodeUrl) {
        setQrCodeUrl(res.qrCodeUrl);
      }
    } catch (err) {
      console.error('Failed to refresh QR code:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Paid 상태일 때만 타이머 시작
    if (ticket.status !== 'Paid' || !qrCodeUrl) return;

    // 매초 expiredAt과 현재 시간을 비교하여 남은 시간 계산
    const updateTimeLeft = () => {
      const remaining = calculateTimeLeft(qrCodeUrl);
      setTimeLeft(remaining);
    };

    // 초기 실행
    updateTimeLeft();

    intervalRef.current = setInterval(updateTimeLeft, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ticket.status, qrCodeUrl]);

  // QR 코드 만료 시 다이얼로그 자동 닫기
  useEffect(() => {
    if (timeLeft === 0 && showQrDialog) {
      setShowQrDialog(false);
    }
  }, [timeLeft, showQrDialog]);

  // 페이지 복귀 시 스크롤 위치 초기화
  useEffect(() => {
    // 컴포넌트 마운트 시 스크롤 위치 초기화
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    
    // 페이지 visibility 변경 시에도 스크롤 위치 초기화
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [ticket.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancelClick = async () => {
    // LP로 시작하면 다이얼로그 띄우기
    if (ticket.paymentId.startsWith('LP')) {
      const dialog = await createDialog({id: 'CancelTicket'});
      if (dialog && window.KloudEvent) {
        window.KloudEvent.showDialog(JSON.stringify(dialog));
      }
    } else {
      // LT일 때는 기존 동작 유지 (환불 페이지로 이동)
      kloudNav.push(KloudScreen.PaymentRecordRefund(ticket.paymentId));
    }
  };

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id == 'CancelTicket' && ticket.paymentId.startsWith('LP')) {
        try {
          const res = await deleteTicketAction({ticketId: ticket.id});
          if (!res || 'id' in res) {
            // 성공 시 페이지 새로고침
            router.refresh();
          } else if ('message' in res) {
            // 에러 처리
            const errorDialog = await createDialog({
              id: 'Simple',
              message: res.message || '티켓 취소에 실패했습니다.'
            });
            if (errorDialog && window.KloudEvent) {
              window.KloudEvent.showDialog(JSON.stringify(errorDialog));
            }
          }
        } catch (error) {
          console.error('Ticket delete error:', error);
          const errorDialog = await createDialog({
            id: 'Simple',
            message: '티켓 취소 중 오류가 발생했습니다.'
          });
          if (errorDialog && window.KloudEvent) {
            window.KloudEvent.showDialog(JSON.stringify(errorDialog));
          }
        }
      }
    };
  }, [ticket.id, ticket.paymentId, locale, router]);

  // 티켓 렌더링 헬퍼 함수들
  const getBorderClass = () => {
    if (ticket.ticketType === 'membership') return 'border-membership';
    if (ticket.ticketType === 'premium') return 'border-premium';
    return '';
  };

  const getBorderRadius = () => {
    if (ticket.ticketType === 'membership' || ticket.ticketType === 'premium') {
      return 'rounded-t-[17px]';
    }
    return 'rounded-t-[20px]';
  };

  const getRollingBandColor = () => {
    return 'bg-black';
  };

  const isPaidOrUsed = ticket.status === 'Paid' || ticket.status === 'Used';
  const hasBorder = (ticket.ticketType === 'membership' || ticket.ticketType === 'premium') && isPaidOrUsed;
  const borderClass = getBorderClass();
  const borderRadius = getBorderRadius();
  const rollingBandColor = getRollingBandColor();

  // 타이머 렌더링 (Paid 상태이고 시간이 남아있을 때만)
  const renderTimer = () => {
    if (ticket.status !== 'Paid' || timeLeft === 0) return null;

    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / 120;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <div className="absolute top-4 right-4 z-20">
        <div className="timer-progress-container">
          <svg className="timer-progress-ring" width="40" height="40">
            <defs>
              <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 212, 56, 0.8)" />
                <stop offset="33%" stopColor="rgba(255, 150, 150, 0.8)" />
                <stop offset="66%" stopColor="rgba(150, 220, 200, 0.8)" />
                <stop offset="100%" stopColor="rgba(150, 200, 230, 0.8)" />
              </linearGradient>
            </defs>
            <circle
              className="timer-progress-ring-bg"
              cx="20"
              cy="20"
              r={radius}
            />
            <circle
              className="timer-progress-ring-fill"
              cx="20"
              cy="20"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="timer-progress-text">
            <span className="text-white text-[12px] font-bold font-paperlogy">{timeLeft}</span>
          </div>
        </div>
      </div>
    );
  };

  // 티켓 콘텐츠 JSX (중복 제거를 위해 함수로 추출)
  const renderTicketContent = () => (
    <div className="relative h-full flex flex-col gap-6 px-6 pt-8 pb-10">
      {renderTimer()}
      <div className="flex-1 flex flex-col justify-between pb-4 border-b border-[#2d2d2d]">
        <button
          onClick={handleCopyPaymentId}
          className="flex items-center gap-2 text-[12px] text-white/70 font-medium leading-[1.4] mb-0 hover:text-white/90 transition-colors active:opacity-70"
        >
          <Copy className="w-3 h-3 flex-shrink-0" />
          <span className={'font-paperlogy'}>{ticket.paymentId}</span>
          {copied && (
            <span className="text-[10px] text-white/50 ml-1">복사됨</span>
          )}
        </button>

        {/* 수업 정보 */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col">
            <h1 className="text-[24px] text-white font-bold leading-[1.4] mb-1">
              {ticket.lesson?.title}
            </h1>
            <div className="flex flex-row gap-1 items-center">
              {/* 날짜 or 반복 요일 */}
              {ticket.lesson?.formattedDate?.type === 'oneTime' ? (
                  <div className="flex items-center gap-1">
                    <p className="text-[18px] text-white font-bold font-paperlogy">
                      {ticket.lesson?.formattedDate?.date}
                    </p>
                    <p className="text-[13px] text-[#FFFFFF80] font-bold">
                      ({ticket.lesson?.formattedDate?.weekday})
                    </p>
                  </div>
              ) : (
                  <div className="flex items-center">
                    <p className="text-[18px] text-[#FFFFFF80] font-semibold">
                      ({ticket.lesson?.formattedDate?.daysOfWeek})
                    </p>
                  </div>
              )}

              {/* 시간 영역 */}
              <div className="flex items-center gap-2 ml-3 font-paperlogy">
                <p className="text-[30px] text-[#FFD438] font-bold leading-none">
                  {ticket.lesson?.formattedDate?.startTime}
                </p>
                <p className="text-[16px] text-[#FFFFFF80] font-medium leading-none">
                  ~ {ticket.lesson?.formattedDate?.endTime}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#f5f7fa] flex-shrink-0">
                {ticket.lesson?.studio?.profileImageUrl && (
                    <Image
                        src={ticket.lesson.studio.profileImageUrl}
                        alt="Studio"
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                    />
                )}
              </div>
              <p className="text-[16px] text-white font-medium">
                {ticket.lesson?.studio?.name}
              </p>
            </div>
            <p className="text-[20px] text-white font-bold">
              {ticket.lesson?.room?.name}
              {ticket.rank && ` - ${ticket.rank}`}
            </p>
          </div>
        </div>
      </div>

      {/* 사용자 정보 및 QR코드/스탬프 */}
      <div className="flex items-end">
        {/* 사용자 정보 */}
        <div className="flex-1 flex flex-col gap-2 relative pr-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                  className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${
                    ticket.ticketType === 'membership' && isPaidOrUsed
                      ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-black'
                      : ticket.ticketType === 'premium' && isPaidOrUsed
                      ? 'ring-2 ring-[#db2777] ring-offset-1 ring-offset-black'
                      : 'border border-white/30'
                  }`}>
                {ticket.user?.profileImageUrl && (
                    <Image
                        src={ticket.user.profileImageUrl}
                        alt="User"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                    />
                )}
              </div>
            </div>
            {ticket.ticketType === 'membership' && isPaidOrUsed && (
              <div className="membership-badge flex items-center gap-1.5 bg-gradient-to-r from-[#FFD700] via-[#FFF8DC] to-[#C0C0C0] px-3 py-1 rounded-full">
                <span className="text-[11px] font-bold text-[#1a1a1a] tracking-wide">
                  {ticket.ticketTypeLabel || 'MEMBERSHIP'}
                </span>
              </div>
            )}
            {ticket.ticketType === 'premium' && isPaidOrUsed && (
              <div className="premium-badge bg-gradient-to-r from-[#9333ea] via-[#db2777] to-[#6366f1] flex items-center justify-center px-3 py-1 rounded-full">
                <span className="text-[11px] font-bold text-white tracking-wide">
                  {ticket.ticketTypeLabel || 'PREMIUM'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-[14px] text-white font-bold leading-[22px] text-left">
              {ticket.user?.nickName}
              {ticket.user?.name ? ` (${ticket.user.name})` : ""}
            </p>
            <p className="text-[12px] text-white font-medium text-left leading-[20px]">
              {ticket.user?.email}
            </p>
          </div>
        </div>

        {/* QR코드 또는 스탬프 */}
        <div
            className={`w-[100px] h-[100px] rounded-[12px] flex items-center justify-center flex-shrink-0 p-2 relative ${
                ticket.status === 'Paid' && qrCodeUrl && timeLeft > 0 ? 'bg-white' : ''
            }`}>
          {ticket.status === 'Paid' && qrCodeUrl && timeLeft > 0 ? (
              <button onClick={() => setShowQrDialog(true)} className="cursor-pointer">
                <QRCodeCanvas
                    value={qrCodeUrl}
                    size={84}
                    className="w-full h-full"
                />
              </button>
          ) : ticket.status === 'Paid' && timeLeft === 0 ? (
              <button
                  onClick={handleRefreshQrCode}
                  disabled={isRefreshing}
                  className="timer-refresh-button"
              >
                <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
          ) : (
              <div className="flex items-center justify-center relative">
                {ticket.status === 'Cancelled' && (
                    <StampCancel className="scale-50"/>
                )}
                {(ticket.status === 'Used' || ticket.status === 'Expired') && (
                    <StampUsed className="scale-50"/>
                )}
                {ticket.status === 'Pending' && (
                    <StampNotPaid className="scale-50"/>
                )}
              </div>
          )}
        </div>
      </div>
    </div>
  );

  // 티켓 배경 JSX (중복 제거를 위해 함수로 추출)
  const renderTicketBackground = () => {
    const bgBorderRadius = ticket.ticketType === 'membership' || ticket.ticketType === 'premium'
      ? 'rounded-t-[17px]'
      : 'rounded-t-[20px]';

    return (
      <>
        {/* 티켓 배경 이미지 - divider까지 */}
        <div className={`absolute top-0 left-0 right-0 ${bgBorderRadius} overflow-hidden`} style={{ height: 'calc(100% - 200px)' }}>
          {ticket.lesson?.thumbnailUrl ? (
              <>
                <Image
                    src={ticket.lesson.thumbnailUrl}
                    alt="Ticket Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* title 영역 아래쪽에 gradient 적용 */}
                <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black via-black/50 to-transparent" />
              </>
          ) : <div className="h-full bg-gradient-to-b from-[#1a1a1a] via-[#2a2a2a] to-black" />}
        </div>

        {/* divider 아래 검은색 배경 */}
        <div className={`absolute bottom-0 left-0 right-0 h-[200px] bg-black`} />
      </>
    );
  };

  // 롤링 밴드 JSX (중복 제거를 위해 함수로 추출)
  const renderRollingBand = () => {
    if (ticket.status !== 'Paid' || timeLeft === 0) {
      return null;
    }

    return (
      <div
        className={`absolute bottom-0 left-0 w-full ${rollingBandColor} overflow-hidden flex items-center gap-5`}
      >
        <div className="flex animate-scroll-reverse-slow">
          <div className="flex shrink-0">
            {Array(2).fill(null).map((_, index) => (
              <div key={index} className="flex">
                {Array(50).fill(null).map((_, i) => (
                  <div key={`logo-${index}-${i}`}
                       className="w-[190px] h-[30px] flex-shrink-0 flex items-center">
                    <Logo className="w-full h-full scale-50"/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-neutral-900 ticket-container">
        {/* 배경 이미지 및 Backdrop Blur - 고정 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {ticket.lesson?.thumbnailUrl && (
              <Image
                  src={ticket.lesson.thumbnailUrl}
                  alt="Background"
                  fill
                  className="object-cover scale-110 blur-[10px]"
                  priority
              />
          )}
        </div>

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div ref={scrollContainerRef} className="fixed inset-0 z-10 overflow-y-auto overflow-x-hidden overscroll-none">
          {/* Header */}
          {inviteCode && (
              <div className="relative z-10 flex justify-between items-center">
                <SimpleHeader titleResource="ticket"/>
              </div>
          )}

          {/* 티켓 카드 */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-32">
            {hasBorder ? (
              <div className={`relative p-[3px] pb-0 rounded-t-[20px] ${borderClass}`}>
                <div className="relative rounded-t-[17px] overflow-hidden">
                  <div className="relative w-[350px] h-[500px]">
                    {renderTicketBackground()}
                    {renderTicketContent()}
                    {renderRollingBand()}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`relative w-[350px] h-[500px] ${borderRadius} overflow-hidden`}>
                {renderTicketBackground()}
                {renderTicketContent()}
                {renderRollingBand()}
              </div>
            )}

            {/* 하단 톱니 */}
            <div className="relative" style={{ marginTop: '-1px' }}>
              {hasBorder ? (
                <div
                  className={`ticket-ggodari ${
                    ticket.ticketType === 'membership' ? 'ticket-ggodari-membership' : 'ticket-ggodari-premium'
                  }`}
                  style={{ width: '356px', height: '55px' }}
                />
              ) : (
                <div className="ticket-ggodari ticket-ggodari-default relative" />
              )}
            </div>
          </div>

          {/* 취소하기 및 결제내역 버튼 */}
          <div className="flex items-center justify-center gap-6 px-[50px] py-5 relative z-10">
            <div className="bg-black/70 backdrop-blur-sm rounded-[12px] px-4 py-2 flex items-center gap-6">
              {ticket.isRefundable == true && (
                <>
                  <button
                    onClick={handleCancelClick}
                    className="text-[14px] font-medium text-white active:opacity-70 transition-opacity"
                  >
                    {getLocaleString({locale, key: 'do_cancel'})}
                  </button>
                  <div className="h-[14px] w-px bg-white/30"/>
                </>
              )}
              <NavigateClickWrapper
                method="push"
                route={KloudScreen.PaymentRecordDetail(ticket.paymentId)}
              >
                <button className="text-[14px] font-medium text-white active:opacity-70 transition-opacity">
                  {getLocaleString({locale, key: 'payment_records'})}
                </button>
              </NavigateClickWrapper>
            </div>
          </div>

          {/* 멤버십 정보 표시 (ticketType이 membership일 때) */}
          {ticket.ticketType === 'membership' && ticket.studio && (
            <div className="px-6 py-4 bg-white relative z-10">
              <div className="text-[16px] font-bold text-black mb-3">
                {getLocaleString({locale, key: 'membership_signup'})}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[14px] font-medium text-black">
                  {ticket.studio.name}
                </div>
                {ticket.ticketType === 'membership' && (
                  <div className="text-[12px] text-[#86898C]">
                    {getLocaleString({locale, key: 'membership_payment'})}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guidelines 섹션 */}
          {guidelines.length > 0 && (
            <div className="bg-white relative z-10 px-6 py-6 rounded-t-[20px] -mt-2">
              <div className="flex flex-col gap-6">
                {guidelines.map((guideline, index) => (
                  <div key={guideline.id} className="flex flex-col gap-2">
                    <h3 className="text-[14px] font-bold text-black leading-[1.4]">
                      {index + 1}. {guideline.title}
                    </h3>
                    <div
                      className="text-[14px] font-medium text-black leading-[1.6] guideline-content"
                      dangerouslySetInnerHTML={{ __html: guideline.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Paid 상태일 때 SSE 연결 */}
        {ticket.status === 'Paid' && endpoint && (
          <TicketUsageSSEPage ticketId={ticket.id} endpoint={endpoint} />
        )}

        {/* QR 코드 확대 다이얼로그 */}
        {showQrDialog && qrCodeUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowQrDialog(false)}
          >
            <div
              className="bg-white rounded-[20px] p-6 flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <QRCodeCanvas
                value={qrCodeUrl}
                size={280}
              />
              <div className="flex flex-col gap-1">
                <p className="text-[14px] text-gray-500 text-center">
                  {getLocaleString({locale, key: 'scan_qr_code'})}
                </p>
                <p className="text-[11px] text-gray-400 text-center">
                  {getLocaleString({locale, key: 'qr_capture_warning'})}
                </p>
              </div>
              <button
                onClick={() => setShowQrDialog(false)}
                className="w-full py-3 bg-black text-white rounded-[12px] font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
