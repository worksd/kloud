import { Suspense } from "react";
import Loading from "@/app/loading";
import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { getLocale, translate } from "@/utils/translate";
import { PaymentRecordTabClient } from "@/app/paymentRecords/PaymentRecordTabClient";
import { getSubscriptionList } from "@/app/profile/mySubscription/action/get.subscription.list.action";

export default async function PaymentRecordsPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <PaymentRecordsServer/>
    </Suspense>
  );
}

async function PaymentRecordsServer() {
  const [paymentRes, subscriptionRes] = await Promise.all([
    getPaymentRecordsAction({ page: 1 }),
    getSubscriptionList(),
  ]);
  const locale = await getLocale();
  const noRecordsMessage = await translate('no_purchase_history');

  const initialRecords = 'paymentRecords' in paymentRes ? paymentRes.paymentRecords : [];

  const subscriptions = 'subscriptions' in subscriptionRes ? subscriptionRes.subscriptions : [];

  return (
    <PaymentRecordTabClient
      initialRecords={initialRecords}
      subscriptions={subscriptions}
      locale={locale}
      noRecordsMessage={noRecordsMessage}
    />
  );
}
