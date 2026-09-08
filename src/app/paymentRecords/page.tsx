import { Suspense } from "react";
import Loading from "@/app/loading";
import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { getLocale, translate } from "@/utils/translate";
import { PaymentRecordTabClient } from "@/app/paymentRecords/PaymentRecordTabClient";

export default async function PaymentRecordsPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <PaymentRecordsServer/>
    </Suspense>
  );
}

async function PaymentRecordsServer() {
  const paymentRes = await getPaymentRecordsAction({ page: 1 });
  const locale = await getLocale();
  const noRecordsMessage = await translate('no_purchase_history');

  const initialRecords = 'paymentRecords' in paymentRes ? paymentRes.paymentRecords : [];

  return (
    <PaymentRecordTabClient
      initialRecords={initialRecords}
      locale={locale}
      noRecordsMessage={noRecordsMessage}
    />
  );
}
