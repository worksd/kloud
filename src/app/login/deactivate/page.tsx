import { getUserAction } from "@/app/onboarding/get.user.action";
import { DeactivateScreen } from "@/app/login/deactivate/deactivate.screen";

export default async function LoginDeactivatePage() {

  const user = await getUserAction()

  if (user) {
    return <DeactivateScreen user={user}/>
  } else {
    throw Error()
  }
}