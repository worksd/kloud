import { CertificationForm } from "@/app/certification/CertificationForm";
import { getUserAction } from "@/app/onboarding/action/get.user.action";

export default async function Certification({searchParams}: {
  searchParams: Promise<{ appVersion: string, isFromPayment: string }>
}) {
  const { appVersion, isFromPayment } = await searchParams;
  const res = await getUserAction();
  if (res != null && 'id' in res) {
    return (
      <CertificationForm appVersion={appVersion} user={res} isFromPayment={isFromPayment == 'true'}/>
    )
  } else {
    return <div className={'text-black'}>{res?.message}</div>
  }
}