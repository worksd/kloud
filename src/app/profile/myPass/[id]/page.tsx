import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { PassTicketUsageHistory } from "@/app/profile/myPass/[id]/PassTicketUsageHistory";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanTier, PassBenefit, PassBenefitType } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
import { DdayText } from "@/app/components/DdayText";
import { CircleImage } from "@/app/components/CircleImage";
import { PassDetailTabs } from "@/app/profile/myPass/[id]/PassDetailTabs";
import { PassQRCode } from "@/app/profile/myPass/[id]/PassQRCode";
import UnlimitedIcon from "../../../../../public/assets/ic_unlimited.svg";
import FreeUnlimitedIcon from "../../../../../public/assets/ic_free_unlimited.svg";
import DiscountIcon from "../../../../../public/assets/ic_discount.svg";
import PassFastIcon from "../../../../../public/assets/ic_pass_fast.svg";
import PassPresaleIcon from "../../../../../public/assets/ic_pass_presale.svg";
import PassRoomIcon from "../../../../../public/assets/ic_pass_room.svg";
import React from "react";

const MOCK_ENABLED = true;

const mockBenefits: PassBenefit[] = [
  { type: 'unlimited', title: '트레이닝반 전용 수업 무제한 이용', description: '트레이닝반 소속 모든 클래스를 무제한으로 수강할 수 있습니다' },
  { type: 'free_count', title: '모든 수업 20회 무료', subtitle: '워크샵 제외', description: '워크샵을 제외한 전체 수업에 무료로 참여할 수 있습니다', remainingCount: 14, totalCount: 20 },
  { type: 'discount', title: '모든 수업 10,000원 할인', subtitle: '워크샵 제외', description: '수업 결제 시 자동으로 10,000원이 할인됩니다' },
  { type: 'presale', title: '사전 신청 허용', description: '일반 학생보다 먼저 수업을 신청할 수 있습니다', isAdditional: true },
  { type: 'room', title: '연습실 이용', description: '스튜디오 연습실을 자유롭게 이용할 수 있습니다', isAdditional: true },
  { type: 'fast_entry', title: '우선 입장', description: '수업 시작 전 우선 입장이 가능합니다', isAdditional: true, isUsedUp: true },
];

const BenefitIcon = ({ type }: { type: PassBenefitType }) => {
  switch (type) {
    case 'unlimited':
      return <UnlimitedIcon className="w-6 h-6" />;
    case 'free_count':
      return <FreeUnlimitedIcon className="w-6 h-6" />;
    case 'discount':
      return <DiscountIcon className="w-6 h-6" />;
    case 'presale':
      return <PassFastIcon className="w-6 h-6" />;
    case 'fast_entry':
      return <PassPresaleIcon className="w-6 h-6" />;
    case 'room':
      return <PassRoomIcon className="w-6 h-6" />;
  }
};

export default async function MyPassDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const pass = await getPassAction({id: (await params).id});
  const locale = await getLocale();

  if ('id' in pass) {
    const passPlan = pass.passPlan;

    let benefits: PassBenefit[];

    if (MOCK_ENABLED) {
      benefits = mockBenefits;
    } else if (passPlan?.benefits && passPlan.benefits.length > 0) {
      benefits = passPlan.benefits;
    } else {
      benefits = [];
      if (passPlan?.type === 'Unlimited') {
        benefits.push({
          type: 'unlimited',
          title: passPlan.tag
            ? `${passPlan.tag} 전용 수업 무제한 이용`
            : '클래스 무제한 수강',
        });
      }
      if (passPlan?.type === 'Count' && passPlan.usageLimit) {
        benefits.push({
          type: 'free_count',
          title: `모든 수업 ${passPlan.usageLimit}회 이용 가능`,
        });
      }
      if (passPlan?.canPreSale) {
        benefits.push({ type: 'presale', title: '사전 신청 허용', isAdditional: true });
      }
      if (passPlan?.tier === PassPlanTier.Premium) {
        benefits.push({ type: 'fast_entry', title: '우선 입장', isAdditional: true });
      }
    }

    const mainBenefits = benefits.filter(b => !b.isAdditional);
    const additionalBenefits = benefits.filter(b => b.isAdditional);

    const BenefitRow = ({ benefit }: { benefit: PassBenefit }) => {
      const usedUp = benefit.isUsedUp === true;
      return (
        <div className={`flex items-start gap-3.5 ${usedUp ? 'opacity-40' : ''}`}>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${usedUp ? 'bg-[#E8E8E8]' : 'bg-[#F3F4F6]'}`}>
            <BenefitIcon type={benefit.type} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-black leading-snug">{benefit.title}</span>
              {usedUp && (
                <span className="text-[11px] font-bold text-white bg-[#BFBFBF] px-2 py-[2px] rounded-full">사용완료</span>
              )}
              {!usedUp && benefit.remainingCount != null && benefit.totalCount != null && (
                <span className="text-[11px] font-bold text-[#5B5FF6] bg-[#EDEDFF] px-2 py-[2px] rounded-full">
                  {benefit.remainingCount}/{benefit.totalCount}회 남음
                </span>
              )}
            </div>
            {benefit.description && (
              <span className="text-[12px] text-[#999] font-medium leading-relaxed">{benefit.description}</span>
            )}
          </div>
        </div>
      );
    };

    const benefitsContent = (
      <div className="flex flex-col px-6 pt-6 pb-8">
        {/* 주요 혜택 */}
        {mainBenefits.length > 0 && (
          <div className="flex flex-col gap-5">
            {mainBenefits.map((benefit, index) => (
              <BenefitRow key={index} benefit={benefit} />
            ))}
          </div>
        )}

        {/* 부가 혜택 */}
        {additionalBenefits.length > 0 && (
          <>
            <div className="flex items-center gap-4 mt-8 mb-5">
              <div className="flex-1 h-px bg-[#EBEBEB]" />
              <span className="text-[13px] text-[#B0B0B0] font-medium">부가 혜택</span>
              <div className="flex-1 h-px bg-[#EBEBEB]" />
            </div>

            <div className="flex flex-col gap-5">
              {additionalBenefits.map((benefit, index) => (
                <BenefitRow key={index} benefit={benefit} />
              ))}
            </div>
          </>
        )}

        {mainBenefits.length === 0 && additionalBenefits.length === 0 && (
          <div className="py-10 text-center text-[14px] text-[#AEAEAE] font-medium">
            등록된 혜택이 없습니다
          </div>
        )}
      </div>
    );

    const usageContent = (
      <div className="py-5">
        <PassTicketUsageHistory tickets={pass.tickets} />
      </div>
    );

    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* 패스 정보 */}
        <div className="bg-gradient-to-b from-[#F0EDFF] via-[#F6F4FF] to-white px-6 pt-28 pb-6">
          <div className="flex items-start justify-between gap-4">
            {/* 왼쪽: 메타 정보 */}
            <div className="flex flex-col gap-3 min-w-0">
              {/* 스튜디오 로고 + 패스권 이름 */}
              <div className="flex items-center gap-3">
                <CircleImage size={44} imageUrl={pass.passPlan?.studio?.profileImageUrl} />
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-[20px] font-bold text-black truncate">{pass.passPlan?.name}</h2>
                  {passPlan?.tier === PassPlanTier.Premium && (
                    <PremiumTierIcon className="flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* 상태 배지 (Active 제외) */}
              {pass.status === 'Pending' && (
                <span className="text-[12px] font-bold text-[#86898C] bg-white/60 border border-[#E0E0E0] px-3 py-[5px] rounded-full">
                  입금 대기
                </span>
              )}
              {pass.status === 'Waiting' && (
                <span className="text-[12px] font-bold text-[#F59E0B] bg-[#FFFDF5] border border-[#F59E0B]/20 px-3 py-[5px] rounded-full">
                  시작 대기
                </span>
              )}
              {pass.status === 'Done' && (
                <span className="text-[12px] font-bold text-[#999] bg-white/60 border border-[#E0E0E0] px-3 py-[5px] rounded-full">
                  사용 완료
                </span>
              )}
              {pass.status === 'Expired' && (
                <span className="text-[12px] font-bold text-[#999] bg-white/60 border border-[#E0E0E0] px-3 py-[5px] rounded-full">
                  만료됨
                </span>
              )}

              {/* 만료일 */}
              {pass.endDate && (
                <span className="text-[13px] text-[#AEAEAE] font-medium">
                  {pass.endDate} 까지
                </span>
              )}
            </div>

            {/* 오른쪽: QR 코드 */}
            <div className="flex-shrink-0 rounded-xl overflow-hidden bg-white p-1.5 shadow-sm border border-[#E8E8E8]">
              <PassQRCode url="https://www.naver.com" />
            </div>
          </div>
        </div>

        {/* Pending: 계좌이체 안내 */}
        {pass.status === 'Pending' && (
          <div className="px-4 pb-2">
            <AccountTransferComponent
              depositor={pass.passPlan?.studio?.depositor}
              bank={pass.passPlan?.studio?.bank}
              accountNumber={pass.passPlan?.studio?.accountNumber}
              price={pass.passPlan?.price}
            />
          </div>
        )}

        {/* Waiting: 시작 대기 */}
        {pass.status === 'Waiting' && pass.startDate && (
          <div className="mx-6 mb-2 p-4 bg-[#FFFDF5] rounded-xl border border-[#F59E0B]/20">
            <div className="text-[#F59E0B] font-semibold text-sm">
              {pass.startDate} {await translate('waiting_pass_start_date')}
            </div>
          </div>
        )}

        {/* 탭 (혜택 / 사용 정보) */}
        <PassDetailTabs
          benefitsContent={benefitsContent}
          usageContent={usageContent}
        />
      </div>
    )
  }
}
