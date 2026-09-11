import { GetPassPlanResponse, PassBenefit, PassBenefitType, PassPlanTier } from "@/app/endpoint/pass.endpoint";
import UnlimitedIcon from "../../../public/assets/ic_unlimited.svg";
import FreeUnlimitedIcon from "../../../public/assets/ic_free_unlimited.svg";
import DiscountIcon from "../../../public/assets/ic_discount.svg";
import PassFastIcon from "../../../public/assets/ic_pass_fast.svg";
import PassPresaleIcon from "../../../public/assets/ic_pass_presale.svg";
import PassRoomIcon from "../../../public/assets/ic_pass_room.svg";
import { formatRuleDescription, formatFeatureDescription } from "@/utils/pass.description";
import { Locale } from "@/shared/StringResource";

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

// BE 혜택 타입 → 아이콘 타입. 'Lesson'은 value(회차)가 있으면 횟수제, 없으면 무제한. FreeCount/Unlimited는 옛 이름(호환)
const ruleBenefitToType = (benefitType?: string, value?: number | null): PassBenefitType => {
  switch (benefitType) {
    case 'Lesson': return value != null ? 'free_count' : 'unlimited';
    case 'Unlimited': return 'unlimited';
    case 'FreeCount': return 'free_count';
    case 'Discount': return 'discount';
    case 'TimeHours': return 'room';
    default: return 'unlimited';
  }
};

const buildBenefitsFromPlan = (passPlan: GetPassPlanResponse, locale: Locale = 'ko'): PassBenefit[] => {
  const benefits: PassBenefit[] = [];

  if (passPlan.rules) {
    for (const rule of passPlan.rules) {
      benefits.push({
        type: ruleBenefitToType(rule.benefit?.type, rule.benefit?.value),
        title: formatRuleDescription({
          target: rule.target ?? { type: 'All' },
          benefit: rule.benefit ?? { type: 'Unlimited' },
          duration: rule.duration,
          excludes: rule.excludes,
        }, locale, passPlan.tag ?? passPlan.name),
      });
    }
  }

  if (passPlan.features) {
    for (const feature of passPlan.features) {
      benefits.push({
        type: featureKeyToType[feature.key] ?? 'fast_entry',
        title: formatFeatureDescription(feature.key, locale, feature.value),
      });
    }
  }

  // 규칙이 하나도 없을 때의 폴백 — 회차/무제한은 이용규칙이 정하므로(레거시 usageLimit·type은 읽지 않음) 부가기능만 채운다
  if (benefits.length === 0) {
    if (passPlan.canPreSale) {
      benefits.push({ type: 'presale', title: formatFeatureDescription('canPrePurchase', locale) });
    }
    if (passPlan.tier === PassPlanTier.Premium) {
      benefits.push({ type: 'fast_entry', title: formatFeatureDescription('priorityEntry', locale) });
    }
  }

  return benefits;
};

export const PassPlanBenefits = ({ passPlan, locale = 'ko' }: { passPlan: GetPassPlanResponse, locale?: Locale }) => {
  const benefits = passPlan.benefits && passPlan.benefits.length > 0
    ? passPlan.benefits
    : buildBenefitsFromPlan(passPlan, locale);

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
