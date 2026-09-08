import { getSubscriptionList } from "@/app/profile/mySubscription/action/get.subscription.list.action";
import { getLocale, translate } from "@/utils/translate";
import { SubscriptionRow } from "@/app/profile/mySubscription/SubscriptionRow";

// 예약 결제(정기결제) 목록 — 프로필 > 내 활동 > 예약 결제. 네이티브 헤더(타이틀 '예약 결제')를 쓰므로 자체 헤더 없음.
// 진행 중 → 그 외(취소·실패) 순으로 한 목록에.
export default async function MySubscriptionPage() {
  const res = await getSubscriptionList();
  const locale = await getLocale();

  if (!('subscriptions' in res)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-[14px] text-[#8B95A1] text-center">
        {await translate('no_scheduled_payments')}
      </div>
    );
  }

  const subscriptions = [...res.subscriptions].sort((a, b) => Number(b.status === 'Active') - Number(a.status === 'Active'));

  if (subscriptions.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-[14px] text-[#8B95A1] text-center">
        {await translate('no_scheduled_payments')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-2 pb-8">
      <div className="flex flex-col divide-y divide-[#F2F4F6]">
        {subscriptions.map((sub) => (
          <SubscriptionRow key={sub.subscriptionId} sub={sub} locale={locale}/>
        ))}
      </div>
    </div>
  );
}
