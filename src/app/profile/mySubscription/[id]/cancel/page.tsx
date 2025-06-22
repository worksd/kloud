import MySubscriptionCancelForm from "@/app/profile/mySubscription/[id]/cancel/MySubscriptionCancelPage";
import { getSubscriptionDetailAction } from "@/app/profile/mySubscription/action/get.subscription.detail.action";

export default async function MySubscriptionCancelPage({params}: { params: Promise<{ id: string }> }) {
  const subscriptionId = (await params).id
  const subscription = await getSubscriptionDetailAction({subscriptionId})
  if ('subscriptionId' in subscription) {
    return (
      <MySubscriptionCancelForm subscription={subscription}/>
    )
  } else {
    throw Error()
  }

}