'use client'

import React, { useState } from "react";
import { DiscountResponse, CouponResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type DiscountTab = 'coupon';

/**
 * 할인 섹션 — 패스권은 별도 PassesSection으로 옮겨졌고 여기는 쿠폰만 노출.
 * discounts prop은 컴포넌트 호환을 위해 시그니처에 남겨두지만 내부에선 사용 안 함.
 */
export const DiscountSection = ({
  locale,
  discounts: _discounts,
  coupons,
  selectedCoupon,
  onSelectCoupon,
  selectedDiscount: _selectedDiscount,
  onSelectDiscount: _onSelectDiscount,
}: {
  locale: Locale,
  discounts?: DiscountResponse[],
  coupons?: CouponResponse[],
  selectedCoupon?: CouponResponse,
  onSelectCoupon: (coupon: CouponResponse | undefined) => void,
  selectedDiscount?: DiscountResponse,
  onSelectDiscount: (discount: DiscountResponse | undefined) => void,
}) => {
  void _discounts;
  void _selectedDiscount;
  void _onSelectDiscount;
  const [selectedTab, setSelectedTab] = useState<DiscountTab | null>(null);

  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({ locale, key: 'won' });

  return (
    <div className="flex flex-col gap-y-2 px-6 my-3">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'discount_section' })}
      </div>

      <div className="rounded-2xl border border-[#EEEFF0] overflow-hidden">
        {/* 쿠폰 탭 */}
        <div className="flex flex-col">
          <div
            onClick={() => setSelectedTab(selectedTab === 'coupon' ? null : 'coupon')}
            className={`flex items-center gap-3 px-5 py-[15px] cursor-pointer transition-all duration-150 select-none
              ${selectedTab === 'coupon' ? 'bg-[#F0F1F3]' : 'bg-white hover:bg-[#FBFBFC]'}`}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="18" height="14" rx="2.5" stroke={selectedTab === 'coupon' ? '#111' : '#BDBDBD'} strokeWidth="1.4"/>
              <path d="M8 4V18" stroke={selectedTab === 'coupon' ? '#111' : '#BDBDBD'} strokeWidth="1.4" strokeDasharray="2 2"/>
              <circle cx="14" cy="9" r="1" fill={selectedTab === 'coupon' ? '#111' : '#BDBDBD'}/>
              <circle cx="14" cy="13" r="1" fill={selectedTab === 'coupon' ? '#111' : '#BDBDBD'}/>
            </svg>
            <div className={`flex-grow text-[14px] transition-colors duration-150
              ${selectedTab === 'coupon' ? 'text-black font-bold' : 'text-[#888] font-medium'}`}>
              {getLocaleString({ locale, key: 'discount_coupon' })}
            </div>
            <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-150
              ${selectedCoupon ? 'border-black bg-black' : 'border-[#D4D4D4]'}`}>
              {selectedCoupon && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>

          {/* 쿠폰 확장 영역 */}
          {selectedTab === 'coupon' && (
            <div className="bg-[#F0F1F3] px-5 pb-4">
              {coupons && coupons.length > 0 ? (
                <div className="flex flex-col gap-2 mt-3">
                  {coupons.map((coupon) => {
                    const isSelected = selectedCoupon?.id === coupon.id;
                    return (
                      <div
                        key={coupon.id}
                        onClick={() => {
                          onSelectCoupon(isSelected ? undefined : coupon);
                        }}
                        className={`rounded-xl px-4 py-3.5 transition-all duration-200 select-none cursor-pointer active:scale-[0.98]
                          ${isSelected
                            ? 'border-[1.5px] border-black bg-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                            : 'border border-[#E8E8E8] bg-white text-black'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-0.5">
                            <div className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                              {coupon.name}
                            </div>
                            <div className={`text-[12px] font-medium ${isSelected ? 'text-white/60' : 'text-[#999]'}`}>
                              -{fmt(coupon.discountAmount)}{won}
                            </div>
                          </div>
                          <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                            ${isSelected ? 'border-white bg-white' : 'border-[#D1D5DB]'}`}>
                            {isSelected && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-[13px] text-[#999] bg-white rounded-xl mt-3">
                  {getLocaleString({ locale, key: 'no_available_coupon' })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
