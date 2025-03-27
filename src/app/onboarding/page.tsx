import { OnboardForm } from "@/app/onboarding/onboard.form";

export default async function Onboarding({searchParams}: { searchParams: Promise<{ appVersion: string, returnUrl: string }> }) {

  const {returnUrl, appVersion} = await searchParams;

  return (
    <OnboardForm returnUrl={returnUrl} appVersion={appVersion}/>
  )
}