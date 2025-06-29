import { PaymentMethodSheetForm } from "@/app/profile/setting/paymentMethod/sheet/PaymentMethodSheetForm";

export default async function PaymentMethodSheet({
                                                   searchParams
                                                 }: { searchParams: Promise<{ baseRoute: string }> }) {
  const {baseRoute} = await searchParams;
  return (
    <PaymentMethodSheetForm baseRoute={baseRoute}/>
  )
}