import { GetPassPlanResponse, PassBenefit, PassBenefitType, PassPlanTier } from "@/app/endpoint/pass.endpoint";
import UnlimitedIcon from "../../../public/assets/ic_unlimited.svg";
import FreeUnlimitedIcon from "../../../public/assets/ic_free_unlimited.svg";
import DiscountIcon from "../../../public/assets/ic_discount.svg";
import PassFastIcon from "../../../public/assets/ic_pass_fast.svg";
import PassPresaleIcon from "../../../public/assets/ic_pass_presale.svg";
import PassRoomIcon from "../../../public/assets/ic_pass_room.svg";

const MOCK_ENABLED = true;

const mockBenefits: PassBenefit[] = [
  { type: 'unlimited', title: '트레이닝반 전용 수업 무제한 이용', description: '트레이닝반 소속 모든 클래스를 무제한으로 수강할 수 있습니다' },
  { type: 'free_count', title: '모든 수업 20회 무료', subtitle: '워크샵 제외', description: '워크샵을 제외한 전체 수업에 무료로 참여할 수 있습니다' },
  { type: 'discount', title: '모든 수업 10,000원 할인', description: '수업 결제 시 자동으로 10,000원이 할인됩니다' },
  { type: 'presale', title: '사전 신청 허용', description: '일반 학생보다 먼저 수업을 신청할 수 있습니다', isAdditional: true },
  { type: 'room', title: '연습실 이용', description: '스튜디오 연습실을 자유롭게 이용할 수 있습니다', isAdditional: true },
  { type: 'fast_entry', title: '우선 입장', description: '수업 시작 전 우선 입장이 가능합니다', isAdditional: true },
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

export const PassPlanBenefits = ({ passPlan }: { passPlan: GetPassPlanResponse }) => {
  let benefits: PassBenefit[];

  if (MOCK_ENABLED) {
    benefits = mockBenefits;
  } else if (passPlan.benefits && passPlan.benefits.length > 0) {
    benefits = passPlan.benefits;
  } else {
    benefits = [];
    if (passPlan.type === 'Unlimited') {
      benefits.push({
        type: 'unlimited',
        title: passPlan.tag
          ? `${passPlan.tag} 전용 수업 무제한 이용`
          : '클래스 무제한 수강',
      });
    }
    if (passPlan.type === 'Count' && passPlan.usageLimit) {
      benefits.push({
        type: 'free_count',
        title: `모든 수업 ${passPlan.usageLimit}회 이용 가능`,
      });
    }
    if (passPlan.canPreSale) {
      benefits.push({ type: 'presale', title: '사전 신청 허용', isAdditional: true });
    }
    if (passPlan.tier === PassPlanTier.Premium) {
      benefits.push({ type: 'fast_entry', title: '우선 입장', isAdditional: true });
    }
  }

  if (benefits.length === 0) return null;

  const mainBenefits = benefits.filter(b => !b.isAdditional);
  const additionalBenefits = benefits.filter(b => b.isAdditional);

  return (
    <div className="flex flex-col px-6 pt-4 pb-1">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-[#D0D0D0]" />
        <span className="text-[12px] text-[#888] font-semibold">패스권 혜택</span>
        <div className="flex-1 h-px bg-[#D0D0D0]" />
      </div>

      {/* 주요 혜택 */}
      {mainBenefits.length > 0 && (
        <div className="flex flex-col gap-3.5">
          {mainBenefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                <BenefitIcon type={benefit.type} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                <span className="text-[14px] font-semibold text-black leading-snug">{benefit.title}</span>
                {benefit.description && (
                  <span className="text-[12px] text-[#999] font-medium leading-relaxed">{benefit.description}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 부가 혜택 */}
      {additionalBenefits.length > 0 && (
        <>
          <div className="flex items-center gap-4 mt-5 mb-4">
            <div className="flex-1 h-px bg-[#EBEBEB]" />
            <span className="text-[12px] text-[#B0B0B0] font-medium">부가 혜택</span>
            <div className="flex-1 h-px bg-[#EBEBEB]" />
          </div>

          <div className="flex flex-col gap-3.5">
            {additionalBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                  <BenefitIcon type={benefit.type} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                  <span className="text-[14px] font-semibold text-black leading-snug">{benefit.title}</span>
                  {benefit.description && (
                    <span className="text-[12px] text-[#999] font-medium leading-relaxed">{benefit.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
