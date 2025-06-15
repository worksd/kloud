import { api } from "@/app/api.client";
import { BillingCardForm } from "@/app/profile/setting/paymentMethod/BillingCardForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getBillingListAction } from "@/app/profile/setting/paymentMethod/get.billing.list.action";

export default async function PaymentMethodPage() {
  const res = await getBillingListAction()
  if ('billings' in res) {
    return (
      <div>
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="payment_method_management"/>
        </div>
        <BillingCardForm cards={res.billings}/>
      </div>

    )
  }
}