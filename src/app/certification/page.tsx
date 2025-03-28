import { CertificationForm } from "@/app/certification/CertificationForm";

export default async function Certification({searchParams}: {
  searchParams: Promise<{ appVersion: string }>
}) {
  const { appVersion } = await searchParams;
  return (
    <CertificationForm appVersion={appVersion}/>
  )
}