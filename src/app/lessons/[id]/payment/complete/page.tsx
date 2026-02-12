import { redirect } from "next/navigation";

export default async function PaymentCompletePage() {
  redirect('/payment/complete');
}