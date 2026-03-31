import { GetPassPlanResponse, PassBenefit, PassBenefitType, PassPlanTier } from "@/app/endpoint/pass.endpoint";
import UnlimitedIcon from "../../../public/assets/ic_unlimited.svg";
import FreeUnlimitedIcon from "../../../public/assets/ic_free_unlimited.svg";
import DiscountIcon from "../../../public/assets/ic_discount.svg";
import PassFastIcon from "../../../public/assets/ic_pass_fast.svg";
import PassPresaleIcon from "../../../public/assets/ic_pass_presale.svg";
import PassRoomIcon from "../../../public/assets/ic_pass_room.svg";

const BenefitIcon = ({ type }: { type: PassBenefitType }) => {
  switch (type) {
    case 'unlimited':
      return <UnlimitedIcon className="w-6 h-6" />;
    case 'free_count':
      return <FreeUnlimitedIcon className="w-6 h-6" />;
    case 'discount':
      return <DiscountIcon className="w-6 h-6" />;
    case 'presale':
      return <PassPresaleIcon className="w-6 h-6" />;
    case 'fast_entry':
      return <PassFastIcon className="w-6 h-6" />;
    case 'room':
      return <PassRoomIcon className="w-6 h-6" />;
  }
};

const featureKeyToType: Record<string, PassBenefitType> = {
  canPrePurchase: 'presale',
  priorityEntry: 'fast_entry',
  practiceRoom: 'room',
};

const ruleBenefitToType = (benefitType?: string): PassBenefitType => {
  switch (benefitType) {
    case 'Unlimited': return 'unlimited';
    case 'FreeCount': return 'free_count';
    case 'Discount': return 'discount';
    default: return 'unlimited';
  }
};

const buildBenefitsFromPlan = (passPlan: GetPassPlanResponse): PassBenefit[] => {
  const benefits: PassBenefit[] = [];

  // rules → 주요 혜택
  if (passPlan.rules) {
    for (const rule of passPlan.rules) {
      const type = ruleBenefitToType(rule.benefit?.type);
      const excludeLabel = rule.excludes?.map(e => e.label).filter(Boolean).join(', ');
      benefits.push({
        type,
        title: rule.description,
        subtitle: excludeLabel ? `${excludeLabel} 제외` : undefined,
      });
    }
  }

  // features → 부가 혜택
  if (passPlan.features) {
    for (const feature of passPlan.features) {
      if (!feature.description) continue;
      const type = featureKeyToType[feature.key] ?? 'fast_entry';
      benefits.push({
        type,
        title: feature.description,
        isAdditional: true,
      });
    }
  }

  // rules/features 없으면 기존 필드에서 생성
  if (benefits.length === 0) {
    if (passPlan.type === 'Unlimited') {
      benefits.push({
        type: 'unlimited',
        title: passPlan.tag ? `${passPlan.tag} 전용 수업 무제한 이용` : '클래스 무제한 수강',
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

  return benefits;
};

export const PassPlanBenefits = ({ passPlan }: { passPlan: GetPassPlanResponse }) => {
  const benefits = passPlan.benefits && passPlan.benefits.length > 0
    ? passPlan.benefits
    : buildBenefitsFromPlan(passPlan);

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
                {benefit.subtitle && (
                  <span className="text-[11px] text-[#AEAEAE] font-medium">{benefit.subtitle}</span>
                )}
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
