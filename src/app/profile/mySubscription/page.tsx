import { getSubscriptionList } from "@/app/profile/mySubscription/action/get.subscription.list.action";
import { GetSubscriptionResponse } from "@/app/endpoint/subscription.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { translate } from "@/utils/translate";

export default async function MySubscriptionPage() {
  const res = await getSubscriptionList();

  const header = (
    <div className="flex justify-between items-center mb-14 px-6">
      <SimpleHeader titleResource={'subscription_list'}/>
    </div>
  );

  // subscriptions 키가 아예 없을 경우 (API 실패 등)
  if (!('subscriptions' in res)) {
    return (
      <div className="p-6 text-center text-gray-500">
        {header}
        정기결제 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const subscriptions = res.subscriptions;

  // 정기결제 목록이 비어 있을 경우
  if (subscriptions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {header}
        현재 활성화된 정기결제가 없습니다.
      </div>
    );
  }

  // 정기결제 목록이 있을 경우
  return (
    <div className="p-6 space-y-4 text-black">
      {header}
      {subscriptions.map((sub) => (
        <SubscriptionCard key={sub.subscriptionId} subscription={sub}/>
      ))}
    </div>
  );
}

const SubscriptionCard = async ({subscription}: { subscription: GetSubscriptionResponse }) => {
  const {subscriptionId, productName, status, studio} = subscription;

  const statusColor = {
    Active: "bg-green-100 text-green-800",
    Cancelled: "bg-gray-100 text-gray-600",
    Failed: "bg-red-100 text-red-800",
  }[status];

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.MySubscriptionDetail(subscriptionId)}>
      <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white">
        <div className="flex justify-between items-start mb-2 text-black">
          <h2 className="text-lg font-medium">{productName}</h2>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                        {status == 'Active' ? await translate('active') :
                          status == 'Cancelled' ? await translate('cancelled') :
                            status == 'Failed' ? await translate('failed') : ''
                        }
          </span>
        </div>
        {studio && (
          <p className="text-sm text-gray-600 mb-1">
            스튜디오: <span className="font-medium">{studio.name}</span>
          </p>
        )}
        <p className="text-xs text-gray-400">정기결제 ID: {subscriptionId}</p>
      </div>
    </NavigateClickWrapper>
  );
}
