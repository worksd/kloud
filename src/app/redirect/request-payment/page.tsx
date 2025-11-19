import {phoneLoginAction} from "@/app/login/phone/phoneLoginAction";
import {redirect} from "next/navigation";

export default async function RequestPaymentPage({searchParams}: {
  searchParams: Promise<{
    phone: string,
    countryCode: string,
    parentName: string,
    redirectUrl: string,
  }>
}) {
  const {phone, countryCode, redirectUrl} = await searchParams;
  const phoneRes = await phoneLoginAction({
    phone, countryCode, isAdmin: true
  })
  console.log(phoneRes);
  if ('user' in phoneRes) {
    redirect(redirectUrl)
  } else {
    redirect('/')
  }
  return (
      <div>
        결제 페이지로 이동중입니다.
      </div>
  );
}
