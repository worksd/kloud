'use client';

import { GetMembershipPlanResponse } from "@/app/endpoint/membership.endpoint";
import Image from "next/image";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const CurrentMembershipPlan = ({
  membershipPlan,
  locale
}: { 
  membershipPlan: GetMembershipPlanResponse;
  locale: Locale;
}) => {
  return (
    <div className="px-6 py-4">
      {/* 이미지 카드 */}
      {membershipPlan.imageUrl && (
        <div className="relative w-full h-[200px] rounded-[16px] overflow-hidden mb-4">
          <Image
            src={membershipPlan.imageUrl}
            alt={membershipPlan.name}
            fill
            className="object-cover"
            quality={60}
          />
        </div>
      )}

      {/* 멤버십 정보 */}
      <div className="flex flex-col gap-3">
        <div className="text-[20px] font-bold text-black">{membershipPlan.name}</div>
        
        {membershipPlan.description && (
          <div className="text-[14px] text-[#86898C]">{membershipPlan.description}</div>
        )}

        {/* 기간 정보 */}
        {(membershipPlan.durationMonths || membershipPlan.duration) && (
          <div className="text-[14px] text-[#86898C]">
            {getLocaleString({locale, key: 'period'})}: {membershipPlan.durationMonths ? `${membershipPlan.durationMonths}${getLocaleString({locale, key: 'month'})}` : `${membershipPlan.duration}${getLocaleString({locale, key: 'day'})}`}
          </div>
        )}

        {/* 혜택 정보 */}
        <div className="flex flex-col gap-[6px] mt-2">
          {/* 할인 정보 */}
          {membershipPlan.discountAmount && membershipPlan.discountAmount > 0 && (
            <div className="flex gap-2 items-center">
              <div className="bg-[#fffbea] flex items-center justify-center p-[3px] rounded-full">
                <div className="w-4 h-4 bg-[#ffb30e] rounded-full" />
              </div>
              <div className="flex gap-1 items-center text-[14px] leading-[1.5]">
                <p className="font-bold text-[#ffb30e]">
                  {new Intl.NumberFormat("ko-KR").format(membershipPlan.discountAmount)}{getLocaleString({locale, key: 'won'})}
                </p>
                <p className="font-medium text-black">{getLocaleString({locale, key: 'lesson_discount'})}</p>
              </div>
            </div>
          )}

          {/* 연습실 이용 정보 */}
          {membershipPlan.canUsePracticeRoom && (
            <div className="flex gap-2 items-center">
              <div className="bg-[#fffbea] flex items-center justify-center p-[3px] rounded-full">
                <div className="w-4 h-4 bg-[#ffb30e] rounded-full" />
              </div>
              <div className="flex gap-1 items-center text-[14px] leading-[1.5]">
                <p className="font-medium text-black">{getLocaleString({locale, key: 'practice_room'})}</p>
                <p className="font-bold text-[#ffb30e]">{getLocaleString({locale, key: 'unlimited_use'})}</p>
              </div>
            </div>
          )}
        </div>

        {/* 태그 (혜택) */}
        {membershipPlan.benefits && membershipPlan.benefits.length > 0 && (
          <div className="flex gap-1 items-start flex-wrap mt-2">
            {membershipPlan.benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-[#f9f9fb] flex gap-0.5 items-center justify-center px-[10px] py-1 rounded-[6px] text-[#6d7882]"
              >
                <p className="text-[12px] font-medium">#</p>
                <p className="text-[12px] font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

