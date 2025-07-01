import MySubscriptionCancelForm from "@/app/profile/mySubscription/[id]/cancel/MySubscriptionCancelPage";
import { getSubscriptionDetailAction } from "@/app/profile/mySubscription/action/get.subscription.detail.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";

export default async function MySubscriptionCancelPage({params}: { params: Promise<{ id: string }> }) {
  const subscriptionId = (await params).id
  const subscription = await getSubscriptionDetailAction({subscriptionId})
  if ('subscriptionId' in subscription) {
    return (
      <div className={'flex flex-col'}>
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource={'cancel_subscription'}/>
        </div>
        <MySubscriptionCancelForm subscription={subscription}/>
      </div>
    )
  } else {
    throw Error()
  }

}