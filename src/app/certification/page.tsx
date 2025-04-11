import { CertificationForm } from "@/app/certification/CertificationForm";
import { getUserAction } from "@/app/onboarding/action/get.user.action";

export default async function Certification({searchParams}: {
  searchParams: Promise<{ appVersion: string }>
}) {
  const { appVersion } = await searchParams;
  const res = await getUserAction();
  if (res != null && 'id' in res) {
    return (
      <CertificationForm appVersion={appVersion} user={res}/>
    )
  } else {
    return <div className={'text-black'}>{res?.message}</div>
  }
}