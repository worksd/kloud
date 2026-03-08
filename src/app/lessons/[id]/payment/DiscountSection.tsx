'use client'

import React, { useState } from "react";
import { DiscountResponse, CouponResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type DiscountTab = 'pass' | 'coupon';

export const DiscountSection = ({
  locale,
  discounts,
  coupons,
  selectedCoupon,
  onSelectCoupon,
}: {
  locale: Locale,
  discounts?: DiscountResponse[],
  coupons?: CouponResponse[],
  selectedCoupon?: CouponResponse,
  onSelectCoupon: (coupon: CouponResponse | undefined) => void,
}) => {
  const [selectedTab, setSelectedTab] = useState<DiscountTab>('pass');

  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({ locale, key: 'won' });

  return (
    <div className="flex flex-col gap-y-2 px-6">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'discount_section' })}
      </div>

      <div className="rounded-2xl border border-[#EEEFF0] overflow-hidden">
        {/* 패스권 탭 */}
        <div className="flex flex-col">
          <div
            onClick={() => setSelectedTab('pass')}
            className={`flex items-center gap-3 px-5 py-[15px] cursor-pointer transition-all duration-150 select-none
              ${selectedTab === 'pass' ? 'bg-[#F0F1F3]' : 'bg-white hover:bg-[#FBFBFC] border-b border-[#F0F0F0]'}`}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5H18C18.8 5 19.5 5.7 19.5 6.5V9.2C18.4 9.5 17.5 10.4 17.5 11.5C17.5 12.6 18.4 13.5 19.5 13.8V15.5C19.5 16.3 18.8 17 18 17H4C3.2 17 2.5 16.3 2.5 15.5V13.8C3.6 13.5 4.5 12.6 4.5 11.5C4.5 10.4 3.6 9.5 2.5 9.2V6.5C2.5 5.7 3.2 5 4 5Z" stroke={selectedTab === 'pass' ? '#111' : '#BDBDBD'} strokeWidth="1.4"/>
              <path d="M8.5 8L13.5 15" stroke={selectedTab === 'pass' ? '#111' : '#BDBDBD'} strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="9" cy="14" r="1.2" stroke={selectedTab === 'pass' ? '#111' : '#BDBDBD'} strokeWidth="1.2"/>
              <circle cx="13" cy="8.5" r="1.2" stroke={selectedTab === 'pass' ? '#111' : '#BDBDBD'} strokeWidth="1.2"/>
            </svg>
            <div className={`flex-grow text-[14px] transition-colors duration-150
              ${selectedTab === 'pass' ? 'text-black font-bold' : 'text-[#888] font-medium'}`}>
              {getLocaleString({ locale, key: 'discount_pass' })}
            </div>
            <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-150
              ${selectedTab === 'pass' ? 'border-black bg-black' : 'border-[#D4D4D4]'}`}>
              {selectedTab === 'pass' && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>

          {/* 패스권 확장 영역 - 보기 전용 */}
          {selectedTab === 'pass' && (
            <div className="bg-[#F0F1F3] px-5 pb-4">
              {discounts && discounts.length > 0 ? (
                <div className="flex flex-col gap-2 mt-3">
                  {discounts.map((discount, index) => {
                    const disabled = !!selectedCoupon && discount.type === 'Pass';
                    return (
                      <div
                        key={index}
                        className={`rounded-xl px-4 py-3.5 border border-[#E8E8E8] transition-opacity duration-200 ${disabled ? 'bg-[#F5F5F5] opacity-50' : 'bg-white'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`text-[14px] font-semibold ${disabled ? 'text-[#999] line-through' : 'text-black'}`}>
                            {discount.key}
                          </div>
                          <div className={`text-[14px] font-bold ${disabled ? 'text-[#CCC] line-through' : 'text-[#FF3B30]'}`}>
                            -{fmt(discount.amount)}{won}
                          </div>
                        </div>
                        <div className={`text-[12px] mt-1.5 ${disabled ? 'text-[#BBB]' : 'text-[#888]'}`}>
                          {disabled
                            ? getLocaleString({ locale, key: 'discount_pass_disabled_by_coupon' })
                            : (discount.description ?? `${getLocaleString({ locale, key: 'discount_pass_benefit_prefix' })} ${fmt(discount.amount)}${won} ${getLocaleString({ locale, key: 'discount_pass_benefit_suffix' })}`)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-[13px] text-[#999] bg-white rounded-xl mt-2">
                  {getLocaleString({ locale, key: 'no_available_pass' })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 쿠폰 탭 */}
        <div className="flex flex-col">
          <div
            onClick={() => setSelectedTab('coupon')}
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
              ${selectedTab === 'coupon' ? 'border-black bg-black' : 'border-[#D4D4D4]'}`}>
              {selectedTab === 'coupon' && (
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
                        onClick={() => onSelectCoupon(isSelected ? undefined : coupon)}
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
