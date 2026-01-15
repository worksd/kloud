import { Suspense } from "react";
import Loading from "@/app/loading";
import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { getLocale, translate } from "@/utils/translate";
import { PaymentRecordListClient } from "@/app/paymentRecords/PaymentRecordListClient";

export default async function PaymentRecordsPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <PaymentRecordsServer/>
    </Suspense>
  );
}

async function PaymentRecordsServer() {
  const res = await getPaymentRecordsAction({ page: 1 });
  const locale = await getLocale();
  const noRecordsMessage = await translate('no_purchase_history');

  const initialRecords = 'paymentRecords' in res ? res.paymentRecords : [];

  return (
    <PaymentRecordListClient
      initialRecords={initialRecords}
      locale={locale}
      noRecordsMessage={noRecordsMessage}
    />
  );
}
