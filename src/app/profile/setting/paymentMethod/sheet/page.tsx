import { PaymentMethodSheetForm } from "@/app/profile/setting/paymentMethod/sheet/PaymentMethodSheetForm";

export default async function PaymentMethodSheet({
                                                   params
                                                 }: { params: Promise<{ baseRoute: string }> }) {
  const {baseRoute} = await params;
  return (
    <PaymentMethodSheetForm baseRoute={baseRoute}/>
  )
}