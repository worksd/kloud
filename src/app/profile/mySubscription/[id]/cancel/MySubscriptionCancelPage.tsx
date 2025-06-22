'use client'

import { useEffect, useState } from "react";
import CheckIcon from "../../../../../../public/assets/check_white.svg";
import { GetSubscriptionResponse } from "@/app/endpoint/subscription.endpoint";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { KloudScreen } from "@/shared/kloud.screen";
import { cancelSubscriptionAction } from "@/app/profile/mySubscription/[id]/cancel/cancel.subscription.action";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";


const cancelReasons = [
  '서비스가 더 이상 필요하지 않아요',
  '가격이 너무 비싸요',
  '서비스에 만족하지 못했어요',
  '기술적인 문제가 있었어요',
  '기타',
];

export default function MySubscriptionCancelForm({subscription} : {subscription: GetSubscriptionResponse}) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  const handleCancelSubscription = async () => {
    if (!selectedReason) return;
    const res = await cancelSubscriptionAction({subscriptionId: subscription.subscriptionId, reason: selectedReason})
    if ('subscriptionId' in res) {
      const dialog = await createDialog({id: 'Simple', title: await translate('cancel_subscription_complete_message')})
      window.KloudEvent.showDialog(JSON.stringify(dialog))
    } else {
      const dialog = await createDialog({id: 'Simple', title: await translate('cancel_subscription_fail_message')})
      window.KloudEvent.showDialog(JSON.stringify(dialog))
    }
  };

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.message == await translate('cancel_subscription_complete_message')) {
        const pushRoute = KloudScreen.MySubscriptionDetail(subscription.subscriptionId)
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: pushRoute,
        });
        window.KloudEvent?.navigateMain(bootInfo);
      }
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 text-black">
      <h2 className="text-xl font-semibold mb-4">정기결제 취소</h2>
      <p className="text-sm text-gray-600 mb-6">
        정기결제를 취소하려는 이유를 선택해주세요.
      </p>

      <div className="space-y-3">
        {cancelReasons.map((reason) => (
          <label
            key={reason}
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-100 text-gray-800 ${
              selectedReason === reason ? 'border-2 border-black' : ''
            }`}
            onClick={() => handleReasonSelect(reason)}
          >
            <input
              type="radio"
              name="reason"
              className="hidden"
              checked={selectedReason === reason}
              onChange={() => handleReasonSelect(reason)}
            />
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                selectedReason === reason
                  ? 'bg-black border-black'
                  : 'bg-[#22222233] border-white'
              }`}
            >
              {selectedReason === reason && (
                <CheckIcon size={14} className="text-white" />
              )}
            </div>
            <span className="ml-4 text-[14px] text-[#222222]">{reason}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleCancelSubscription}
        disabled={!selectedReason}
        className={`mt-6 w-full py-3 rounded-lg text-white transition ${
          selectedReason ? 'bg-black hover:bg-gray-800' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        정기결제 취소하기
      </button>
    </div>
  );
}