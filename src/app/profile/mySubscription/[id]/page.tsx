import { getSubscriptionDetailAction } from "@/app/profile/mySubscription/action/get.subscription.detail.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function MySubscriptionDetailPage({params}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const subscription = await getSubscriptionDetailAction({subscriptionId: id})
  if ('subscriptionId' in subscription) {
    const {productName, productImageUrl, status, studio, startDate, endDate} = subscription;

    const statusColor = {
      Active: "text-green-600 bg-green-100",
      Cancelled: "text-gray-600 bg-gray-100",
      Failed: "text-red-600 bg-red-100",
    }[status];

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-black">
        <div className="px-6 mb-14">
          <SimpleHeader titleResource={'my_subscription'}/>
        </div>
        <div className="rounded-2xl shadow-md border border-gray-200 bg-white overflow-hidden">
          {productImageUrl && (
            <img
              src={productImageUrl}
              alt={productName}
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
            <span className={`text-sm px-3 py-1 rounded-full font-medium w-fit ${statusColor}`}>
              {status}
            </span>
              <h2 className="text-xl font-bold">{productName}</h2>
            </div>
            {/* 날짜 표시 */}
            <div className="border-t pt-4 text-sm text-gray-700">
              <div className="font-semibold mb-1">이용 기간</div>
              <div>{startDate} ~ {endDate}</div>
            </div>

            {studio && (
              <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
                <div className="font-semibold">소속 스튜디오</div>
                <div>{studio.name}</div>
                {studio.address && <div className="text-gray-500">{studio.address}</div>}
              </div>
            )}

            <div className="border-t pt-4 text-sm text-gray-600">
              <div className="font-semibold mb-1">구독 ID</div>
              <div className="text-xs text-gray-400">{subscription.subscriptionId}</div>
            </div>
          </div>
        </div>
        {subscription.scheduledPaymentRecord &&
          <UpcomingPaymentCard payment={{
            subscriptionId: subscription.subscriptionId,
            studio,
            nextPaymentDate: subscription.scheduledPaymentRecord?.paymentScheduledAt ?? '',
            productName: subscription.productName,
          }}/>
        }
      </div>
    );
  }
}


type UpcomingPayment = {
  subscriptionId: string;
  productName: string;
  nextPaymentDate: string;
  studio?: {
    id: number;
    name: string;
  };
};

export function UpcomingPaymentCard({payment}: { payment: UpcomingPayment }) {
  const {subscriptionId, productName, nextPaymentDate, studio} = payment;

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white text-black">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-medium">{productName}</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            예정 결제일
          </span>
      </div>

      {studio && (
        <p className="text-sm text-gray-600 mb-1">
          스튜디오: <span className="font-medium">{studio.name}</span>
        </p>
      )}

      <p className="text-sm text-gray-700 mb-1">결제일: <span className="font-medium">{nextPaymentDate}</span></p>
      <p className="text-xs text-gray-400">구독 ID: {subscriptionId}</p>
    </div>
  );
}