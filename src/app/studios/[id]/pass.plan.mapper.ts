import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { CommunityPass } from "@/app/community/community.mock";
import { formatRuleDescription } from "@/utils/pass.description";
import { Locale } from "@/shared/StringResource";

/**
 * GET /studios/:id passPlans[] / GET pass-plans → StudioPassList 가 쓰는 CommunityPass 로 매핑.
 * 스튜디오 상세(모바일/PC)와 정규반·패스권 전체 페이지가 같은 규칙을 써야 같은 패스권이 다르게 보이지 않는다.
 *  - 제목 밑 혜택 요약은 첫 rule 을 formatRuleDescription 으로 문구화 (PassPlanItem 과 동일)
 *  - 태그는 BE tag 우선, 없고 isRecommended 면 '인기' 라벨
 */
export const toCommunityPasses = (
  passPlans: GetPassPlanResponse[] | undefined,
  locale: Locale,
  popularLabel: string,
): CommunityPass[] =>
  (passPlans ?? []).map((p) => {
    const firstRule = p.rules?.[0];
    const description = firstRule?.target && firstRule?.benefit
      ? formatRuleDescription(
          { target: firstRule.target, benefit: firstRule.benefit, duration: firstRule.duration, excludes: firstRule.excludes },
          locale,
          p.name,
        )
      : undefined;
    return {
      id: p.id,
      name: p.name,
      price: p.price ?? 0,
      period: p.expireDateStamp,
      tag: p.tag ?? (p.isRecommended ? popularLabel : undefined),
      description,
    };
  });
