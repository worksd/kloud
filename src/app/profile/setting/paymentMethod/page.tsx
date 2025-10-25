import { BillingCardForm } from "@/app/profile/setting/paymentMethod/BillingCardForm";
import { getBillingListAction } from "@/app/profile/setting/paymentMethod/get.billing.list.action";
import { getLocale } from "@/utils/translate";

export default async function PaymentMethodPage() {
  const res = await getBillingListAction()
  if ('billings' in res) {
    return (
      <div className={'pt-24'}>
        <BillingCardForm cards={res.billings}
                         locale={await getLocale()}
        />
      </div>

    )
  }
}