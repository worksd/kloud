import { GetMembershipPlanResponse } from "@/app/endpoint/membership.endpoint";

export const CurrentMembershipPlan = ({membershipPlan}: { membershipPlan: GetMembershipPlanResponse }) => {
  return (
    <div className="px-6 py-4">
      <div className="text-[20px] font-bold text-black mb-2">{membershipPlan.name}</div>
      {membershipPlan.description && (
        <div className="text-[14px] text-[#86898C]">{membershipPlan.description}</div>
      )}
      {membershipPlan.durationMonths && (
        <div className="text-[14px] text-[#86898C] mt-1">기간: {membershipPlan.durationMonths}개월</div>
      )}
    </div>
  );
}

