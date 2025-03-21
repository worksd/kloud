'use client'

import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import React, { useEffect, useState } from "react";
import { GetPassPlanResponse, GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { PassPlanItem } from "@/app/passPlans/PassPlanItem";
import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { TranslatableText } from "@/utils/TranslatableText";
import { useLocale } from "@/hooks/useLocale";

export const PurchaseStudioPassForm = ({studio}: { studio: GetStudioResponse | null }) => {

  const [passPlans, setPassPlans] = useState<GetPassPlanResponse[]>([]);
  const [passPlan, setPassPlan] = useState<GetPassPlanResponse | null>(null);

  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, []);

  useEffect(() => {
    const fetchPassPlans = async () => {
      if (studio) {
        const res = await getPassPlanListAction({
          studioId: studio.id,
        });
        if ('passPlans' in res) {
          let passPlans = res.passPlans ?? [];

          // 서버에서 isPopular를 모두 false로 내려줄경우 가장 첫번째를 popular pass로 설정
          if (!passPlans.some(plan => plan.isPopular) && passPlans.length > 0) {
            passPlans = passPlans.map((plan, index) =>
              index === 0 ? { ...plan, isPopular: true } : plan
            );
          }

          const popularPassPlan = passPlans.find(value => value.isPopular) ?? passPlans[0];

          setPassPlans(passPlans);
          setPassPlan(popularPassPlan);
        }
      }
    }
    fetchPassPlans()
  }, [studio]);

  return (
    <div className={"flex flex-col"}>
      {studio && studio.name &&
        <div className={"text-[24px] text-black font-medium px-6 mt-4"}>{studio?.name} {mounted ? t('purchase_pass') : ''}</div>
      }
      <ul className="flex flex-col p-6 space-y-4 mt-4">
        {passPlans.map((item) => (
          <PassPlanItem
            key={item.id}
            item={item}
            isSelected={passPlan ? passPlan.id === item.id : passPlans.find(p => p.isPopular)?.id === item.id}
            onClickAction={(item: GetPassPlanResponse) => {
              setPassPlan(item)
            }}/>
        ))}
      </ul>

      <div className={"flex flex-col bg-[#F7F8F9] p-6 text-[#86898C] space-y-4"}>
        <div className={"font-bold text-[16px]"}>패스 구매 안내사항</div>
        <div className={"text-[14px]"}>- 패스 유효기간: 패스는 구입일로부터 일정 기간 내에만 사용 가능합니다. 유효기간 내에 모든 수업을 완료하지 않으면, 남은 수업은 자동으로
          소멸되며 환불이
          불가합니다. <br/>
          - 수업 일정 및 변경: 수업 일정은 사전 공지 없이 변경될 수 있으며, 변경된 일정에 맞출 수 없는 경우에는 다른 일정으로 대체가 불가능할 수 있습니다. 수업에 대한 변경 사항을 주기적으로 확인해
          주세요.<br/>
          - 패스 양도 불가: 구매한 패스는 본인만 사용할 수 있으며, 타인에게 양도하거나 판매할 수 없습니다. 양도 및 판매 시 패스가 무효 처리될 수 있습니다.<br/>
          - 환불 정책: 패스 구입 후 환불은 기본적으로 불가합니다. 단, 예외적으로 특정 조건(예: 수업 시작 전)에서만 환불이 가능하며, 환불을 원할 경우 반드시 고객센터에 문의해 주세요.<br/>
          - 기타 조건: 패스 사용에 관한 기타 조건은 서비스 제공자와의 계약에 따라 달라질 수 있으며, 변경 사항은 사전에 공지됩니다. 이에 대한 자세한 내용은 이용 약관을 참고하시기 바랍니다.
        </div>
      </div>

      <div className={"sticky bottom-0 px-6"}>
        <CommonSubmitButton originProps={{
          onClick: () => {
            window.KloudEvent?.push(KloudScreen.PassPayment(passPlan?.id ?? 0))
          }
        }} disabled={false}>
          <TranslatableText titleResource={'purchase_pass_title'}/>
        </CommonSubmitButton>
      </div>

    </div>
  )
}