'use client';

import Image from "next/image";
import { GetMembershipResponse } from "@/app/endpoint/membership.endpoint";
import { GetMeResponse } from "@/app/endpoint/user.endpoint";
import { QRCodeCanvas } from 'qrcode.react';
import { Copy } from 'lucide-react';
import { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import Logo from "../../../../public/assets/logo_white.svg";
import TicketGgodari from "../../../../public/assets/ticket-ggodari.svg";

export function MembershipTicketForm({
  membership,
  user,
  membershipId,
  qrCodeUrl,
  locale,
}: {
  membership: GetMembershipResponse;
  user: GetMeResponse;
  membershipId: string;
  qrCodeUrl: string;
  locale: Locale;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyMembershipId = async () => {
    try {
      await navigator.clipboard.writeText(membershipId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isPaidOrUsed = membership.status === 'Active';
  const hasBorder = isPaidOrUsed;
  const borderClass = 'border-membership';

  // 날짜 포맷팅 (endDate 그대로 사용하고 "까지"만 붙임)
  const formatEndDate = (endDate: string) => {
    return `${endDate}까지`;
  };

  return (
    <>
      {hasBorder ? (
        <div className={`relative p-[3px] rounded-[20px] ${borderClass}`}>
          <div className="relative rounded-[17px] overflow-hidden">
            <div className="relative w-[350px] h-[600px]">
              {/* 티켓 배경 이미지 */}
              <div className="absolute top-0 left-0 right-0 rounded-t-[17px] overflow-hidden" style={{ height: 'calc(100% - 200px)' }}>
                {membership.plan.imageUrl ? (
                  <>
                    <Image
                      src={membership.plan.imageUrl}
                      alt="Ticket Background"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </>
                ) : <div className="h-full bg-gradient-to-b from-[#1a1a1a] via-[#2a2a2a] to-black" />}
              </div>

              {/* divider 아래 검은색 배경 */}
              <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-black" />

              {/* 티켓 내용 */}
              <div className="relative h-full flex flex-col gap-8 px-6 pt-8 pb-10">
                <div className="flex-1 flex flex-col justify-between pb-4 border-b border-[#2d2d2d]">
                  <button
                    onClick={handleCopyMembershipId}
                    className="flex items-center gap-2 text-[12px] text-white/70 font-medium leading-[1.4] mb-0 hover:text-white/90 transition-colors active:opacity-70"
                  >
                    <Copy className="w-3 h-3 flex-shrink-0" />
                    <span className={'font-paperlogy'}>{membershipId}</span>
                    {copied && (
                      <span className="text-[10px] text-white/50 ml-1">복사됨</span>
                    )}
                  </button>

                  {/* 멤버십 정보 */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h1 className="text-[18px] text-white font-bold leading-[1.5]">
                        {membership.plan.name}
                      </h1>
                      <p className="text-[12px] text-white font-medium">
                        {formatEndDate(membership.endDate)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                      {/* 연습실 이용 정보 */}
                      {membership.plan.canUsePracticeRoom && (
                        <div className="flex gap-2 items-center">
                          <div className="bg-[#fffbea] flex items-center justify-center p-[3px] rounded-full w-[18px] h-[18px]">
                            <div className="w-4 h-4 bg-[#ffb30e] rounded-full"/>
                          </div>
                          <div className="flex gap-1 items-center text-[14px] leading-[1.5]">
                            <p className="font-bold text-[#ffb30e]">연습실</p>
                            <p className="font-medium text-white">무료이용</p>
                          </div>
                        </div>
                      )}

                      {/* 할인 정보 */}
                      {membership.plan.discountAmount && membership.plan.discountAmount > 0 && (
                        <div className="flex gap-2 items-center">
                          <div className="bg-[#fffbea] flex items-center justify-center p-[3px] rounded-full w-[18px] h-[18px]">
                            <div className="w-4 h-4 bg-[#ffb30e] rounded-full"/>
                          </div>
                          <div className="flex gap-1 items-center text-[14px] leading-[1.5]">
                            <p className="font-medium text-white">모든 수업</p>
                            <p className="font-bold text-[#ffb30e]">
                              {new Intl.NumberFormat("ko-KR").format(membership.plan.discountAmount)}{getLocaleString({locale, key: 'won'})} 할인
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 태그 */}
                    {membership.plan.benefits && membership.plan.benefits.length > 0 && (
                      <div className="flex gap-1 items-start flex-wrap">
                        {membership.plan.benefits.map((benefit, index) => (
                          <div key={index} className="bg-[#f9f9fb] flex gap-0.5 items-center justify-center px-[10px] py-1 rounded-[6px] text-[#6d7882]">
                            <p className="text-[12px] font-medium">#</p>
                            <p className="text-[12px] font-medium">{benefit}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 사용자 정보 및 QR코드 */}
                <div className="flex items-end gap-4">
                  {/* 사용자 정보 */}
                  <div className="flex-1 flex flex-col gap-2 relative pr-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#464c53] flex-shrink-0">
                      {user.profileImageUrl && (
                        <Image
                          src={user.profileImageUrl}
                          alt="User"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[14px] text-[#cdd1d5] font-bold leading-[22px] text-left">
                        {user.name || user.nickName || ''}
                      </p>
                      <p className="text-[12px] text-[#cdd1d5] font-medium text-left leading-[20px]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/*/!* QR코드 *!/*/}
                  {/*<div className="w-[100px] h-[100px] rounded-[12px] flex items-center justify-center flex-shrink-0 p-2 relative bg-white">*/}
                  {/*  <QRCodeCanvas*/}
                  {/*    value={qrCodeUrl}*/}
                  {/*    size={84}*/}
                  {/*    className="w-full h-full"*/}
                  {/*  />*/}
                  {/*</div>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-[350px] h-[600px] rounded-t-[20px]">
          {/* 기본 티켓 렌더링 (비활성 상태) */}
          <div className="relative h-full flex flex-col gap-8 px-6 pt-8 pb-10 bg-gradient-to-b from-[#1a1a1a] via-[#2a2a2a] to-black rounded-t-[20px]">
            <div className="flex-1 flex flex-col justify-between pb-4 border-b border-[#2d2d2d]">
              <p className="text-[12px] text-white/70 font-medium leading-[1.4] font-paperlogy">
                {membershipId}
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[18px] text-white font-bold leading-[1.5]">
                    {membership.plan.name}
                  </h1>
                  <p className="text-[12px] text-white font-medium">
                    {formatEndDate(membership.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

