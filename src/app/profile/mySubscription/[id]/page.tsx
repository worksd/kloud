import { getSubscriptionDetailAction } from "@/app/profile/mySubscription/action/get.subscription.detail.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { translate } from "@/utils/translate";
import { getSubscriptionStatus } from "@/app/profile/mySubscription/[id]/util";

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
              { status == 'Active' ? await translate('active') :
                status == 'Cancelled' ? await translate('cancelled') :
                  status == 'Failed' ? await translate('failed') : ''
              }
            </span>
              <h2 className="text-xl font-bold">{productName}</h2>
            </div>
            {/* 날짜 표시 */}
            <div className="border-t pt-4 text-sm text-gray-700">
              <div className="font-semibold mb-1">{await translate('period')}</div>
              <div>{startDate} ~ {endDate}</div>
            </div>

            {studio && (
              <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
                <div className="font-semibold">{await translate('studio')}</div>
                <div>{studio.name}</div>
                {studio.address && <div className="text-gray-500">{studio.address}</div>}
              </div>
            )}

            <div className="border-t pt-4 text-sm text-gray-600">
              <div className="font-semibold mb-1">{await translate('subscription_id')}</div>
              <div className="text-xs text-gray-400">{subscription.subscriptionId}</div>
            </div>
          </div>
        </div>

        {subscription.paymentScheduledAt && subscription.status == 'Active' &&
          <div>
            <UpcomingPaymentCard payment={{
              subscriptionId: subscription.subscriptionId,
              studio,
              nextPaymentDate: subscription.paymentScheduledAt ?? '',
              productName: subscription.productName,
            }}/>
            <NavigateClickWrapper route={KloudScreen.MySubscriptionCancel(subscription.subscriptionId)} method={'push'}>
              <div className="text-xs text-gray-400 mt-2 text-right">
                {await translate('cancel_subscription')}
              </div>
            </NavigateClickWrapper>
          </div>
        }
      </div>

    );
  }
}

type UpcomingPayment = {
  subscriptionId: string;
  productName: string;
  nextPaymentDate: string;
  studio?: GetStudioResponse;
};

const UpcomingPaymentCard = async ({payment}: { payment: UpcomingPayment }) => {
  const {nextPaymentDate} = payment;

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white text-black mt-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-900">{await translate('payment_record_scheduled')}</span>
        <span className="text-sm text-gray-700">{nextPaymentDate}</span>
      </div>
    </div>
  );
};
