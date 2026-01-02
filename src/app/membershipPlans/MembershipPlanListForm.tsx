'use client'

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GetMembershipPlanResponse } from "@/app/endpoint/membership.endpoint";
import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { kloudNav } from "@/app/lib/kloudNav";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const MembershipPlanListForm = ({
  membershipPlans,
  locale,
}: {
  membershipPlans: GetMembershipPlanResponse[],
  locale: Locale,
}) => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [prevImageUrl, setPrevImageUrl] = useState<string | undefined>(undefined);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedPlan = membershipPlans[selectedPlanIndex];
  const newImageUrl = selectedPlan?.imageUrl || membershipPlans[0]?.imageUrl;
  const studio = selectedPlan?.studio;

  // 초기 이미지 설정 및 선택된 카드 변경 시 이미지 업데이트
  useEffect(() => {
    if (newImageUrl) {
      if (!currentImageUrl) {
        // 초기 설정
        setCurrentImageUrl(newImageUrl);
      } else if (newImageUrl !== currentImageUrl) {
        // 이미지 변경 시 부드러운 전환
        setIsImageTransitioning(true);
        setPrevImageUrl(currentImageUrl);
        setCurrentImageUrl(newImageUrl);

        const timer = setTimeout(() => {
          setIsImageTransitioning(false);
          setPrevImageUrl(undefined);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [newImageUrl, currentImageUrl]);

  // 초기 진입 시 첫 번째 카드로 스크롤
  useEffect(() => {
    if (scrollContainerRef.current && cardRefs.current[0]) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, []);

  // 카드 스크롤
  useEffect(() => {
    if (scrollContainerRef.current && cardRefs.current[selectedPlanIndex]) {
      cardRefs.current[selectedPlanIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedPlanIndex]);


  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const cardCenter = cardLeft + cardWidth / 2;
      const containerCenter = scrollLeft + containerWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== selectedPlanIndex) {
      setSelectedPlanIndex(closestIndex);
    }
  };


  return (
    <div className="relative w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden pb-[120px]"
        style={{ overscrollBehaviorY: 'none' }}
      >
        {/* 상단 배경 이미지 */}
        {(currentImageUrl || prevImageUrl) && (
          <div className="relative w-full h-[297px] overflow-hidden bg-gray-200">
            {/* 이전 이미지 (fade out) */}
            {prevImageUrl && isImageTransitioning && (
              <Image
                src={prevImageUrl}
                alt={getLocaleString({locale, key: 'membership_background'})}
                fill
                className="object-cover absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                quality={60}
              />
            )}
            {/* 현재 이미지 (fade in) */}
            {currentImageUrl && (
              <Image
                src={currentImageUrl}
                alt={getLocaleString({locale, key: 'membership_background'})}
                className="object-cover absolute inset-0 transition-opacity duration-500 ease-in-out"
                fill
                quality={60}
              />
            )}
          </div>
        )}

        {/* 스튜디오 정보 - 이미지 위에 오버레이 */}
        {studio && (
          <div className="relative w-full px-6 pt-8 -mt-[194px] z-10">
            <div className="flex gap-4 items-center">
              {studio.profileImageUrl && (
                <div className="w-[52px] h-[52px] rounded-[30px] overflow-hidden border border-[#f5f7fa] flex-shrink-0">
                  <Image
                    src={studio.profileImageUrl}
                    alt={studio.name}
                    width={52}
                    height={52}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col text-white">
                <p className="text-[16px] font-medium leading-[1.5]">{studio.name}</p>
                <p className="text-[22px] font-medium leading-[1.5]">{getLocaleString({locale, key: 'membership_signup'})}</p>
              </div>
            </div>
          </div>
        )}

        {/* 멤버십 카드 목록 */}
        <div className="relative w-full max-w-[390px] mx-auto pb-[60px] pt-[30px]">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-[12px] overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {membershipPlans.map((plan, index) => (
              <div
                key={plan.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`bg-white flex flex-col gap-4 items-start px-5 py-6 rounded-[20px] border border-[#e6e8ea] shrink-0 w-[342px] snap-center ${
                  index === 0 ? 'ml-[48px]' : ''
                } ${index === membershipPlans.length - 1 ? 'mr-[48px]' : ''}`}
                style={{ scrollSnapAlign: 'center' }}
              >
                {/* 카드 헤더 */}
                <div className="flex items-center w-full">
                  <p className="flex-1 text-[18px] font-bold leading-[1.5] text-black text-left">
                    {plan.name}
                  </p>
                </div>

                {/* 상세 정보 */}
                <div className="flex flex-col gap-[6px] items-start w-full">
                  {/* 할인 정보 */}
                  {plan.discountAmount && plan.discountAmount > 0 && (
                    <div className="flex gap-2 items-center w-full">
                      <div className="bg-[#fffbea] flex items-center justify-center p-[3px] rounded-full">
                        <div className="w-4 h-4 bg-[#ffb30e] rounded-full" />
                      </div>
                      <div className="flex gap-1 items-center text-[16px] leading-[1.5]">
                        <p className="font-bold text-[#ffb30e]">
                          {new Intl.NumberFormat("ko-KR").format(plan.discountAmount)}{getLocaleString({locale, key: 'won'})}
                        </p>
                        <p className="font-medium text-black">{getLocaleString({locale, key: 'lesson_discount'})}</p>
                      </div>
                    </div>
                  )}

                  {/* 연습실 이용 정보 */}
                  {plan.canUsePracticeRoom && (
                    <div className="flex gap-2 items-center w-full">
                      <div className="bg-[#fffbea] flex items-center justify-center p-[3px] rounded-full">
                        <div className="w-4 h-4 bg-[#ffb30e] rounded-full" />
                      </div>
                      <div className="flex gap-1 items-center text-[16px] leading-[1.5]">
                        <p className="font-medium text-black">{getLocaleString({locale, key: 'practice_room'})}</p>
                        <p className="font-bold text-[#ffb30e]">{getLocaleString({locale, key: 'unlimited_use'})}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 태그 */}
                {plan.benefits && plan.benefits.length > 0 && (
                  <div className="flex gap-1 items-start flex-wrap w-full">
                    {plan.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className="bg-[#f9f9fb] flex gap-0.5 items-center justify-center px-[10px] py-1 rounded-[6px] text-[#6d7882]"
                      >
                        <p className="text-[12px] font-medium">#</p>
                        <p className="text-[14px] font-medium">{benefit}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 구분선 */}
                <div className="bg-[#f3f3f5] h-px w-full" />

                {/* 가격 및 기간 */}
                <div className="flex gap-1 items-center leading-[1.5] w-full">
                  <p className="font-bold text-[22px] text-black">
                    {new Intl.NumberFormat("ko-KR").format(plan.price)}{getLocaleString({locale, key: 'won'})}
                  </p>
                  {plan.duration && (
                    <p className="font-medium text-[16px] text-[#6d7882]">
                      / {plan.duration}{getLocaleString({locale, key: 'day'})}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 페이지 인디케이터 */}
          {membershipPlans.length > 1 && (
            <div className="flex gap-1 items-start justify-center mt-[50px]">
              {membershipPlans.map((_, index) => (
                <div
                  key={index}
                  className={`h-[6px] rounded-full transition-all ${
                    index === selectedPlanIndex
                      ? 'bg-black w-5'
                      : 'bg-[#b1b8be] w-[6px]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 멤버십 구매 안내 */}
        <div className="relative w-full px-6 py-8 flex flex-col gap-4 items-start bg-[#f9f9fb]">
          <p className="font-bold leading-[1.5] text-[#58616a] text-[16px] w-full">
            {getLocaleString({locale, key: 'membership_purchase_guide_title'})}
          </p>
          <div className="font-medium leading-[1.5] text-[#6d7882] text-[14px] w-full">
            <ul className="mb-0">
              <li className="list-disc ms-[21px]">
                <span className="leading-[1.5]">{getLocaleString({locale, key: 'membership_validity_period'})}</span>
              </li>
            </ul>
            <p className="leading-[1.5] mb-0 text-[14px]">&nbsp;</p>
            <ul className="mb-0">
              <li className="list-disc ms-[21px]">
                <span className="leading-[1.5]">{getLocaleString({locale, key: 'lesson_schedule_change'})}</span>
              </li>
            </ul>
            <p className="leading-[1.5] mb-0 text-[14px]">&nbsp;</p>
            <ul className="mb-0">
              <li className="list-disc ms-[21px]">
                <span className="leading-[1.5]">{getLocaleString({locale, key: 'membership_transfer_prohibited'})}</span>
              </li>
            </ul>
            <p className="leading-[1.5] mb-0 text-[14px]">&nbsp;</p>
            <ul className="mb-0">
              <li className="list-disc ms-[21px]">
                <span className="leading-[1.5]">{getLocaleString({locale, key: 'membership_refund_policy'})}</span>
              </li>
            </ul>
            <p className="leading-[1.5] mb-0 text-[14px]">&nbsp;</p>
            <ul>
              <li className="list-disc ms-[21px]">
                <span className="leading-[1.5]">{getLocaleString({locale, key: 'membership_other_conditions'})}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 - 완전히 고정 */}
      <div className="fixed bg-white bottom-0 left-0 right-0 pt-3 pb-0 px-6 flex flex-col items-center z-[100] shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        <div className="w-[342px]">
          <CommonSubmitButton
            originProps={{
              onClick: () => {
                if (selectedPlan) {
                  kloudNav.push(KloudScreen.MembershipPlanPayment(selectedPlan.id));
                }
              },
              className: "h-[56px] rounded-[8px]"
            }}
            disabled={!selectedPlan}
          >
              <div className="text-white text-[16px] font-bold leading-[22px]">
                {selectedPlan ? `${new Intl.NumberFormat("ko-KR").format(selectedPlan.price)}${getLocaleString({locale, key: 'won'})} ${getLocaleString({locale, key: 'membership_payment'})}` : getLocaleString({locale, key: 'membership_payment'})}
              </div>
          </CommonSubmitButton>
        </div>
        <div className="h-[34px] w-full relative">
          <div className="absolute bottom-[8px] left-1/2 translate-x-[-50%] bg-black h-[5px] rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}
