import { OnboardForm } from "@/app/onboarding/onboard.form";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { getStudioList } from "@/app/home/action/get.studio.list.action";

export default async function Onboarding({searchParams}: {
  searchParams: Promise<{ appVersion: string, returnUrl: string }>
}) {

  const res = await getStudioList({})
  const user = await getUserAction();
  const {returnUrl, appVersion} = await searchParams;

  if (user && 'id' in user) {
    return (
      <OnboardForm
        studios={res.studios ?? []}
        user={user}
        returnUrl={returnUrl}
        appVersion={appVersion}
      />
    )
  }
}