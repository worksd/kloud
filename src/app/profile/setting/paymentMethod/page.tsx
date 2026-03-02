import { BillingCardForm } from "@/app/profile/setting/paymentMethod/BillingCardForm";
import { getBillingListAction } from "@/app/profile/setting/paymentMethod/get.billing.list.action";
import { getMeBirthAction } from "@/app/profile/setting/paymentMethod/get.me.birth.action";
import { getLocale } from "@/utils/translate";

export default async function PaymentMethodPage() {
  const [res, birth] = await Promise.all([getBillingListAction(), getMeBirthAction()])
  if ('billings' in res) {
    return (
      <div className={'pt-0'}>
        <BillingCardForm cards={res.billings}
                         locale={await getLocale()}
                         birth={birth}
        />
      </div>

    )
  }
}