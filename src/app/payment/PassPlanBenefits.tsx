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

  if (passPlan.rules) {
    for (const rule of passPlan.rules) {
      benefits.push({
        type: ruleBenefitToType(rule.benefit?.type),
        title: rule.description,
      });
    }
  }

  if (passPlan.features) {
    for (const feature of passPlan.features) {
      if (!feature.description) continue;
      benefits.push({
        type: featureKeyToType[feature.key] ?? 'fast_entry',
        title: feature.description,
      });
    }
  }

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
      benefits.push({ type: 'presale', title: '사전 신청 허용' });
    }
    if (passPlan.tier === PassPlanTier.Premium) {
      benefits.push({ type: 'fast_entry', title: '우선 입장' });
    }
  }

  return benefits;
};

export const PassPlanBenefits = ({ passPlan }: { passPlan: GetPassPlanResponse }) => {
  const benefits = passPlan.benefits && passPlan.benefits.length > 0
    ? passPlan.benefits
    : buildBenefitsFromPlan(passPlan);

  if (benefits.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {benefits.map((benefit, index) => (
        <div key={index} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 rounded overflow-hidden">
              <BenefitIcon type={benefit.type} />
            </div>
          </div>
          <span className="text-[13px] text-[#333] font-medium">{benefit.title}</span>
        </div>
      ))}
    </div>
  );
};
