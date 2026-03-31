import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { PassTicketUsageHistory } from "@/app/profile/myPass/[id]/PassTicketUsageHistory";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanTier, PassBenefitType, PassPlanRule, RuleTicket } from "@/app/endpoint/pass.endpoint";
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

const ruleBenefitToType = (benefitType?: string): PassBenefitType => {
  switch (benefitType) {
    case 'Unlimited': return 'unlimited';
    case 'FreeCount': return 'free_count';
    case 'Discount': return 'discount';
    default: return 'unlimited';
  }
};

const featureKeyToType: Record<string, PassBenefitType> = {
  canPrePurchase: 'presale',
  priorityEntry: 'fast_entry',
  practiceRoom: 'room',
};

const TicketStatusBadge = ({ status }: { status: RuleTicket['status'] }) => {
  switch (status) {
    case 'Used':
      return <span className="text-[11px] font-bold text-[#999] bg-[#F1F3F6] px-2 py-0.5 rounded-full">사용완료</span>;
    case 'Upcoming':
      return <span className="text-[11px] font-bold text-[#5B5FF6] bg-[#EDEDFF] px-2 py-0.5 rounded-full">예정</span>;
    case 'Cancelled':
      return <span className="text-[11px] font-bold text-[#E55B5B] bg-[#FFEDED] px-2 py-0.5 rounded-full">취소</span>;
  }
};

// Mock tickets — API 준비되면 rule.tickets로 교체
const mockTicketsForRule = (ruleId: number): RuleTicket[] => [
  { id: ruleId * 100 + 1, title: '트릭스 힙합 클래스 초보반', date: '2026.03.28(토) 17:00', status: 'Used' },
  { id: ruleId * 100 + 2, title: '트릭스 힙합 클래스 중급반', date: '2026.03.29(일) 18:00', status: 'Upcoming' },
  { id: ruleId * 100 + 3, title: '주말 아침 하드 트레이닝', date: '2026.04.05(토) 09:00', status: 'Upcoming' },
];

export default async function MyPassDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const pass = await getPassAction({id: (await params).id});
  const locale = await getLocale();

  if ('id' in pass) {
    const passPlan = pass.passPlan;
    const rules = passPlan?.rules && passPlan.rules.length > 0 ? passPlan.rules : [
      {
        id: -1,
        description: '키즈반 전용 수업을 무제한으로 이용할 수 있습니다',
        target: { type: 'Exclusive', value: null, label: null },
        benefit: { type: 'Unlimited', value: null },
        excludes: [],
      },
      {
        id: -2,
        description: '모든 수업을 20회 수강할 수 있습니다 (단, 팝핀 장르 제외)',
        target: { type: 'All', value: null, label: null },
        benefit: { type: 'FreeCount', value: 20 },
        excludes: [{ type: 'Genre', value: 'Poppin', label: '팝핀' }],
      },
    ];
    const features = passPlan?.features && passPlan.features.length > 0 ? passPlan.features : [
      { key: 'canPrePurchase', description: '수업을 선예약 기간에 미리 신청할 수 있어요' },
      { key: 'priorityEntry', description: '수업 입장시 우선적으로 입장할 수 있어요' },
    ];

    const benefitsContent = (
      <div className="flex flex-col px-6 pt-4 pb-8">
        {/* Rules — 각 rule별 혜택 + tickets */}
        {rules.map((rule) => {
          const benefitType = ruleBenefitToType(rule.benefit?.type);
          const tickets = rule.tickets ?? mockTicketsForRule(rule.id);
          const usedCount = tickets.filter(t => t.status === 'Used').length;

          return (
            <div key={rule.id} className="mb-6">
              {/* 혜택 헤더 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                  <BenefitIcon type={benefitType} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[15px] font-semibold text-black">{rule.description}</span>
                  {rule.benefit?.value && (
                    <span className="text-[12px] font-medium text-[#5B5FF6]">
                      {usedCount}/{rule.benefit.value}회 사용
                    </span>
                  )}
                </div>
              </div>

              {/* 수강권 목록 */}
              {tickets.length > 0 && (
                <div className="flex flex-col gap-1.5 ml-[52px]">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#F9FAFB]">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-medium text-[#333] truncate">{ticket.title}</span>
                        <span className="text-[11px] text-[#999]">{ticket.date}</span>
                      </div>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                  ))}
                </div>
              )}

              {tickets.length === 0 && (
                <div className="ml-[52px] py-3 text-[13px] text-[#AEAEAE]">
                  아직 사용한 수강권이 없습니다
                </div>
              )}
            </div>
          );
        })}

        {/* Features — 부가 혜택 */}
        {features.length > 0 && (
          <>
            {rules.length > 0 && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-[#EBEBEB]" />
                <span className="text-[12px] text-[#B0B0B0] font-medium">부가 혜택</span>
                <div className="flex-1 h-px bg-[#EBEBEB]" />
              </div>
            )}
            <div className="flex flex-col gap-3">
              {features.map((feature, i) => {
                if (!feature.description) return null;
                const type = featureKeyToType[feature.key] ?? 'fast_entry';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                      <BenefitIcon type={type} />
                    </div>
                    <span className="text-[14px] font-medium text-black">{feature.description}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {rules.length === 0 && features.length === 0 && (
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
            <div className="flex flex-col gap-3 min-w-0">
              <div className="flex items-center gap-3">
                <CircleImage size={44} imageUrl={pass.passPlan?.studio?.profileImageUrl} />
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-[20px] font-bold text-black truncate">{pass.passPlan?.name}</h2>
                  {passPlan?.tier === PassPlanTier.Premium && (
                    <PremiumTierIcon className="flex-shrink-0" />
                  )}
                </div>
              </div>

              {pass.status === 'Pending' && (
                <span className="text-[12px] font-bold text-[#86898C] bg-white/60 border border-[#E0E0E0] px-3 py-[5px] rounded-full self-start">
                  입금 대기
                </span>
              )}
              {pass.status === 'Waiting' && (
                <span className="text-[12px] font-bold text-[#F59E0B] bg-[#FFFDF5] border border-[#F59E0B]/20 px-3 py-[5px] rounded-full self-start">
                  시작 대기
                </span>
              )}
              {pass.status === 'Done' && (
                <span className="text-[12px] font-bold text-[#999] bg-white/60 border border-[#E0E0E0] px-3 py-[5px] rounded-full self-start">
                  사용 완료
                </span>
              )}
              {pass.status === 'Expired' && (
                <span className="text-[12px] font-bold text-[#999] bg-white/60 border border-[#E0E0E0] px-3 py-[5px] rounded-full self-start">
                  만료됨
                </span>
              )}

              {pass.endDate && (
                <span className="text-[13px] text-[#AEAEAE] font-medium">
                  {pass.endDate} 까지
                </span>
              )}
            </div>

            <div className="flex-shrink-0 rounded-xl overflow-hidden bg-white p-1.5 shadow-sm border border-[#E8E8E8]">
              <PassQRCode url="https://www.naver.com" />
            </div>
          </div>
        </div>

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

        {pass.status === 'Waiting' && pass.startDate && (
          <div className="mx-6 mb-2 p-4 bg-[#FFFDF5] rounded-xl border border-[#F59E0B]/20">
            <div className="text-[#F59E0B] font-semibold text-sm">
              {pass.startDate} {await translate('waiting_pass_start_date')}
            </div>
          </div>
        )}

        <PassDetailTabs
          benefitsContent={benefitsContent}
          usageContent={usageContent}
        />
      </div>
    )
  }
}
