'use client';

import {SimpleHeader} from "@/app/components/headers/SimpleHeader";
import Image from "next/image";
import {Thumbnail} from "@/app/components/Thumbnail";
import StampCancel from "../../../../public/assets/stamp_cancel.svg";
import StampUsed from "../../../../public/assets/stamp_used.svg";
import StampNotPaid from "../../../../public/assets/stamp_not_paid.svg";
import Logo from "../../../../public/assets/logo_white.svg";
import TicketGgodari from "../../../../public/assets/ticket-ggodari.svg";
import {TicketResponse} from "@/app/endpoint/ticket.endpoint";
import {QRCodeCanvas} from 'qrcode.react';
import {Copy} from 'lucide-react';
import {useState, useEffect, useRef} from "react";

export function TicketForm({ticket, isJustPaid, inviteCode}: {
  ticket: TicketResponse,
  isJustPaid: string,
  inviteCode: string
}) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60초 = 1분
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyPaymentId = async () => {
    try {
      await navigator.clipboard.writeText(ticket.paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    // 타이머 시작
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0:${secs.toString().padStart(2, '0')}`;
  };

  return (
      <div className={`relative w-full h-screen overflow-y-auto ${ticket.status === 'Cancelled' ? 'overflow-x-hidden' : ''} bg-white ticket-container`} style={{ overscrollBehaviorY: 'none' }}>
        {/* 배경 이미지 및 Backdrop Blur */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 -inset-[10%]">
            {ticket.lesson?.thumbnailUrl && (
                <Image
                    src={ticket.lesson.thumbnailUrl}
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
            )}
          </div>
          <div className="absolute inset-0 backdrop-blur-[10px]"/>
        </div>

        {/* Header */}
        {inviteCode && (
            <div className="relative z-10 flex justify-between items-center">
              <SimpleHeader titleResource="ticket"/>
            </div>
        )}

        {/* 티켓 카드 */}
        <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen pt-32 ${ticket.status != 'Paid' ? 'pb-[5px]' : 'pb-[40px]'}`}>
          <div className={`relative w-[350px] h-[500px] ${ticket.status === 'Cancelled' ? 'rounded-t-[20px]' : ''}`}>

            {/* 티켓 배경 이미지 - divider까지 */}
            <div className={`absolute top-0 left-0 right-0 rounded-t-[20px] overflow-hidden`} style={{ height: 'calc(100% - 200px)' }}>
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

            {/* 티켓 내용 */}
            <div className={`relative h-full flex flex-col gap-6 px-6 pt-8 ${ticket.status === 'Paid' ? 'pb-10' : 'pb-0'}`}>
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
                    </p>
                  </div>
                </div>
              </div>

              {/* 사용자 정보 및 QR코드/스탬프 */}
              <div className="flex items-end">
                {/* 사용자 정보 */}
                <div className="flex-1 flex flex-col gap-2 relative">
                  {/* Dim 오버레이 */}
                  <div
                      className="w-10 h-10 rounded-full overflow-hidden border flex-shrink-0">
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
                        ticket.status === 'Paid' && ticket.qrCodeUrl ? 'bg-white' : ''
                    }`}>
                  {ticket.status === 'Paid' && ticket.qrCodeUrl ? (
                      <div>
                        <QRCodeCanvas
                            value={ticket.qrCodeUrl}
                            size={84}
                            className="w-full h-full"
                        />
                      </div>

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

            {/* Rawgraphy 롤링밴드 (Paid일 때만) */}
            {ticket.status === 'Paid' && (
                <div
                    className="absolute bottom-0 left-0 w-full h-[28px] bg-black overflow-hidden flex items-center gap-5">
                  <div className="flex animate-scroll-reverse-slow">
                    <div className="flex shrink-0">
                      {Array(2).fill(null).map((_, index) => (
                          <div key={index} className="flex">
                            {Array(50).fill(null).map((_, i) => (
                                <div key={`logo-${index}-${i}`}
                                     className="w-[200px] h-[24px] flex-shrink-0 flex items-center">
                                  <Logo className="w-full h-full scale-75"/>
                                </div>
                            ))}
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* 하단 ticket-ggodari.svg */}
          <div className="w-full flex justify-center">
            <TicketGgodari className="w-full max-w-[350px] h-auto"/>
          </div>

          {/* 환불안내사항 */}
          <div className="w-full bg-[#f4f6f8] mt-10 rounded-t-[24px] px-5 py-10 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#3e4044] font-bold leading-[1.4]">
                1. 법적 근거
              </p>
              <ul className="text-[14px] text-[#585a5d] font-medium leading-[1.5] list-disc list-inside space-y-1">
                <li>수강료 환불은 「학원의 설립·운영 및 과외교습에 관한 법률 시행규칙」 제18조 제3항 [별표 4]에 따라 진행됩니다.</li>
                <li>해당 규정에 의거하여 수업 시작 전·후 환불 금액이 산정됩니다.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#3e4044] font-bold leading-[1.4]">
                2. 패스권 환불 규정
              </p>
              <ul className="text-[14px] text-[#585a5d] font-medium leading-[1.5] list-disc list-inside space-y-1">
                <li>패스권의 경우 아래 조건 충족 시 환불이 가능합니다.</li>
                <li>만료기간이 남아 있을 것</li>
                <li>잔여 이용 가능 횟수가 존재할 것</li>
                <li>환불 시에는 구매 금액 − 기 이용한 수업 금액을 기준으로 금액이 산정됩니다.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#3e4044] font-bold leading-[1.4]">
                3. 입점 스튜디오(판매자)별 환불 정책
              </p>
              <ul className="text-[14px] text-[#585a5d] font-medium leading-[1.5] list-disc list-inside space-y-1">
                <li>입점사(판매자)별로 상이한 환불 정책을 적용할 수 있습니다.</li>
                <li>이에 해당하는 경우 입점사의 개별 환불 정책이 우선 적용됩니다.</li>
                <li>자세한 환불 절차·필요 정보·가능 조건은 이용 중인 각 스튜디오에 문의하시면 안내받으실 수 있습니다.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#3e4044] font-bold leading-[1.4]">
                4. 로우그래피의 역할 (통신판매중개업자)
              </p>
              <ul className="text-[14px] text-[#585a5d] font-medium leading-[1.5] list-disc list-inside space-y-1">
                <li>로우그래피(주)는 통신판매중개업자로서 다음의 역할을 수행합니다.</li>
                <li>결제 및 예약 시스템 제공</li>
                <li>판매자가 제공하는 상품·서비스 정보의 관리</li>
                <li>고객센터 운영 및 기본적인 고객 지원 제공</li>
                <li>분쟁 또는 불만 발생 시 신속한 중재 및 처리 지원</li>
                <li>거래 확인 요청 시 관련 정보의 성실한 회신 의무</li>
                <li>단, 실제 서비스 제공의 1차적 책임(수업 일정·내용·품질 등)은 판매자에게 있습니다.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#3e4044] font-bold leading-[1.4]">
                5. 취소 가능 시점
              </p>
              <ul className="text-[14px] text-[#585a5d] font-medium leading-[1.5] list-disc list-inside space-y-1">
                <li>로우그래피는 수업일 기준 전일까지 취소 및 환불이 가능하도록 시스템 기능을 제공하고 있습니다.</li>
                <li>단, 구체적인 규정은 각 스튜디오 정책에 따라 달라질 수 있습니다.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] text-[#3e4044] font-bold leading-[1.4]">
                6. 문의처
              </p>
              <ul className="text-[14px] text-[#585a5d] font-medium leading-[1.5] list-disc list-inside space-y-1">
                <li>환불 절차, 환불 가능 여부, 스튜디오별 규정 등 구체적인 문의는 <span className="font-bold">이용 중인 스튜디오(판매자)</span>로 연락하시면 가장 정확한 안내를 받으실 수 있습니다.</li>
                <li>추가 문의는 아래 고객센터로도 가능합니다.</li>
                <li>고객센터 전화번호: 050-6774-3302</li>
                <li>운영시간: 월–토 13:00–22:00</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}
