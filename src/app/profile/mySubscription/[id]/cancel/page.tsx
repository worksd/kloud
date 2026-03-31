import MySubscriptionCancelForm from "@/app/profile/mySubscription/[id]/cancel/MySubscriptionCancelPage";
import { getSubscriptionDetailAction } from "@/app/profile/mySubscription/action/get.subscription.detail.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { getLocale } from "@/utils/translate";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";

export default async function MySubscriptionCancelPage({params}: { params: Promise<{ id: string }> }) {
  const subscriptionId = (await params).id
  const subscription = await getSubscriptionDetailAction({subscriptionId})
  if ('subscriptionId' in subscription) {
    return (
      <div className={'flex flex-col'}>
        <MySubscriptionCancelForm subscription={subscription} locale={await getLocale()} />
      </div>
    )
  } else {
    const result = await handleApiError(subscription, `GET /subscriptions/${subscriptionId}`);
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
  }

}