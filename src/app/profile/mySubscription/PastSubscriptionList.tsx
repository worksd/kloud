'use client'
import { GetSubscriptionResponse } from "@/app/endpoint/subscription.endpoint";

export const PastSubscriptionList = ({subscriptions}: {subscriptions: GetSubscriptionResponse[]}) => {
  return (
    <div className={'text-black'}>Hello Past Subscription </div>
  )
}