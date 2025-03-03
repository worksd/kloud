'use client'

import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import React, { useState } from "react";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { PassItem } from "@/app/pass/PassItem";
import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";

export const PurchaseStudioPassForm = ({studio}: { studio: GetStudioResponse | null }) => {

  const [pass, setPass] = useState<GetPassResponse | null>(null);

  return (
    <div className={"flex flex-col"}>
      {studio && studio.name &&
        <div className={"text-[24px] text-black font-medium px-6 mt-4"}>{studio?.name} 댄스 스튜디오 패스 구매하기</div>
      }
      <ul className="flex flex-col p-6 space-y-4 mt-4">
        {mockPassResponseList.map((item) => (
          <PassItem
            key={item.id}
            item={item}
            isSelected={pass ? pass.id === item.id : mockPassResponseList.find(p => p.isHot)?.id === item.id}
            onClickAction={(item: GetPassResponse) => {
              setPass(item)
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
            window.KloudEvent?.push(KloudScreen.PassPayment(pass?.id ?? 0))
          }
        }} disabled={false}>
          패스 구매하기
        </CommonSubmitButton>
      </div>

    </div>
  )
}

export const mockPassResponseList: GetPassResponse[] = [
  {
    id: 0,
    price: 28000,
    title: '1 Class',
    isHot: false,
  },
  {
    id: 1,
    price: 125000,
    title: '5 Class',
    isHot: true,
  },
  {
    id: 2,
    price: 220000,
    title: '10 Class',
    isHot: false,
  },
  {
    id: 3,
    price: 330000,
    title: '20 Class',
    isHot: false,
  },
]