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
import Loading from "@/app/loading";

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
      {passPlan && passPlans.length > 0 && (
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
      )}
      {passPlans.length == 0 &&
        <Loading/>
      }

      <div className={"flex flex-col bg-[#F7F8F9] p-6 text-[#86898C] space-y-4"}>
        <TranslatableText className={"font-bold text-[16px]"} titleResource={'purchase_pass_information'}/>
        <TranslatableText className={"text-[14px]"} titleResource={'pass_refund_policy'}/>
      </div>

      <div className={"sticky bottom-0 px-6"}>
        <CommonSubmitButton originProps={{
          onClick: () => {
            window.KloudEvent?.push(KloudScreen.PassPayment(passPlan?.id ?? 0))
          }
        }} disabled={passPlan == null}>
          <TranslatableText titleResource={'purchase_pass_title'}/>
        </CommonSubmitButton>
      </div>

    </div>
  )
}