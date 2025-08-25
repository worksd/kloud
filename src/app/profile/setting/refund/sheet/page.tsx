import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { RefundAccountEditForm } from "@/app/profile/setting/refund/RefundAccountEditForm";
import React from "react";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import CloseIcon from "../../../../../../public/assets/ic_close_black.svg";

export default async function RefundAccountEditSheetPage(
  {searchParams}: { searchParams: Promise<{ baseRoute: string, appVersion: string }> }
) {
  const user = await getUserAction();
  const { baseRoute } = await searchParams;

  if (user != null && "id" in user) {
    return (
      <div className="flex flex-col bg-white">
        <div className="flex flex-row justify-between px-4 pt-2">
          <h2 className="text-black text-lg font-bold mb-2">
            {await translate("refund_account")}
          </h2>
          <NavigateClickWrapper method={"closeBottomSheet"}>
            <CloseIcon />
          </NavigateClickWrapper>
        </div>

        <RefundAccountEditForm
          initialAccountBank={user.refundAccountBank}
          initialAccountDepositor={user.refundAccountDepositor}
          initialAccountNumber={user.refundAccountNumber}
          baseRoute={baseRoute}
          isFromBottomSheet={true}
        />
      </div>
    );
  } else {
    return <div className="text-black">{user?.message}</div>;
  }
}