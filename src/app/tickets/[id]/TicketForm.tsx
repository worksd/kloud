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

export function TicketForm({ticket, isJustPaid, inviteCode}: {
  ticket: TicketResponse,
  isJustPaid: string,
  inviteCode: string
}) {

  return (
      <div className="relative w-full h-screen overflow-hidden bg-white">
        {/* 배경 이미지 및 Backdrop Blur */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            {ticket.lesson?.thumbnailUrl && (
                <Thumbnail url={ticket.lesson.thumbnailUrl}/>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/10"/>
          </div>
          <div
              className="absolute inset-0 backdrop-blur-[10px] bg-gradient-to-b from-black/20 via-black/10 to-black/10"/>
        </div>

        {/* Header */}
        {inviteCode && (
            <div className="relative z-10 flex justify-between items-center">
              <SimpleHeader titleResource="ticket"/>
            </div>
        )}

        {/* 티켓 카드 */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 pt-[120px] pb-[40px]">
          <div className="relative w-[350px] h-[600px]">
            {/* 티켓 배경 이미지 */}
            <div className="absolute inset-0 rounded-t-[20px] rounded-b-none overflow-hidden">
              {ticket.lesson?.thumbnailUrl ? (
                  <>
                    <Image
                        src={ticket.lesson.thumbnailUrl}
                        alt="Ticket Background"
                        fill
                        className="object-cover"
                        priority
                    />
                  </>
              ) : <div></div>}
            </div>

            <div
                className="absolute bottom-0 left-0 w-full h-[540px] pointer-events-none bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>

            {/* 티켓 내용 */}
            <div className="relative h-full flex flex-col gap-[32px] px-6 pt-8 pb-10">
              {/* 티켓 ID */}
              <div className="flex-1 flex flex-col justify-between pb-8 border-b border-[#2d2d2d]">
                <p className="text-[12px] text-white/70 font-medium leading-[1.4] mb-0">
                  {ticket.paymentId}
                </p>

                {/* 수업 정보 */}
                <div className="flex flex-col gap-[10px]">
                  <div className="flex flex-col">
                    <h1 className="text-[24px] text-white font-bold leading-[1.4]">
                      {ticket.lesson?.title}
                    </h1>
                    <div className="flex items-center">
                      <p className="text-[18px] text-[#FFFFFFCC] font-semibold">
                        {ticket.lesson?.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <p className="text-[20px] text-white font-bold">
                      {ticket.lesson?.room?.name}
                    </p>
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
                  </div>
                </div>
              </div>

              {/* 사용자 정보 및 QR코드/스탬프 */}
              <div className="flex items-end gap-4">
                {/* 사용자 정보 */}
                <div className="flex-1 flex flex-col gap-2 relative">
                  {/* Dim 오버레이 */}
                  <div className="absolute inset-0 bg-black/30 rounded-[8px] -z-10"/>
                  <div
                      className="w-10 h-10 rounded-full overflow-hidden border border-[rgba(245,247,250,0.3)] flex-shrink-0">
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
                  <div className="flex flex-col opacity-60">
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
        </div>
      </div>
  );
}
